import mongoose, { Model } from "mongoose"

import { ProjectModel as ProjectModelType } from "@/types/dbInterface"

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

let ProjectModel: Model<ProjectModelType>
try {
  ProjectModel = mongoose.model<ProjectModelType>("Project")
} catch {
  ProjectModel = mongoose.model<ProjectModelType>("Project", projectSchema)
}

export { ProjectModel }
