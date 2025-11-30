import { Request, Response } from 'express';
import * as checkinService from '../services/checkinService';

export const registerTicket = (req: Request, res: Response) => {
  try {
    const { eventId, nftTokenId, ticketType, expiresAt } = req.body;
    if (!eventId || !nftTokenId || !ticketType || !expiresAt) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const ticket = checkinService.registerTicket(eventId, nftTokenId, ticketType, expiresAt);
    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTicketHandler = (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const ticket = checkinService.getTicket(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const validateTicketHandler = (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const result = checkinService.validateTicket(ticketId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const performCheckIn = (req: Request, res: Response) => {
  try {
    const { ticketId, userId, nftTokenId, eventId, validationMethod, location, scannedBy } = req.body;
    if (!ticketId || !userId || !nftTokenId || !eventId || !validationMethod) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    const checkIn = checkinService.performCheckIn(
      ticketId,
      userId,
      nftTokenId,
      eventId,
      validationMethod,
      location,
      scannedBy
    );
    if (!checkIn) return res.status(400).json({ error: 'Check-in failed - invalid ticket' });
    res.status(201).json(checkIn);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCheckInHandler = (req: Request, res: Response) => {
  try {
    const { checkInId } = req.params;
    const checkIn = checkinService.getCheckIn(checkInId);
    if (!checkIn) return res.status(404).json({ error: 'Check-in record not found' });
    res.json(checkIn);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserCheckIns = (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const checkIns = checkinService.getUserCheckIns(userId);
    res.json(checkIns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventCheckIns = (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const checkIns = checkinService.getEventCheckIns(eventId);
    res.json(checkIns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventStats = (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const stats = checkinService.getEventStatistics(eventId);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
