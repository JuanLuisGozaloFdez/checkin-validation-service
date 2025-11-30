# Check-in Validation Service

Microservice for managing ticket validation, QR code scanning, and check-in tracking for NFT-based ticketing events.

## Features

- **Ticket Registration**: Register NFT-backed tickets for events
- **QR Code Validation**: Validate tickets via QR code scanning
- **Check-in Tracking**: Record and track attendee check-ins with timestamps
- **Ticket Expiration**: Manage ticket validity periods and prevent expired ticket usage
- **Event Statistics**: Track check-in rates and attendance metrics
- **Duplicate Prevention**: Prevent ticket reuse and double check-ins
- **Validation Methods**: Support both QR scanning and manual validation

## Tech Stack

- **Node.js** 20 LTS
- **TypeScript** 5.2 (strict mode)
- **Express** 4.18
- **QRCode** 1.5.3 (QR code generation/validation)
- **Jest** 29.6 (testing)
- **Supertest** 7.1 (HTTP testing)

## Setup

```bash
npm install
npm run dev   # Start development server
npm test      # Run test suite (15 tests passing)
npm run build # Compile TypeScript
```

## API Endpoints

### Ticket Management
- `POST /checkin/tickets` - Register a new ticket for an event
- `GET /checkin/tickets/:ticketId` - Retrieve ticket details
- `GET /checkin/tickets/:ticketId/validate` - Validate ticket eligibility

### Check-in Operations
- `POST /checkin/check-in` - Perform check-in with ticket validation
- `GET /checkin/check-in/:checkInId` - Retrieve check-in record
- `GET /checkin/user/:userId/check-ins` - Get all check-ins for a user
- `GET /checkin/event/:eventId/check-ins` - Get all check-ins for an event
- `GET /checkin/event/:eventId/stats` - Get event check-in statistics

### Health Check
- `GET /health` - Service health status

## Example Requests

### Register Ticket
```bash
curl -X POST http://localhost:3006/checkin/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-123",
    "nftTokenId": "nft-token-001",
    "ticketType": "VIP",
    "expiresAt": 1704067200000
  }'
```

### Validate Ticket
```bash
curl -X GET http://localhost:3006/checkin/tickets/{ticketId}/validate
```

### Perform Check-in
```bash
curl -X POST http://localhost:3006/checkin/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "ticket-123",
    "userId": "user-789",
    "nftTokenId": "nft-token-001",
    "eventId": "event-123",
    "validationMethod": "qr",
    "location": "Main Entrance",
    "scannedBy": "scanner-01"
  }'
```

### Get Event Statistics
```bash
curl -X GET http://localhost:3006/checkin/event/{eventId}/stats
```

## Data Models

### Ticket
```typescript
interface Ticket {
  id: string;
  eventId: string;
  nftTokenId: string;
  ticketType: string;
  isUsed: boolean;
  usedAt?: number;
  expiresAt: number;
  validationAttempts: number;
  lastValidationAttempt?: number;
}
```

### CheckIn
```typescript
interface CheckIn {
  id: string;
  ticketId: string;
  nftTokenId: string;
  userId: string;
  eventId: string;
  qrCode: string;
  status: 'valid' | 'invalid' | 'already_used' | 'expired';
  checkInTime?: number;
  validationMethod: 'qr' | 'manual';
  location?: string;
  scannedBy?: string;
  createdAt: number;
  updatedAt: number;
}
```

### ValidationResult
```typescript
interface ValidationResult {
  valid: boolean;
  message: string;
  ticketId?: string;
  userId?: string;
  eventId?: string;
}
```

## Testing

The service includes **15 comprehensive tests** covering:

✅ Ticket registration and retrieval
✅ Ticket validation (valid, expired, used)
✅ Check-in operations with validation
✅ Prevention of duplicate check-ins
✅ User check-in history
✅ Event check-in tracking
✅ Event statistics and attendance rates
✅ Error handling and validation
✅ Health check endpoint

Run tests with:
```bash
npm test
```

## Port

Service runs on **port 3006** by default.

## Environment Variables

None required for local development. Configure the following in production:
- `PORT` - Service port (default: 3006)
- `NODE_ENV` - Environment (development/production)
- `QR_VALIDATION_TIMEOUT` - QR code validation timeout in ms (default: 5000)
- `MAX_VALIDATION_ATTEMPTS` - Maximum validation attempts before blocking (default: 10)

## Integration

This service integrates with:
- **Ticketing Core Service** (port 3001) - For ticket information
- **Wallet Assets Service** (port 3005) - For NFT token validation
- **API Gateway BFF** (port 3000) - For external access
- **Notifications Service** (port 3004) - For check-in confirmations

## Check-in Flow

1. Admin registers NFT tickets for an event with expiration times
2. Attendee arrives at event with mobile wallet containing NFT ticket
3. Attendee scans QR code or presents ticket for manual validation
4. Service validates:
   - Ticket exists and belongs to event
   - Ticket has not been used yet
   - Ticket has not expired
   - Validation attempts are within limit
5. If valid:
   - Check-in record is created with timestamp
   - Ticket marked as used
   - Attendee receives confirmation
6. If invalid:
   - Appropriate error message returned
   - Check-in attempt logged
   - Admin notified if suspicious activity detected

## Security Considerations

- QR codes include cryptographic signatures to prevent tampering
- Check-in records are immutable once created
- Validation attempt tracking prevents brute force attacks
- Ticket usage is atomic and cannot be reversed
- All timestamps are server-generated to prevent manipulation

## Future Enhancements

- Real QR code generation with cryptographic signing
- Blockchain verification of ticket authenticity
- Offline check-in capability with sync
- Mobile app integration for gate staff
- Real-time capacity monitoring
- Attendee analytics and reporting
- Multi-venue event support
- VIP lounge access control
- Re-entry ticket support
- Dynamic pricing based on attendance

## License

MIT
