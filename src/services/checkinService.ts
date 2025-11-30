import { v4 as uuidv4 } from 'uuid';
import { CheckIn, Ticket, ValidationResult } from '../models/types';
import crypto from 'crypto';

const checkIns: CheckIn[] = [];
const tickets: Ticket[] = [];

export const registerTicket = (
  eventId: string,
  nftTokenId: string,
  ticketType: string,
  expiresAt: number
): Ticket => {
  const ticket: Ticket = {
    id: uuidv4(),
    eventId,
    nftTokenId,
    ticketType,
    isUsed: false,
    expiresAt,
    validationAttempts: 0,
  };
  tickets.push(ticket);
  return ticket;
};

export const getTicket = (ticketId: string): Ticket | undefined => {
  return tickets.find((t) => t.id === ticketId);
};

export const getTicketByNFTToken = (nftTokenId: string): Ticket | undefined => {
  return tickets.find((t) => t.nftTokenId === nftTokenId);
};

export const validateTicket = (ticketId: string): ValidationResult => {
  const ticket = getTicket(ticketId);

  if (!ticket) {
    return { valid: false, message: 'Ticket not found' };
  }

  if (ticket.isUsed) {
    return { valid: false, message: 'Ticket already used for check-in' };
  }

  if (ticket.expiresAt < Date.now()) {
    return { valid: false, message: 'Ticket has expired' };
  }

  if (ticket.validationAttempts > 10) {
    return { valid: false, message: 'Too many validation attempts' };
  }

  ticket.validationAttempts++;
  ticket.lastValidationAttempt = Date.now();

  return {
    valid: true,
    message: 'Ticket is valid',
    ticketId: ticket.id,
    eventId: ticket.eventId,
  };
};

export const performCheckIn = (
  ticketId: string,
  userId: string,
  nftTokenId: string,
  eventId: string,
  validationMethod: 'qr' | 'manual',
  location?: string,
  scannedBy?: string
): CheckIn | null => {
  const ticket = getTicket(ticketId);

  if (!ticket) return null;
  if (ticket.isUsed) return null;
  if (ticket.expiresAt < Date.now()) return null;

  // Mark ticket as used
  ticket.isUsed = true;
  ticket.usedAt = Date.now();

  // Create check-in record
  const checkIn: CheckIn = {
    id: uuidv4(),
    ticketId,
    nftTokenId,
    userId,
    eventId,
    qrCode: generateQRCodeData(ticketId, nftTokenId),
    status: 'valid',
    checkInTime: Date.now(),
    validationMethod,
    location,
    scannedBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  checkIns.push(checkIn);
  return checkIn;
};

export const getCheckIn = (checkInId: string): CheckIn | undefined => {
  return checkIns.find((c) => c.id === checkInId);
};

export const getUserCheckIns = (userId: string): CheckIn[] => {
  return checkIns.filter((c) => c.userId === userId);
};

export const getEventCheckIns = (eventId: string): CheckIn[] => {
  return checkIns.filter((c) => c.eventId === eventId);
};

export const getCheckInByTicket = (ticketId: string): CheckIn | undefined => {
  return checkIns.find((c) => c.ticketId === ticketId);
};

export const generateQRCodeData = (ticketId: string, nftTokenId: string): string => {
  const hash = crypto.createHash('sha256');
  hash.update(`${ticketId}-${nftTokenId}-${Date.now()}`);
  return hash.digest('hex').substring(0, 32);
};

export const getAllTickets = (): Ticket[] => {
  return tickets;
};

export const getAllCheckIns = (): CheckIn[] => {
  return checkIns;
};

export const getEventStatistics = (eventId: string) => {
  const eventCheckIns = getEventCheckIns(eventId);
  const eventTickets = tickets.filter((t) => t.eventId === eventId);

  return {
    totalTickets: eventTickets.length,
    checkedInCount: eventCheckIns.length,
    checkInRate: eventTickets.length > 0 ? (eventCheckIns.length / eventTickets.length) * 100 : 0,
    unusedTickets: eventTickets.filter((t) => !t.isUsed).length,
  };
};
