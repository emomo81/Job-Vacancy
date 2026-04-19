import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJobCandidatePool extends Document {
  jobId: Types.ObjectId;
  candidateProfileId: Types.ObjectId;
  source: 'rankr' | 'external';
  addedBy: Types.ObjectId;
  status: 'pending_screening' | 'screened' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const jobCandidatePoolSchema = new Schema<IJobCandidatePool>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateProfileId: { type: Schema.Types.ObjectId, ref: 'CandidateProfile', required: true },
    source: { type: String, enum: ['rankr', 'external'], default: 'external' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending_screening', 'screened', 'removed'], default: 'pending_screening' },
  },
  { timestamps: true }
);

jobCandidatePoolSchema.index({ jobId: 1, candidateProfileId: 1 }, { unique: true });
jobCandidatePoolSchema.index({ jobId: 1, status: 1 });

export default mongoose.model<IJobCandidatePool>('JobCandidatePool', jobCandidatePoolSchema);
