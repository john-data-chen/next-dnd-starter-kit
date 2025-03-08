import { Task as TaskType } from '@/types/dbInterface';
import mongoose, { Model } from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let TaskModel: Model<TaskType>;
if (mongoose.models.Task) {
  TaskModel = mongoose.models.Task;
} else {
  TaskModel = mongoose.model<TaskType>('Task', taskSchema);
}

export { TaskModel };
export type { TaskType };
