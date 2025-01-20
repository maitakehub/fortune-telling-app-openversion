import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import fortuneRoutes from './routes/fortuneRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import chatRoutes from './routes/chatRoutes';
import userPreferencesRoutes from './routes/userPreferencesRoutes';
import fortuneHistoryRoutes from './routes/fortuneHistoryRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ミドルウェアの設定
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/history', fortuneHistoryRoutes);

// エラーハンドリングミドルウェアの適用（必ず他のミドルウェアの後に配置）
app.use(errorHandler);

export default app; 