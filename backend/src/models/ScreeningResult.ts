import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScreeningResult extends Document {
  screeningRunId: Types.ObjectId;
  jobId: Types.ObjectId;
  candidateProfileId: Types.ObjectId;
  score: number;
  recommendation: 'hire' | 'consider' | 'pass';
  matchedSkills: string[];
  strengths: string[];
  gaps: string[];
  reasoning: string;
  rank: number;
  source: 'rankr' | 'external';
  createdAt: Date;
  updatedAt: Date;
}

const screeningResultSchema = new Schema<IScreeningResult>(
  {
    screeningRunId: { type: Schema.Types.ObjectId, ref: 'ScreeningRun', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateProfileId: { type: Schema.Types.ObjectId, ref: 'CandidateProfile', required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    recommendation: { type: String, enum: ['hire', 'consider', 'pass'], required: true },
    matchedSkills: [{ type: String }],
    strengths: [{ type: String }],
    gaps: [{ type: String }],
    reasoning: { type: String, default: '' },
    rank: { type: Number, default: 0 },
    source: { type: String, enum: ['rankr', 'external'], default: 'external' },
  },
  { timestamps: true }
);

screeningResultSchema.index({ screeningRunId: 1, candidateProfileId: 1 }, { unique: true });
screeningResultSchema.index({ jobId: 1, score: -1 });

export default mongoose.model<IScreeningResult>('ScreeningResult', screeningResultSchema);
