interface Session {
  userId: string;
  token: string;
  createdAt: number;
}

export class SessionManager {
  private sessions: Map<string, Session>;
  private userSessions: Map<string, Set<string>>;
  private readonly SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7日間

  constructor() {
    this.sessions = new Map();
    this.userSessions = new Map();
  }

  async createSession(userId: string, token: string): Promise<void> {
    const session: Session = {
      userId,
      token,
      createdAt: Date.now()
    };

    this.sessions.set(token, session);

    // ユーザーのセッション一覧を更新
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)?.add(token);
  }

  async validateSession(token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (!session) {
      return false;
    }

    const now = Date.now();
    if (now - session.createdAt > this.SESSION_TIMEOUT) {
      await this.invalidateSession(token);
      return false;
    }

    return true;
  }

  async invalidateSession(token: string): Promise<void> {
    const session = this.sessions.get(token);
    if (session) {
      this.sessions.delete(token);
      const userSessions = this.userSessions.get(session.userId);
      if (userSessions) {
        userSessions.delete(token);
      }
    }
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    const userSessions = this.userSessions.get(userId);
    if (userSessions) {
      for (const token of userSessions) {
        await this.invalidateSession(token);
      }
      this.userSessions.delete(userId);
    }
  }

  async clearExpiredSessions(): Promise<void> {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (now - session.createdAt > this.SESSION_TIMEOUT) {
        await this.invalidateSession(token);
      }
    }
  }
} 