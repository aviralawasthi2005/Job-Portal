import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthController } from './auth_controller.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'support-tickets.json');

const CATEGORIES = ['Account access', 'Applications', 'Job listings', 'Employer support', 'Other'] as const;
const STATUSES = ['open', 'in_progress', 'resolved'] as const;
const PRIORITIES = ['low', 'normal', 'high'] as const;

type TicketCategory = (typeof CATEGORIES)[number];
type TicketStatus = (typeof STATUSES)[number];
type TicketPriority = (typeof PRIORITIES)[number];

interface SupportTicket {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  message: string;
  staffReply?: string;
  createdAt: string;
  updatedAt: string;
}

function readTickets(): SupportTicket[] {
  if (!fs.existsSync(TICKETS_FILE)) return [];
  const tickets: unknown = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8'));
  if (!Array.isArray(tickets)) {
    throw new Error('Support ticket data is invalid: expected a JSON array.');
  }
  return tickets as SupportTicket[];
}

function saveTickets(tickets: SupportTicket[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), 'utf8');
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T);
}

export class SupportTicketsController {
  public static index(req: Request, res: Response): void {
    const user = AuthController.getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Sign in to view support requests.' });
      return;
    }

    try {
      const tickets = readTickets()
        .filter((ticket) => user.role === 'admin' || ticket.userId === user.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      console.error('[SupportTicketsController] Could not load support requests:', error);
      res.status(500).json({ success: false, message: 'Could not load support requests.' });
    }
  }

  public static create(req: Request, res: Response): void {
    const user = AuthController.getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Sign in to contact customer support.' });
      return;
    }

    const { subject, category, priority, message } = req.body || {};
    if (typeof subject !== 'string' || subject.trim().length < 4 || subject.trim().length > 120) {
      res.status(400).json({ success: false, message: 'Subject must be between 4 and 120 characters.' });
      return;
    }
    if (!isOneOf(category, CATEGORIES) || !isOneOf(priority, PRIORITIES)) {
      res.status(400).json({ success: false, message: 'Choose a valid support category and priority.' });
      return;
    }
    if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
      res.status(400).json({ success: false, message: 'Message must be between 10 and 5,000 characters.' });
      return;
    }

    try {
      const now = new Date().toISOString();
      const ticket: SupportTicket = {
        id: `SUP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        subject: subject.trim(),
        category,
        priority,
        status: 'open',
        message: message.trim(),
        createdAt: now,
        updatedAt: now
      };
      saveTickets([ticket, ...readTickets()]);
      res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      console.error('[SupportTicketsController] Could not create support request:', error);
      res.status(500).json({ success: false, message: 'Could not save your support request.' });
    }
  }

  public static update(req: Request, res: Response): void {
    const user = AuthController.getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Sign in to manage support requests.' });
      return;
    }
    if (user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator access is required.' });
      return;
    }

    const { status, staffReply } = req.body || {};
    if (!isOneOf(status, STATUSES)) {
      res.status(400).json({ success: false, message: 'Choose a valid ticket status.' });
      return;
    }
    if (staffReply !== undefined && (typeof staffReply !== 'string' || staffReply.length > 5000)) {
      res.status(400).json({ success: false, message: 'Staff reply must be 5,000 characters or fewer.' });
      return;
    }

    try {
      const tickets = readTickets();
      const ticketIndex = tickets.findIndex((ticket) => ticket.id === req.params.id);
      if (ticketIndex === -1) {
        res.status(404).json({ success: false, message: 'Support request not found.' });
        return;
      }

      const ticket = tickets[ticketIndex];
      ticket.status = status;
      if (staffReply !== undefined) ticket.staffReply = staffReply.trim() || undefined;
      ticket.updatedAt = new Date().toISOString();
      saveTickets(tickets);
      res.status(200).json({ success: true, data: ticket });
    } catch (error) {
      console.error('[SupportTicketsController] Could not update support request:', error);
      res.status(500).json({ success: false, message: 'Could not update support request.' });
    }
  }
}
