export interface CheckIn {
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

export interface Ticket {
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

export interface QRCodeData {
  ticketId: string;
  nftTokenId: string;
  userId: string;
  eventId: string;
  timestamp: number;
  signature: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  ticketId?: string;
  userId?: string;
  eventId?: string;
}
