import { Model } from 'mongoose'
import { TaskType } from './dbInterface'

declare module 'mongoose' {
  interface Models {
    Task: Model<TaskType>
    // Add other models here as needed
  }
}
