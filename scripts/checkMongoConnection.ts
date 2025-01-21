import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  try {
    console.log('MongoDB接続を試みています...');
    console.log('接続URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-telling');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-telling', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log('MongoDB接続成功！');
    
    const dbState = mongoose.connection.readyState;
    const stateMap = {
      0: '切断',
      1: '接続済み',
      2: '接続中',
      3: '切断中'
    } as const;
    
    console.log('接続状態:', stateMap[dbState as keyof typeof stateMap]);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
  }
}

checkConnection(); 