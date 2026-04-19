import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateProfileId: Types.ObjectId;
  candidateUserId: Types.ObjectId | null;
  status: 'applied' | 'in_review' | 'shortlisted' | 'rejected' | 'hired';
  matchScore: number;
  feedback: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateProfileId: { type: Schema.Types.ObjectId, ref: 'CandidateProfile', required: true },
    candidateUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['applied', 'in_review', 'shortlisted', 'rejected', 'hired'], default: 'applied' },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    feedback: { type: String, default: 'Application received and pending initial screening.' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, candidateProfileId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', applicationSchema);
