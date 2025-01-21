import mongoose from 'mongoose';
import { createLogger } from './utils/logger';

const logger = createLogger('Database');

export async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-telling';
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      logger.info('Connecting to MongoDB...', { uri: mongoUri });
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info('MongoDB connected successfully');
      
      // データベース接続テスト
      const collections = await mongoose.connection.db.listCollections().toArray();
      logger.info('Available collections:', collections.map(c => c.name));
      
      return;
    } catch (error) {
      retryCount++;
      logger.error(`Failed to connect to MongoDB (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount === maxRetries) {
        logger.error('Max retries reached. Could not connect to MongoDB.');
        throw error;
      }
      
      // 再試行前に待機
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

export async function testDatabaseConnection(): Promise<void> {
  try {
    logger.info('Testing database connection...');
    const state = mongoose.connection.readyState;
    logger.info('Connection state:', state);
    
    if (state === 1) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      logger.info('Available collections:', collections.map(c => c.name));
      logger.info('Database connection test successful');
    } else {
      throw new Error('Database not connected');
    }
  } catch (error) {
    logger.error('Database connection test failed:', error);
    throw error;
  }
}

// エクスポート名の変更
export const connectDB = connectToDatabase;
export const testConnection = testDatabaseConnection;
