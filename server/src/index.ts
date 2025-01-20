import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, testConnection } from './db';
import authRoutes from './routes/authRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import fortuneRoutes from './routes/fortuneRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import userPreferencesRoutes from './routes/userPreferencesRoutes';
import fortuneHistoryRoutes from './routes/fortuneHistoryRoutes';
import { createLogger } from './utils/logger';

dotenv.config();

export const app = express();

const logger = createLogger('Server');
const port = process.env.PORT || 3001;

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
  ],
  credentials: true
}));

// ミドルウェア
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CSPヘッダーの設定
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
  );
  next();
});

// ヘルスチェックエンドポイント
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({ 
    status: 'ok',
    database: {
      state: dbState,
      status: dbStatus[dbState as keyof typeof dbStatus],
      connected: dbState === 1
    },
    timestamp: new Date().toISOString()
  });
});

// ルーティング
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/history', fortuneHistoryRoutes);

// ルートパスのハンドラー
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Fortune Telling API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

async function startServer() {
  try {
    // データベース接続
    await connectDB();
    logger.info('MongoDB connected successfully');

    // サーバー起動
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // グレースフルシャットダウンの処理
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  try {
    logger.info('Received shutdown signal');
    // TODO: 必要に応じて接続のクリーンアップを追加

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

startServer();
