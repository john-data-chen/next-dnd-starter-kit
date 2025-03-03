import mongoose, { Model } from 'mongoose';

// Define the interface for Project document
export interface ProjectDocument extends mongoose.Document {
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let Project: Model<ProjectDocument>;
try {
  Project = mongoose.model<ProjectDocument>('Project');
} catch {
  Project = mongoose.model<ProjectDocument>('Project', projectSchema);
}

export { Project };
