import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScreeningRun extends Document {
  jobId: Types.ObjectId;
  startedBy: Types.ObjectId;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalCandidates: number;
  processedCandidates: number;
  progressPct: number;
  aiModel: string;
  startedAt: Date;
  finishedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const screeningRunSchema = new Schema<IScreeningRun>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    startedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['queued', 'running', 'completed', 'failed', 'cancelled'], default: 'queued' },
    totalCandidates: { type: Number, default: 0 },
    processedCandidates: { type: Number, default: 0 },
    progressPct: { type: Number, min: 0, max: 100, default: 0 },
    aiModel: { type: String, default: 'gemini-2.0-flash' },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

screeningRunSchema.index({ jobId: 1, createdAt: -1 });

export default mongoose.model<IScreeningRun>('ScreeningRun', screeningRunSchema);
