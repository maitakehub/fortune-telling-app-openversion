import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../server/src/models/User';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-telling');
    
    const users = await User.find({}); // パスワードを含むすべての情報を取得
    
    console.log('登録されているユーザー（パスワードを含む）:');
    users.forEach(user => {
      console.log('\n-------------------');
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('Password:', user.password); // ハッシュ化されたパスワード
      console.log('Role:', user.role);
      console.log('IsSubscribed:', user.isSubscribed);
      console.log('CreatedAt:', user.createdAt);
      console.log('UpdatedAt:', user.updatedAt);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

checkUsers(); 