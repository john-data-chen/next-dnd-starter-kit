import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assigner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

async function main() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('mongodb connected');

    // Create admin user
    const adminUser = await User.create({
      email: 'demo@example.com',
      name: 'admin',
      password: await bcrypt.hash('123456', 10),
      role: 'ADMIN'
    });

    // Create demo project
    const demoProject = await Project.create({
      name: 'Demo Project',
      description: 'This is a demo project',
      owner: adminUser._id,
      members: [adminUser._id]
    });

    // Create demo task
    const demoTask = await Task.create({
      title: 'First Task',
      description: 'This is our first task',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      project: demoProject._id,
      assignee: adminUser._id,
      assigner: adminUser._id
    });

    console.log('Created demo data:', {
      user: adminUser,
      project: demoProject,
      task: demoTask
    });

  } catch (error) {
    if (error.code === 11000) {
      console.log('Data already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('mongodb disconnected');
  }
}

main().catch(console.error);

