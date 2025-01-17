import { Request, Response } from 'express';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_TO_YOUR_OWN_SECRET';

export class SubscriptionController {
  static async subscribe(req: Request, res: Response) {
    try {
      // リクエストヘッダのAuthorizationからトークンを取得
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided.' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // 既存のサブスクリプションの終わりを強制的にactive=falseにするなどの手続き
      await Subscription.updateMany(
        { userId: user._id, active: true },
        { active: false }
      );

      const { plan } = req.body; // e.g. { plan: 'premium' }
      const newSubscription = new Subscription({
        userId: user._id,
        plan,
        active: true,
        startDate: new Date(),
        // endDate: 何らかの決済情報などから取得してもよい
      });
      await newSubscription.save();

      // ユーザーにフラグを立てる
      user.isSubscribed = true;
      await user.save();

      res.json({
        message: 'Subscription updated.',
        subscription: {
          plan: newSubscription.plan,
          startDate: newSubscription.startDate,
          active: newSubscription.active,
        },
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ message: 'Server error on subscription.' });
    }
  }

  static async getSubscriptionStatus(req: Request, res: Response) {
    try {
      // JWTトークンからユーザーを特定
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided.' });
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const subs = await Subscription.findOne({ userId: user._id, active: true });
      if (!subs) {
        return res.json({ isSubscribed: false, plan: 'free' });
      }

      res.json({
        isSubscribed: true,
        plan: subs.plan,
        startDate: subs.startDate,
        endDate: subs.endDate || null,
      });
    } catch (error) {
      console.error('Subscription status error:', error);
      res.status(500).json({ message: 'Server error on subscription status.' });
    }
  }
}
