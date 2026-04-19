import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'recruiter' | 'candidate' | 'admin';
  fullName: string;
  organizationId: mongoose.Types.ObjectId | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['recruiter', 'candidate', 'admin'], required: true },
    fullName: { type: String, required: true, trim: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    avatarUrl: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
