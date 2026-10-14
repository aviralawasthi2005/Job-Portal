import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { AuthController } from './auth_controller.js';
import type { User } from '../../../shared/types/auth.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'razorpay-orders.json');
const MAX_CONTRIBUTION_RUPEES = 1_000_000;

type PaymentOrderStatus = 'created' | 'paid' | 'claimed' | 'consumed';

interface PaymentOrderRecord {
  id: string;
  userId: string;
  amount: number;
  currency: 'INR';
  status: PaymentOrderStatus;
  paymentId?: string;
  claimedAt?: string;
  createdAt: string;
}

function configuredCredentials(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId && !keySecret) return null;
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must both be configured.');
  }
  return { keyId, keySecret };
}

function requireEmployer(req: Request, res: Response): User | null {
  const user = AuthController.getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'Sign in to make an optional employer contribution.' });
    return null;
  }
  if (user.role !== 'employer') {
    res.status(403).json({ success: false, message: 'An employer account is required to make this contribution.' });
    return null;
  }
  return user;
}

function readOrders(): PaymentOrderRecord[] {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  const records: unknown = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  if (!Array.isArray(records)) throw new Error('Razorpay order data is invalid: expected a JSON array.');
  return records as PaymentOrderRecord[];
}

function saveOrders(orders: PaymentOrderRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

function safeSignatureEquals(expected: string, received: unknown): boolean {
  if (typeof received !== 'string' || !/^[a-f0-9]{64}$/i.test(received)) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
}

export class RazorpayController {
  public static config(_req: Request, res: Response): void {
    try {
      const credentials = configuredCredentials();
      res.status(200).json({ enabled: Boolean(credentials), keyId: credentials?.keyId });
    } catch (error) {
      console.error('[RazorpayController] Invalid gateway configuration:', error);
      res.status(503).json({ success: false, message: 'Payment gateway is incorrectly configured.' });
    }
  }

  public static async createOrder(req: Request, res: Response): Promise<void> {
    const user = requireEmployer(req, res);
    if (!user) return;

    const { amount } = req.body || {};
    if (
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      amount < 1 ||
      amount > MAX_CONTRIBUTION_RUPEES ||
      Math.round(amount * 100) !== amount * 100
    ) {
      res.status(400).json({ success: false, message: 'Enter an amount from ₹1 to ₹10,00,000 with no more than two decimal places.' });
      return;
    }

    try {
      const credentials = configuredCredentials();
      if (!credentials) {
        res.status(503).json({ success: false, message: 'Optional payments are not configured. You can still post your job for free.' });
        return;
      }

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: `job-${crypto.randomUUID()}`,
          notes: { employerId: user.id, purpose: 'optional_job_posting_contribution' }
        })
      });
      const orderData = await razorpayResponse.json() as {
        id?: string;
        amount?: number;
        currency?: string;
        error?: { description?: string };
      };
      if (!razorpayResponse.ok || !orderData.id || orderData.amount !== Math.round(amount * 100) || orderData.currency !== 'INR') {
        console.error('[RazorpayController] Order creation failed:', orderData.error?.description || razorpayResponse.statusText);
        res.status(502).json({ success: false, message: 'Could not start the Razorpay checkout. You can still post your job for free.' });
        return;
      }

      const record: PaymentOrderRecord = {
        id: orderData.id,
        userId: user.id,
        amount: orderData.amount,
        currency: 'INR',
        status: 'created',
        createdAt: new Date().toISOString()
      };
      saveOrders([record, ...readOrders()]);
      res.status(201).json({
        success: true,
        data: { id: record.id, amount: record.amount, currency: record.currency },
        keyId: credentials.keyId
      });
    } catch (error) {
      console.error('[RazorpayController] Could not create order:', error);
      res.status(502).json({ success: false, message: 'Could not start the Razorpay checkout. You can still post your job for free.' });
    }
  }

  public static async verifyPayment(req: Request, res: Response): Promise<void> {
    const user = requireEmployer(req, res);
    if (!user) return;

    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (
      typeof orderId !== 'string' ||
      typeof paymentId !== 'string' ||
      typeof signature !== 'string'
    ) {
      res.status(400).json({ success: false, message: 'Razorpay returned incomplete payment details.' });
      return;
    }

    try {
      const credentials = configuredCredentials();
      if (!credentials) {
        res.status(503).json({ success: false, message: 'Razorpay is not configured.' });
        return;
      }
      const orders = readOrders();
      const order = orders.find((candidate) => candidate.id === orderId && candidate.userId === user.id);
      if (!order || (order.status !== 'created' && order.status !== 'paid')) {
        res.status(404).json({ success: false, message: 'This payment order is unavailable or has already been used.' });
        return;
      }

      const expectedSignature = crypto
        .createHmac('sha256', credentials.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      if (!safeSignatureEquals(expectedSignature, signature)) {
        res.status(400).json({ success: false, message: 'Payment signature could not be verified.' });
        return;
      }

      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64')}`
        }
      });
      const paymentData = await paymentResponse.json() as {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
      if (
        !paymentResponse.ok ||
        paymentData.id !== paymentId ||
        paymentData.order_id !== orderId ||
        paymentData.amount !== order.amount ||
        paymentData.currency !== order.currency ||
        paymentData.status !== 'captured'
      ) {
        res.status(400).json({ success: false, message: 'Payment has not been captured or does not match this order.' });
        return;
      }

      order.status = 'paid';
      order.paymentId = paymentId;
      saveOrders(orders);
      res.status(200).json({ success: true, message: 'Payment verified.', data: { orderId: order.id } });
    } catch (error) {
      console.error('[RazorpayController] Could not verify payment:', error);
      res.status(502).json({ success: false, message: 'Could not verify the payment with Razorpay. Please contact support before retrying.' });
    }
  }

  public static claimOrderForJob(orderId: string, userId: string): boolean {
    const orders = readOrders();
    const order = orders.find((candidate) => candidate.id === orderId && candidate.userId === userId);
    if (!order || order.status !== 'paid') return false;
    order.status = 'claimed';
    order.claimedAt = new Date().toISOString();
    saveOrders(orders);
    return true;
  }

  public static releaseClaim(orderId: string, userId: string): void {
    const orders = readOrders();
    const order = orders.find((candidate) => candidate.id === orderId && candidate.userId === userId);
    if (order?.status === 'claimed') {
      order.status = 'paid';
      delete order.claimedAt;
      saveOrders(orders);
    }
  }

  public static consumeClaim(orderId: string, userId: string): void {
    const orders = readOrders();
    const order = orders.find((candidate) => candidate.id === orderId && candidate.userId === userId);
    if (order?.status !== 'claimed') {
      throw new Error('Claimed Razorpay order is unavailable.');
    }
    order.status = 'consumed';
    saveOrders(orders);
  }
}
