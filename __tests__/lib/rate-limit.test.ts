import { checkRateLimit, getRateLimitStatus } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow request within limit', () => {
      const result = checkRateLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThan(100);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should track remaining requests', () => {
      const key = 'user-456';

      // First request
      const result1 = checkRateLimit(key);
      const remaining1 = result1.remaining;

      // Second request
      const result2 = checkRateLimit(key);
      const remaining2 = result2.remaining;

      expect(remaining2).toBeLessThan(remaining1);
      expect(result2.allowed).toBe(true);
    });

    it('should return reset time', () => {
      const result = checkRateLimit('user-789');

      expect(result.resetTime).toBeGreaterThan(Date.now());
      expect(result.resetTime - Date.now()).toBeCloseTo(15 * 60 * 1000, -2);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current status without incrementing', () => {
      const key = 'status-test';

      // Get status
      const status1 = getRateLimitStatus(key);
      const status2 = getRateLimitStatus(key);

      expect(status1.remaining).toBe(status2.remaining);
      expect(status1.remaining).toBe(100); // Full limit
    });

    it('should show updated status after checkRateLimit', () => {
      const key = 'updated-status';

      const statusBefore = getRateLimitStatus(key);
      checkRateLimit(key);
      const statusAfter = getRateLimitStatus(key);

      expect(statusAfter.remaining).toBeLessThan(statusBefore.remaining);
    });
  });

  describe('Rate limit behavior', () => {
    it('should have different limits for different keys', () => {
      const result1 = checkRateLimit('key-1');
      const result2 = checkRateLimit('key-2');

      // Both should have full remaining count initially
      expect(result1.remaining).toBe(99); // 100 - 1 for first request
      expect(result2.remaining).toBe(99);
    });

    it('should track requests per key independently', () => {
      const key1 = 'user-a';
      const key2 = 'user-b';

      // Make 5 requests for key1
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key1);
      }

      // Make 2 requests for key2
      for (let i = 0; i < 2; i++) {
        checkRateLimit(key2);
      }

      const status1 = getRateLimitStatus(key1);
      const status2 = getRateLimitStatus(key2);

      expect(status1.remaining).toBe(95); // 100 - 5
      expect(status2.remaining).toBe(98); // 100 - 2
    });
  });
});
