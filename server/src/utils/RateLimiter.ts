import Redis from 'ioredis';
import { createLogger } from './logger';

const logger = createLogger('RateLimiter');

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  whitelistedIPs?: string[];
  whitelistedUsers?: string[];
}

export type RateLimitActionType = 'ip' | 'user' | 'signup' | 'login';

export class RateLimiter {
  private static instance: RateLimiter;
  private readonly redis: Redis;
  private readonly config: RateLimitConfig;

  private constructor() {
    this.redis = new Redis();
    this.config = {
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分
      whitelistedIPs: [],
      whitelistedUsers: []
    };
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private getKey(identifier: string, type: RateLimitActionType = 'ip'): string {
    return `ratelimit:${type}:${identifier}`;
  }

  public async isAllowed(identifier: string, type: RateLimitActionType = 'ip'): Promise<boolean> {
    try {
      // ホワイトリストのチェック
      if (type === 'ip' && this.config.whitelistedIPs?.includes(identifier)) {
        return true;
      }
      if (type === 'user' && this.config.whitelistedUsers?.includes(identifier)) {
        return true;
      }

      const key = this.getKey(identifier, type);
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      // 期間内のリクエスト数を取得
      const requests = await this.redis.zcount(key, windowStart, now);
      
      // 制限を超えていないかチェック
      return requests < this.config.maxRequests;
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return true; // エラーの場合は安全のため許可
    }
  }

  public async increment(identifier: string, type: RateLimitActionType = 'ip'): Promise<void> {
    try {
      const key = this.getKey(identifier, type);
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      const multi = this.redis.multi();
      
      // 期限切れのエントリーを削除
      multi.zremrangebyscore(key, 0, windowStart);
      
      // 新しいリクエストを追加
      multi.zadd(key, now, `${now}:${Math.random()}`);
      
      // キーの有効期限を設定
      multi.expire(key, Math.ceil(this.config.windowMs / 1000));
      
      await multi.exec();
    } catch (error) {
      logger.error('Rate limit increment error:', error);
    }
  }

  public async reset(identifier: string, type: RateLimitActionType = 'ip'): Promise<void> {
    try {
      const key = this.getKey(identifier, type);
      await this.redis.del(key);
    } catch (error) {
      logger.error('Rate limit reset error:', error);
    }
  }

  public addToWhitelist(identifier: string, type: RateLimitActionType = 'ip'): void {
    if (type === 'ip') {
      this.config.whitelistedIPs?.push(identifier);
    } else if (type === 'user') {
      this.config.whitelistedUsers?.push(identifier);
    }
  }

  public removeFromWhitelist(identifier: string, type: RateLimitActionType = 'ip'): void {
    if (type === 'ip') {
      this.config.whitelistedIPs = this.config.whitelistedIPs?.filter(ip => ip !== identifier);
    } else if (type === 'user') {
      this.config.whitelistedUsers = this.config.whitelistedUsers?.filter(user => user !== identifier);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }
} 