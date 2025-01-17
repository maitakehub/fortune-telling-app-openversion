import mongoose, { Document, Model } from 'mongoose';

interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: string;        // e.g. 'premium', 'basic', etc.
  active: boolean;
  startDate: Date;
  endDate?: Date;      // null or undefined if indefinite
}

const subscriptionSchema = new mongoose.Schema<ISubscription>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    default: 'free',
  },
  active: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: new Date(),
  },
  endDate: {
    type: Date,
    required: false,
  },
});

export const Subscription: Model<ISubscription> = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
