import mongoose, { Schema, Document, Types } from 'mongoose';

// ── Existing interfaces (unchanged) ──────────────────────────────────────────

interface Experience {
  _id?: Types.ObjectId;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  // NEW per schema 3.3
  technologies: string[];
  isCurrent: boolean;
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

// ── NEW interfaces (schema sections 3.2, 3.5, 3.6, 3.7, 3.8) ─────────────────

interface Language {
  _id?: Types.ObjectId;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface Certification {
  _id?: Types.ObjectId;
  name: string;
  issuer: string;
  issueDate: string; // YYYY-MM
  imageUrl: string;  // base64 data URL of certificate scan/photo
}

interface Project {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string; // YYYY-MM
  endDate: string;   // YYYY-MM
}

// ── Main document interface ───────────────────────────────────────────────────

export interface ICandidateProfile extends Document {
  // Existing fields (unchanged)
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
  email: string;
  phone: string;
  whatsappNumber: string;
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

  // NEW fields (schema spec — additive only, no existing fields touched)
  avatarUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  availabilityStatus: 'Available' | 'Open to Opportunities' | 'Not Available';
  availabilityType: 'Full-time' | 'Part-time' | 'Contract';
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
}

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const experienceSchema = new Schema<Experience>(
  {
    role:         { type: String, required: true },
    company:      { type: String, required: true },
    startDate:    { type: String, required: true },
    endDate:      { type: String, required: true },
    description:  { type: String, required: true },
    technologies: [{ type: String }],
    isCurrent:    { type: Boolean, default: false },
  },
  { _id: true }
);

const languageSchema = new Schema<Language>(
  {
    name:        { type: String, required: true },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
      default: 'Fluent',
    },
  },
  { _id: true }
);

const certificationSchema = new Schema<Certification>(
  {
    name:      { type: String, required: true },
    issuer:    { type: String, default: '' },
    issueDate: { type: String, default: '' },
    imageUrl:  { type: String, default: '' },
  },
  { _id: true }
);

const projectSchema = new Schema<Project>(
  {
    name:         { type: String, required: true },
    description:  { type: String, default: '' },
    technologies: [{ type: String }],
    role:         { type: String, default: '' },
    link:         { type: String, default: '' },
    startDate:    { type: String, default: '' },
    endDate:      { type: String, default: '' },
  },
  { _id: true }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    // Existing fields (unchanged)
    userId:            { type: Schema.Types.ObjectId, ref: 'User', default: null },
    source:            { type: String, enum: ['rankr', 'external'], default: 'external' },
    fullName:          { type: String, required: true },
    professionalTitle: { type: String, default: '' },
    location:          { type: String, default: '' },
    yearsExperience:   { type: Number, min: 0, max: 50, default: 0 },
    skills:            [{ type: String }],
    education:         { type: String, default: '' },
    summary:           { type: String, default: '' },
    linkedinUrl:       { type: String, default: '' },
    email:             { type: String, default: '' },
    phone:             { type: String, default: '' },
    whatsappNumber:    { type: String, default: '' },
    experiences:       [experienceSchema],
    cv: {
      fileName:      { type: String, default: '' },
      storageUrl:    { type: String, default: '' },
      uploadedAt:    { type: Date, default: null },
      extractedText: { type: String, default: '' },
    },
    visibility: {
      openToWork:          { type: Boolean, default: true },
      visibleToRecruiters: { type: Boolean, default: true },
      remote:              { type: Boolean, default: true },
      fulltime:            { type: Boolean, default: true },
    },
    completionPct: { type: Number, min: 0, max: 100, default: 0 },

    // NEW fields (additive only — schema sections 3.7, 3.8 + enhancements)
    avatarUrl:          { type: String, default: '' },
    githubUrl:          { type: String, default: '' },
    portfolioUrl:       { type: String, default: '' },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Open to Opportunities', 'Not Available'],
      default: 'Available',
    },
    availabilityType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract'],
      default: 'Full-time',
    },
    languages:      [languageSchema],
    certifications: [certificationSchema],
    projects:       [projectSchema],
  },
  { timestamps: true }
);

candidateProfileSchema.index({ userId: 1 });

export default mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);
