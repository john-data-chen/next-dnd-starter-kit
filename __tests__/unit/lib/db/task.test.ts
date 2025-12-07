import { connectToDatabase } from '@/lib/db/connect'
import {
  createTaskInDb,
  deleteTaskInDb,
  getTasksByProjectId,
  updateTaskInDb,
  updateTaskProjectInDb
} from '@/lib/db/task'
import { getUserByEmail, getUserById } from '@/lib/db/user'
import { ProjectModel } from '@/models/project.model'
import { TaskModel } from '@/models/task.model'
import { Types } from 'mongoose'

vi.mock('@/lib/db/connect')
vi.mock('@/lib/db/user')
vi.mock('@/models/board.model')
vi.mock('@/models/project.model')
vi.mock('@/models/task.model')

describe('Task DB functions', () => {
  const mockUser = {
    id: new Types.ObjectId().toHexString(),
    name: 'Test User',
    email: 'test@example.com'
  }
  const mockBoardId = new Types.ObjectId().toHexString()
  const mockProjectId = new Types.ObjectId().toHexString()
  const mockTaskId = new Types.ObjectId().toHexString()
  const mockTask = {
    _id: mockTaskId,
    title: 'Test Task',
    status: 'TODO',
    project: mockProjectId,
    board: mockBoardId,
    creator: mockUser.id,
    lastModifier: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(connectToDatabase as jest.Mock).mockResolvedValue(undefined)
    ;(getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(getUserById as jest.Mock).mockImplementation((id) =>
      Promise.resolve(id === mockUser.id ? mockUser : null)
    )
    ;(ProjectModel.findById as jest.Mock).mockResolvedValue({
      board: mockBoardId,
      members: [mockUser.id],
      owner: mockUser.id
    })
  })

  describe('getTasksByProjectId', () => {
    it('should fetch tasks for a project', async () => {
      ;(TaskModel.find as jest.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            ...mockTask,
            creator: new Types.ObjectId(mockTask.creator),
            lastModifier: new Types.ObjectId(mockTask.lastModifier)
          }
        ])
      })
      const tasks = await getTasksByProjectId(mockProjectId)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Test Task')
    })

    it('should throw an error if fetching tasks fails', async () => {
      ;(TaskModel.find as jest.Mock).mockReturnValue({
        lean: vi.fn().mockRejectedValue(new Error('DB error'))
      })
      await expect(getTasksByProjectId(mockProjectId)).rejects.toThrow('DB error')
    })
  })

  describe('createTaskInDb', () => {
    it('should create a new task', async () => {
      ;(TaskModel.create as jest.Mock).mockResolvedValue({
        ...mockTask,
        toObject: () => ({
          ...mockTask,
          creator: new Types.ObjectId(mockTask.creator),
          lastModifier: new Types.ObjectId(mockTask.lastModifier)
        })
      })
      const newTask = await createTaskInDb(mockProjectId, 'Test Task', mockUser.email)
      expect(newTask.title).toBe('Test Task')
    })

    it('should throw an error if creator is not found', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      await expect(createTaskInDb(mockProjectId, 'Test Task', mockUser.email)).rejects.toThrow(
        'Creator not found'
      )
    })

    it('should throw an error if board is not found', async () => {
      ;(ProjectModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(createTaskInDb(mockProjectId, 'Test Task', mockUser.email)).rejects.toThrow(
        'Board not found'
      )
    })
  })

  describe('updateTaskInDb', () => {
    it('should update a task', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(mockTask)
      ;(TaskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockTask,
        title: 'Updated Task',
        status: 'IN_PROGRESS',
        toObject: () => ({
          ...mockTask,
          title: 'Updated Task',
          status: 'IN_PROGRESS',
          creator: new Types.ObjectId(mockTask.creator),
          lastModifier: new Types.ObjectId(mockTask.lastModifier)
        })
      })
      const updatedTask = await updateTaskInDb(
        mockTaskId,
        'Updated Task',
        mockUser.email,
        'IN_PROGRESS'
      )
      expect(updatedTask.title).toBe('Updated Task')
      expect(updatedTask.status).toBe('IN_PROGRESS')
    })

    it('should throw an error if modifier is not found', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      await expect(
        updateTaskInDb(mockTaskId, 'Updated Task', mockUser.email, 'IN_PROGRESS')
      ).rejects.toThrow('Modifier not found')
    })

    it('should throw an error if task is not found', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(
        updateTaskInDb(mockTaskId, 'Updated Task', mockUser.email, 'IN_PROGRESS')
      ).rejects.toThrow('Task not found')
    })
  })

  describe('updateTaskProjectInDb', () => {
    const newProjectId = new Types.ObjectId().toHexString()

    it('should update the project of a task', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(mockTask)
      ;(ProjectModel.findById as jest.Mock).mockResolvedValue({
        _id: newProjectId,
        owner: mockUser.id,
        members: [mockUser.id]
      })
      ;(TaskModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        toObject: () => ({
          ...mockTask,
          project: newProjectId,
          creator: new Types.ObjectId(mockTask.creator),
          lastModifier: new Types.ObjectId(mockTask.lastModifier)
        })
      })

      const updatedTask = await updateTaskProjectInDb(mockUser.email, mockTaskId, newProjectId)
      expect(updatedTask.project).toBe(newProjectId)
    })

    it('should throw an error if user is not found', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      await expect(updateTaskProjectInDb(mockUser.email, mockTaskId, newProjectId)).rejects.toThrow(
        'User not found'
      )
    })

    it('should throw an error if target project is not found', async () => {
      ;(ProjectModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(updateTaskProjectInDb(mockUser.email, mockTaskId, newProjectId)).rejects.toThrow(
        'Target project not found'
      )
    })

    it('should throw an error if task is not found', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(updateTaskProjectInDb(mockUser.email, mockTaskId, newProjectId)).rejects.toThrow(
        'Task not found'
      )
    })

    it('should throw a permission error', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(mockTask)
      ;(ProjectModel.findById as jest.Mock).mockResolvedValue({
        _id: newProjectId,
        owner: 'anotherOwner',
        members: []
      })
      await expect(updateTaskProjectInDb(mockUser.email, mockTaskId, newProjectId)).rejects.toThrow(
        'Permission denied: You do not have sufficient permissions to move this task'
      )
    })
  })

  describe('deleteTaskInDb', () => {
    it('should delete a task', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(mockTask)
      ;(TaskModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockTask)
      await expect(deleteTaskInDb(mockTaskId)).resolves.toBeUndefined()
      expect(TaskModel.findByIdAndDelete).toHaveBeenCalledWith(mockTaskId)
    })

    it('should throw an error if task is not found', async () => {
      ;(TaskModel.findById as jest.Mock).mockResolvedValue(null)
      await expect(deleteTaskInDb(mockTaskId)).rejects.toThrow(
        `Task with id ${mockTaskId} not found`
      )
    })
  })
})
