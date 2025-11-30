import request from 'supertest';
import app from '../src/app';
import * as checkinService from '../src/services/checkinService';

describe('Check-in Validation Service', () => {
  const testEventId = 'event-123';
  const testUserId = 'user-789';
  const testNFTTokenId = 'nft-token-001';
  const expiresAt = Date.now() + 86400000; // 24 hours from now

  describe('POST /checkin/tickets - Register Ticket', () => {
    test('should register a new ticket', async () => {
      const res = await request(app).post('/checkin/tickets').send({
        eventId: testEventId,
        nftTokenId: testNFTTokenId,
        ticketType: 'VIP',
        expiresAt,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.eventId).toBe(testEventId);
      expect(res.body.isUsed).toBe(false);
    });

    test('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/checkin/tickets').send({ eventId: testEventId });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /checkin/tickets/:ticketId - Get Ticket', () => {
    test('should retrieve a ticket by ID', async () => {
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiresAt);
      const res = await request(app).get(`/checkin/tickets/${ticket.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(ticket.id);
      expect(res.body.ticketType).toBe('VIP');
    });

    test('should return 404 for non-existent ticket', async () => {
      const res = await request(app).get('/checkin/tickets/non-existent');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /checkin/tickets/:ticketId/validate - Validate Ticket', () => {
    test('should validate a valid ticket', async () => {
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiresAt);
      const res = await request(app).get(`/checkin/tickets/${ticket.id}/validate`);
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.message).toContain('valid');
    });

    test('should reject expired ticket', async () => {
      const expiredAt = Date.now() - 1000; // expired 1 second ago
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiredAt);
      const res = await request(app).get(`/checkin/tickets/${ticket.id}/validate`);
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.message).toContain('expired');
    });
  });

  describe('POST /checkin/check-in - Perform Check-in', () => {
    test('should successfully check-in with valid ticket', async () => {
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiresAt);
      const res = await request(app).post('/checkin/check-in').send({
        ticketId: ticket.id,
        userId: testUserId,
        nftTokenId: testNFTTokenId,
        eventId: testEventId,
        validationMethod: 'qr',
        location: 'Main Entrance',
        scannedBy: 'scanner-01',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('valid');
      expect(res.body.checkInTime).toBeDefined();
    });

    test('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/checkin/check-in').send({
        ticketId: 'some-id',
        userId: testUserId,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should fail check-in with already used ticket', async () => {
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiresAt);
      // First check-in
      checkinService.performCheckIn(ticket.id, testUserId, testNFTTokenId, testEventId, 'qr');
      // Second check-in should fail
      const res = await request(app).post('/checkin/check-in').send({
        ticketId: ticket.id,
        userId: testUserId,
        nftTokenId: testNFTTokenId,
        eventId: testEventId,
        validationMethod: 'qr',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('failed');
    });
  });

  describe('GET /checkin/check-in/:checkInId - Get Check-in Record', () => {
    test('should retrieve a check-in record', async () => {
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiresAt);
      const checkIn = checkinService.performCheckIn(ticket.id, testUserId, testNFTTokenId, testEventId, 'qr');
      const res = await request(app).get(`/checkin/check-in/${checkIn!.id}`);
      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(testUserId);
      expect(res.body.validationMethod).toBe('qr');
    });

    test('should return 404 for non-existent check-in', async () => {
      const res = await request(app).get('/checkin/check-in/non-existent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /checkin/user/:userId/check-ins - Get User Check-ins', () => {
    test('should retrieve all check-ins for a user', async () => {
      const ticket1 = checkinService.registerTicket(testEventId, 'nft-001', 'VIP', expiresAt);
      const ticket2 = checkinService.registerTicket(testEventId, 'nft-002', 'Standard', expiresAt);
      checkinService.performCheckIn(ticket1.id, testUserId, 'nft-001', testEventId, 'qr');
      checkinService.performCheckIn(ticket2.id, testUserId, 'nft-002', testEventId, 'manual');
      const res = await request(app).get(`/checkin/user/${testUserId}/check-ins`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /checkin/event/:eventId/check-ins - Get Event Check-ins', () => {
    test('should retrieve all check-ins for an event', async () => {
      const ticket = checkinService.registerTicket(testEventId, testNFTTokenId, 'VIP', expiresAt);
      checkinService.performCheckIn(ticket.id, testUserId, testNFTTokenId, testEventId, 'qr');
      const res = await request(app).get(`/checkin/event/${testEventId}/check-ins`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /checkin/event/:eventId/stats - Get Event Statistics', () => {
    test('should retrieve event check-in statistics', async () => {
      const ticket1 = checkinService.registerTicket(testEventId, 'nft-s1', 'VIP', expiresAt);
      const ticket2 = checkinService.registerTicket(testEventId, 'nft-s2', 'Standard', expiresAt);
      checkinService.performCheckIn(ticket1.id, testUserId, 'nft-s1', testEventId, 'qr');
      const res = await request(app).get(`/checkin/event/${testEventId}/stats`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalTickets');
      expect(res.body).toHaveProperty('checkedInCount');
      expect(res.body).toHaveProperty('checkInRate');
      expect(res.body.totalTickets).toBeGreaterThan(0);
    });
  });

  describe('GET /health - Health Check', () => {
    test('should return service health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('checkin-validation-service');
    });
  });
});
