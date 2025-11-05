/**
 * Simple in-memory rate limiting
 * For production, consider using Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private requestsPerWindow: number;
  private windowMs: number;

  constructor(requestsPerWindow: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.requestsPerWindow = requestsPerWindow;
    this.windowMs = windowMs;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  check(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New entry or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= this.requestsPerWindow) {
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  }

  getStatus(key: string): { remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      return {
        remaining: this.requestsPerWindow,
        resetTime: now + this.windowMs,
      };
    }

    return {
      remaining: Math.max(0, this.requestsPerWindow - entry.count),
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create global rate limiter instance
const limiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

/**
 * Check if request is within rate limit
 * Key should be IP address or user ID
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const allowed = limiter.check(key);
  const status = limiter.getStatus(key);

  return {
    allowed,
    remaining: status.remaining,
    resetTime: status.resetTime,
  };
}

/**
 * Get rate limit status without incrementing counter
 */
export function getRateLimitStatus(key: string) {
  return limiter.getStatus(key);
}
