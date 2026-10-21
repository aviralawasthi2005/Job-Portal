import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { AuthController } from './auth_controller.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DETAILS_FILE = path.join(DATA_DIR, 'payment-details.json');
const ENCRYPTION_KEY_ENV = 'PAYMENT_DETAILS_ENCRYPTION_KEY';

interface PaymentDetails {
  upiId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface EncryptedPaymentDetails {
  userId: string;
  iv: string;
  authTag: string;
  ciphertext: string;
  updatedAt: string;
}

function encryptionKey(): Buffer {
  const secret = process.env[ENCRYPTION_KEY_ENV]?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(`${ENCRYPTION_KEY_ENV} must be configured with at least 32 characters.`);
  }
  return crypto.scryptSync(secret, 'pulsecareers-payment-details-v1', 32);
}

function readRecords(): EncryptedPaymentDetails[] {
  if (!fs.existsSync(DETAILS_FILE)) return [];
  const records: unknown = JSON.parse(fs.readFileSync(DETAILS_FILE, 'utf8'));
  if (!Array.isArray(records)) {
    throw new Error('Payment details data is invalid: expected a JSON array.');
  }
  return records as EncryptedPaymentDetails[];
}

function saveRecords(records: EncryptedPaymentDetails[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DETAILS_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function emptyDetails(): PaymentDetails {
  return { upiId: '', accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' };
}

function decryptDetails(record: EncryptedPaymentDetails, key: Buffer): PaymentDetails {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(record.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(record.authTag, 'hex'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(record.ciphertext, 'hex')),
    decipher.final()
  ]).toString('utf8');
  return JSON.parse(plaintext) as PaymentDetails;
}

function encryptDetails(userId: string, details: PaymentDetails, key: Buffer): EncryptedPaymentDetails {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(details), 'utf8'),
    cipher.final()
  ]);
  return {
    userId,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    ciphertext: ciphertext.toString('hex'),
    updatedAt: new Date().toISOString()
  };
}

function parseDetails(body: unknown): PaymentDetails | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const values = body as Record<string, unknown>;
  const fieldNames: (keyof PaymentDetails)[] = [
    'upiId',
    'accountHolderName',
    'bankName',
    'accountNumber',
    'ifscCode'
  ];
  if (fieldNames.some((field) => values[field] !== undefined && typeof values[field] !== 'string')) {
    return null;
  }
  return {
    upiId: (values.upiId as string | undefined)?.trim() || '',
    accountHolderName: (values.accountHolderName as string | undefined)?.trim() || '',
    bankName: (values.bankName as string | undefined)?.trim() || '',
    accountNumber: (values.accountNumber as string | undefined)?.trim() || '',
    ifscCode: (values.ifscCode as string | undefined)?.trim().toUpperCase() || ''
  };
}

function validationMessage(details: PaymentDetails): string | null {
  if (details.upiId && !/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/.test(details.upiId)) {
    return 'Enter a valid UPI ID, such as name@bank.';
  }
  if (details.upiId.length > 100) return 'UPI ID must be 100 characters or fewer.';

  const bankFields = [
    details.accountHolderName,
    details.bankName,
    details.accountNumber,
    details.ifscCode
  ];
  if (bankFields.some(Boolean) && bankFields.some((field) => !field)) {
    return 'Complete all bank account fields or clear them all.';
  }
  if (details.accountHolderName.length > 100 || details.bankName.length > 100) {
    return 'Account holder and bank names must be 100 characters or fewer.';
  }
  if (details.accountNumber && !/^\d{6,20}$/.test(details.accountNumber)) {
    return 'Enter a bank account number containing 6 to 20 digits.';
  }
  if (details.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(details.ifscCode)) {
    return 'Enter a valid 11-character IFSC code.';
  }
  return null;
}

export class PaymentDetailsController {
  public static show(req: Request, res: Response): void {
    const user = AuthController.getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Sign in to view your payment details.' });
      return;
    }

    try {
      const key = encryptionKey();
      const record = readRecords().find((entry) => entry.userId === user.id);
      res.status(200).json({
        success: true,
        data: record ? decryptDetails(record, key) : emptyDetails()
      });
    } catch (error) {
      console.error('[PaymentDetailsController] Could not load payment details:', error);
      res.status(503).json({
        success: false,
        message: error instanceof Error && error.message.startsWith(ENCRYPTION_KEY_ENV)
          ? 'Payment details are unavailable until secure encryption is configured.'
          : 'Could not load your payment details.'
      });
    }
  }

  public static update(req: Request, res: Response): void {
    const user = AuthController.getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Sign in to save your payment details.' });
      return;
    }

    const details = parseDetails(req.body);
    if (!details) {
      res.status(400).json({ success: false, message: 'Payment details must be supplied as text fields.' });
      return;
    }
    const invalid = validationMessage(details);
    if (invalid) {
      res.status(400).json({ success: false, message: invalid });
      return;
    }

    try {
      const key = encryptionKey();
      const records = readRecords();
      const record = encryptDetails(user.id, details, key);
      const existingIndex = records.findIndex((entry) => entry.userId === user.id);
      if (existingIndex === -1) records.push(record);
      else records[existingIndex] = record;
      saveRecords(records);
      res.status(200).json({ success: true, data: details, message: 'Payment details saved securely.' });
    } catch (error) {
      console.error('[PaymentDetailsController] Could not save payment details:', error);
      res.status(503).json({
        success: false,
        message: error instanceof Error && error.message.startsWith(ENCRYPTION_KEY_ENV)
          ? 'Payment details cannot be saved until secure encryption is configured.'
          : 'Could not save your payment details.'
      });
    }
  }
}
