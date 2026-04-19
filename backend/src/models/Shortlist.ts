import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IShortlist extends Document {
  jobId: Types.ObjectId;
  candidateProfileId: Types.ObjectId;
  addedBy: Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const shortlistSchema = new Schema<IShortlist>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateProfileId: { type: Schema.Types.ObjectId, ref: 'CandidateProfile', required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

shortlistSchema.index({ jobId: 1, candidateProfileId: 1 }, { unique: true });

export default mongoose.model<IShortlist>('Shortlist', shortlistSchema);
