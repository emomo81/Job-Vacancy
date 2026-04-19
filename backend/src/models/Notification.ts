import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'application_update' | 'screening_complete' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  meta: Record<string, any>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['application_update', 'screening_complete', 'system'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    meta: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
