import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../types/user';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  birthDate?: Date;
  birthTime?: string;
  gender?: 'male' | 'female' | 'other';
  zodiacSign?: string;
  profileImage?: string;
  role: UserRole;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  subscriptionEndDate?: Date;
  lastLoginDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'メールアドレスは必須です'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'メールアドレスの形式が正しくありません'
    }
  },
  password: {
    type: String,
    required: [true, 'パスワードは必須です'],
    minlength: [8, 'パスワードは8文字以上である必要があります'],
    select: false
  },
  name: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  birthTime: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  zodiacSign: {
    type: String
  },
  profileImage: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'test'],
    default: process.env.NODE_ENV === 'test' ? 'test' : 'user'
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', null],
    default: null
  },
  subscriptionEndDate: {
    type: Date
  },
  lastLoginDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('パスワードの比較に失敗しました');
  }
};

// パスワードの自動ハッシュ化
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
