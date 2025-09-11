import { createBoardInDb, deleteBoardInDb, fetchBoardsFromDb, updateBoardInDb } from '@/lib/db/board'
import { connectToDatabase } from '@/lib/db/connect'
import { getUserByEmail, getUserById } from '@/lib/db/user'
import { BoardModel } from '@/models/board.model'
import { ProjectModel } from '@/models/project.model'
import { TaskModel } from '@/models/task.model'
import { Types } from 'mongoose'

vi.mock('@/lib/db/connect')
vi.mock('@/lib/db/user')
vi.mock('@/models/board.model')
vi.mock('@/models/project.model')
vi.mock('@/models/task.model')

describe('Board DB functions', () => {
  const mockUser = {
    id: new Types.ObjectId().toHexString(),
    name: 'Test User',
    email: 'test@example.com'
  }
  const mockBoardId = new Types.ObjectId().toHexString()
  const mockBoard = {
    _id: new Types.ObjectId(mockBoardId),
    title: 'Test Board',
    description: 'Test Description',
    owner: new Types.ObjectId(mockUser.id),
    members: [new Types.ObjectId(mockUser.id)],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(connectToDatabase as jest.Mock).mockResolvedValue(undefined)
    ;(getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(getUserById as jest.Mock).mockImplementation((id) => Promise.resolve(id === mockUser.id ? mockUser : null))
  })

  describe('fetchBoardsFromDb', () => {
    it('should fetch boards for a user', async () => {
      ;(BoardModel.find as jest.Mock).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockBoard])
      })

      const boards = await fetchBoardsFromDb(mockUser.email)
      expect(boards).toHaveLength(1)
      expect(boards[0].title).toBe('Test Board')
    })

    it('should return empty array if user not found', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      const boards = await fetchBoardsFromDb('unknown@example.com')
      expect(boards).toEqual([])
    })
  })

  describe('createBoardInDb', () => {
    it('should create a new board', async () => {
      ;(BoardModel.create as jest.Mock).mockResolvedValue({
        ...mockBoard,
        toObject: () => mockBoard
      })
      const newBoard = await createBoardInDb({
        title: 'Test Board',
        userEmail: mockUser.email
      })
      expect(newBoard?.title).toBe('Test Board')
      expect(BoardModel.create).toHaveBeenCalled()
    })

    it('should return null if user not found', async () => {
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      const newBoard = await createBoardInDb({
        title: 'Test Board',
        userEmail: 'unknown@example.com'
      })
      expect(newBoard).toBeNull()
    })
  })

  describe('updateBoardInDb', () => {
    it('should update a board', async () => {
      ;(BoardModel.findById as jest.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockBoard)
      })
      ;(BoardModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...mockBoard, title: 'Updated Board' })
      })

      const updatedBoard = await updateBoardInDb(mockBoardId, { title: 'Updated Board' }, mockUser.email)
      expect(updatedBoard?.title).toBe('Updated Board')
    })

    it('should throw error if user is not owner', async () => {
      ;(BoardModel.findById as jest.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...mockBoard, owner: new Types.ObjectId() })
      })
      await expect(updateBoardInDb(mockBoardId, { title: 'Updated' }, mockUser.email)).resolves.toBeNull()
    })
  })

  describe('deleteBoardInDb', () => {
    it('should delete a board and its contents', async () => {
      ;(BoardModel.findById as jest.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockBoard)
      })
      ;(ProjectModel.deleteMany as jest.Mock).mockResolvedValue({
        acknowledged: true,
        deletedCount: 1
      })
      ;(TaskModel.deleteMany as jest.Mock).mockResolvedValue({
        acknowledged: true,
        deletedCount: 1
      })
      ;(BoardModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockBoard)

      const result = await deleteBoardInDb(mockBoardId, mockUser.email)
      expect(result).toBe(true)
      expect(ProjectModel.deleteMany).toHaveBeenCalled()
      expect(TaskModel.deleteMany).toHaveBeenCalled()
      expect(BoardModel.findByIdAndDelete).toHaveBeenCalledWith(mockBoardId)
    })

    it('should throw error if user is not owner', async () => {
      ;(BoardModel.findById as jest.Mock).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...mockBoard, owner: new Types.ObjectId() })
      })
      await expect(deleteBoardInDb(mockBoardId, mockUser.email)).resolves.toBe(false)
    })
  })
})
