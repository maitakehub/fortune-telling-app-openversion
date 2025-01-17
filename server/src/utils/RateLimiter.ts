interface RequestRecord {
  count: number;
  firstRequest: number;
}

export class RateLimiter {
  private requests: Map<string, RequestRecord>;
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindow: number) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  tryRequest(ip: string): boolean {
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record) {
      this.requests.set(ip, { count: 1, firstRequest: now });
      return true;
    }

    if (now - record.firstRequest > this.timeWindow) {
      this.requests.set(ip, { count: 1, firstRequest: now });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now - record.firstRequest > this.timeWindow) {
        this.requests.delete(ip);
      }
    }
  }
} 