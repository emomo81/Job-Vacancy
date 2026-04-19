import mongoose, { Schema, Document, Types } from 'mongoose';

interface Experience {
  _id?: Types.ObjectId;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CV {
  fileName: string;
  storageUrl: string;
  uploadedAt: Date | null;
}

interface Visibility {
  openToWork: boolean;
  visibleToRecruiters: boolean;
  remote: boolean;
  fulltime: boolean;
}

export interface ICandidateProfile extends Document {
  userId: Types.ObjectId | null;
  source: 'rankr' | 'external';
  fullName: string;
  professionalTitle: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  education: string;
  summary: string;
  linkedinUrl: string;
  experiences: Experience[];
  cv: {
    fileName: string;
    storageUrl: string;
    uploadedAt: Date | null;
    extractedText: string;
  };
  visibility: Visibility;
  completionPct: number;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<Experience>(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: true }
);

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    source: { type: String, enum: ['rankr', 'external'], default: 'external' },
    fullName: { type: String, required: true },
    professionalTitle: { type: String, default: '' },
    location: { type: String, default: '' },
    yearsExperience: { type: Number, min: 0, max: 50, default: 0 },
    skills: [{ type: String }],
    education: { type: String, default: '' },
    summary: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    experiences: [experienceSchema],
    cv: {
      fileName: { type: String, default: '' },
      storageUrl: { type: String, default: '' },
      uploadedAt: { type: Date, default: null },
      extractedText: { type: String, default: '' },
    },
    visibility: {
      openToWork: { type: Boolean, default: true },
      visibleToRecruiters: { type: Boolean, default: true },
      remote: { type: Boolean, default: true },
      fulltime: { type: Boolean, default: true },
    },
    completionPct: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

candidateProfileSchema.index({ userId: 1 });

export default mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);
