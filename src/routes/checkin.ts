import { Router } from 'express';
import * as checkinController from '../controllers/checkinController';

const router = Router();

// Ticket management
router.post('/tickets', checkinController.registerTicket);
router.get('/tickets/:ticketId', checkinController.getTicketHandler);
router.get('/tickets/:ticketId/validate', checkinController.validateTicketHandler);

// Check-in operations
router.post('/check-in', checkinController.performCheckIn);
router.get('/check-in/:checkInId', checkinController.getCheckInHandler);
router.get('/user/:userId/check-ins', checkinController.getUserCheckIns);
router.get('/event/:eventId/check-ins', checkinController.getEventCheckIns);
router.get('/event/:eventId/stats', checkinController.getEventStats);

export default router;
