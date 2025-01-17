import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './db';
import authRoutes from './routes/authRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import fortuneRoutes from './routes/fortuneRoutes';

dotenv.config();

const app = express();

// CORS設定
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ミドルウェア
app.use(bodyParser.json());

// CSPヘッダーの設定
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
  );
  next();
});

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ルーティング
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/fortune', fortuneRoutes);

// ルートパスのハンドラー
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Fortune Telling API Server' });
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// DBに接続してサーバー起動
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
