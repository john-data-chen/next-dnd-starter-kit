import { connect } from 'mongoose'

vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    connect: vi.fn(),
    connection: {
      db: {
        admin: () => ({
          command: vi.fn().mockResolvedValue({ ok: 1 })
        })
      }
    }
  }
})

describe('connectToDatabase', () => {
  const originalEnv = process.env
  let isConnectedModule: { __esModule: true; connectToDatabase: any }

  beforeEach(async () => {
    vi.resetModules()
    process.env = { ...originalEnv }
    isConnectedModule = await import('@/lib/db/connect')
    vi.clearAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should throw error if DATABASE_URL is not defined', async () => {
    delete process.env.DATABASE_URL
    await expect(isConnectedModule.connectToDatabase()).rejects.toThrow(
      'DATABASE_URL is required. Please check your .env file.'
    )
  })

  it('should connect to database successfully', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
    ;(connect as jest.Mock).mockResolvedValueOnce(true)
    await isConnectedModule.connectToDatabase()
    expect(connect).toHaveBeenCalled()
  })

  it('should not connect if already connected', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
    ;(connect as jest.Mock).mockResolvedValue(true)
    await isConnectedModule.connectToDatabase()
    await isConnectedModule.connectToDatabase()
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('should handle MongoServerSelectionError', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
    const error = new Error('Server selection error')
    error.name = 'MongoServerSelectionError'
    ;(connect as jest.Mock).mockRejectedValue(error)
    await expect(isConnectedModule.connectToDatabase()).rejects.toThrow(
      'Database server is not running or unreachable. Please verify MongoDB service is running properly.'
    )
  })

  it('should handle MongoNetworkError', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
    const error = new Error('Network error')
    error.name = 'MongoNetworkError'
    ;(connect as jest.Mock).mockRejectedValue(error)
    await expect(isConnectedModule.connectToDatabase()).rejects.toThrow(
      'Database network connection error. Please check network settings and database address.'
    )
  })

  it('should handle generic error', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
    const error = new Error('Generic error')
    ;(connect as jest.Mock).mockRejectedValue(error)
    await expect(isConnectedModule.connectToDatabase()).rejects.toThrow('Generic error')
  })
})
