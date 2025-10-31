import { ROUTES } from '@/constants/routes'
import { describe, expect, it } from 'vitest'

describe('ROUTES', () => {
  it('should have correct HOME route', () => {
    expect(ROUTES.HOME).toBe('/')
  })

  it('should have correct AUTH routes', () => {
    expect(ROUTES.AUTH.LOGIN).toBe('/login')
    expect(ROUTES.AUTH.CALLBACK).toBe('/api/auth/callback')
  })

  it('should have correct BOARDS routes', () => {
    expect(ROUTES.BOARDS.ROOT).toBe('/boards')
  })

  it('should generate board VIEW route correctly', () => {
    const boardId = 'test-board-123'
    expect(ROUTES.BOARDS.VIEW(boardId)).toBe('/boards/test-board-123')
  })

  it('should generate board VIEW route with different IDs', () => {
    expect(ROUTES.BOARDS.VIEW('abc')).toBe('/boards/abc')
    expect(ROUTES.BOARDS.VIEW('123')).toBe('/boards/123')
    expect(ROUTES.BOARDS.VIEW('board-with-dashes')).toBe('/boards/board-with-dashes')
  })

  it('should have correct API routes', () => {
    expect(ROUTES.API.USERS.ROOT).toBe('/api/users')
    expect(ROUTES.API.USERS.SEARCH).toBe('/api/users/search')
  })
})
