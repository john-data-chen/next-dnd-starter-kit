import { cn, getLocalePath } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'conditional-class', 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).not.toContain('conditional-class')
    })

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-4', 'px-8')
      expect(result).toBe('px-8')
    })
  })

  describe('getLocalePath', () => {
    it('should prepend locale to path when locale is a string', () => {
      const result = getLocalePath('/boards', 'en')
      expect(result).toBe('/en/boards')
    })

    it('should prepend locale to path when locale is an array', () => {
      const result = getLocalePath('/boards', ['en', 'zh'])
      expect(result).toBe('/en/boards')
    })

    it('should return path without locale when locale is undefined', () => {
      const result = getLocalePath('/boards', undefined)
      expect(result).toBe('/boards')
    })

    it('should handle root path with locale', () => {
      const result = getLocalePath('/', 'zh')
      expect(result).toBe('/zh/')
    })

    it('should handle empty string locale', () => {
      const result = getLocalePath('/boards', '')
      expect(result).toBe('/boards')
    })
  })
})
