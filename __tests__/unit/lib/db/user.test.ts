import { connectToDatabase } from '@/lib/db/connect'
import { getUserByEmail, getUserById } from '@/lib/db/user'
import { UserModel } from '@/models/user.model'

// Mock the dependencies
vi.mock('@/lib/db/connect')
vi.mock('@/models/user.model')

describe('User DB Functions', () => {
  const mockUser = {
    _id: 'mockUserId',
    name: 'John Doe',
    email: 'john.doe@example.com',
    toObject: () => ({
      _id: 'mockUserId',
      name: 'John Doe',
      email: 'john.doe@example.com'
    }),
    lean: vi.fn().mockReturnThis()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserByEmail', () => {
    it('should return user data if user is found', async () => {
      ;(connectToDatabase as jest.Mock).mockResolvedValue(undefined)
      ;(UserModel.findOne as jest.Mock).mockReturnValue({
        lean: () =>
          Promise.resolve({
            ...mockUser,
            _id: { toString: () => mockUser._id }
          })
      })

      const user = await getUserByEmail('john.doe@example.com')

      expect(connectToDatabase).toHaveBeenCalled()
      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: 'john.doe@example.com'
      })
      expect(user).toEqual({
        id: 'mockUserId',
        name: 'John Doe',
        email: 'john.doe@example.com'
      })
    })

    it('should return null if user is not found', async () => {
      ;(connectToDatabase as jest.Mock).mockResolvedValue(undefined)
      ;(UserModel.findOne as jest.Mock).mockReturnValue({
        lean: () => Promise.resolve(null)
      })

      const user = await getUserByEmail('nonexistent@example.com')

      expect(user).toBeNull()
    })

    it('should return null on error', async () => {
      ;(connectToDatabase as jest.Mock).mockRejectedValue(new Error('DB error'))
      const user = await getUserByEmail('john.doe@example.com')
      expect(user).toBeNull()
    })
  })

  describe('getUserById', () => {
    it('should return user data if user is found', async () => {
      ;(connectToDatabase as jest.Mock).mockResolvedValue(undefined)
      ;(UserModel.findOne as jest.Mock).mockReturnValue({
        lean: () =>
          Promise.resolve({
            ...mockUser,
            _id: { toString: () => mockUser._id }
          })
      })

      const user = await getUserById('mockUserId')

      expect(connectToDatabase).toHaveBeenCalled()
      expect(UserModel.findOne).toHaveBeenCalledWith({ _id: 'mockUserId' })
      expect(user).toEqual({
        id: 'mockUserId',
        name: 'John Doe',
        email: 'john.doe@example.com'
      })
    })

    it('should return null if user is not found', async () => {
      ;(connectToDatabase as jest.Mock).mockResolvedValue(undefined)
      ;(UserModel.findOne as jest.Mock).mockReturnValue({
        lean: () => Promise.resolve(null)
      })

      const user = await getUserById('nonexistentId')

      expect(user).toBeNull()
    })

    it('should return null on error', async () => {
      ;(connectToDatabase as jest.Mock).mockRejectedValue(new Error('DB error'))
      const user = await getUserById('mockUserId')
      expect(user).toBeNull()
    })
  })
})
