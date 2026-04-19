import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  department: string;
  experienceLevel: 'Entry Level' | 'Intermediate' | 'Expert';
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Remote';
  requiredSkills: string[];
  minYearsExperience: number;
  education: string;
  description: string;
  niceToHave: string;
  location: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    department: { type: String, default: '' },
    experienceLevel: { type: String, enum: ['Entry Level', 'Intermediate', 'Expert'], default: 'Intermediate' },
    employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Remote'], default: 'Full-Time' },
    requiredSkills: [{ type: String }],
    minYearsExperience: { type: Number, min: 0, max: 20, default: 0 },
    education: { type: String, default: 'Any' },
    description: { type: String, default: '' },
    niceToHave: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'open', 'closed', 'archived'], default: 'open' },
  },
  { timestamps: true }
);

jobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IJob>('Job', jobSchema);
