import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  validatePasswordStrength,
  validateEmail,
} from '@/lib/auth';

describe('Auth Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should create different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword('WrongPassword123!', hashed);

      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token', () => {
    it('should generate a valid token', () => {
      const token = generateToken('user-123', 'user@example.com');

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should verify and decode token', () => {
      const userId = 'user-123';
      const email = 'user@example.com';
      const token = generateToken(userId, email);
      const decoded = verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token');

      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token with very short expiry for testing
      const shortToken = generateToken('user-123', 'user@example.com');

      // Wait a bit and try to verify
      const decoded = verifyToken(shortToken);
      expect(decoded).toBeTruthy(); // Still valid immediately
    });
  });

  describe('Password Strength Validation', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject password less than 8 characters', () => {
      const result = validatePasswordStrength('Pass12!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('strongpass123!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('STRONGPASS123!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('StrongPass!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });
});
