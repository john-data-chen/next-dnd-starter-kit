import mongoose, { Model } from "mongoose"

import { TaskModel as TaskModelType } from "@/types/dbInterface"

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["TODO", "IN_PROGRESS", "DONE"],
    default: "TODO",
    required: true
  },
  dueDate: { type: Date },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lastModifier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

function isTaskModel(model: any): model is Model<TaskModelType> {
  return model && model.modelName === "Task"
}

function getTaskModel(): Model<TaskModelType> {
  if (isTaskModel(mongoose.models.Task)) {
    return mongoose.models.Task
  }
  return mongoose.model<TaskModelType>("Task", taskSchema)
}

const TaskModel = getTaskModel()

export { TaskModel }
