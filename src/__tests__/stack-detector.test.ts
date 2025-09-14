import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StackDetector } from '../core/stack-detector'
import { readFile, pathExists } from 'fs-extra'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  readFile: vi.fn(),
  pathExists: vi.fn()
}))

describe('StackDetector', () => {
  let detector: StackDetector

  beforeEach(() => {
    detector = new StackDetector()
    vi.clearAllMocks()
  })

  describe('detectExistingProject', () => {
    it('should return null for non-existent project', async () => {
      vi.mocked(pathExists).mockResolvedValue(false)

      const result = await detector.detectExistingProject('/fake/path')

      expect(result).toBeNull()
    })

    it('should detect Next.js project', async () => {
      const mockPackageJson = {
        name: 'test-app',
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0'
        },
        devDependencies: {
          typescript: '^5.0.0'
        }
      }

      vi.mocked(pathExists).mockResolvedValue(true)
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectExistingProject('/test/path')

      expect(result).toEqual({
        name: 'test-app',
        path: '/test/path',
        framework: 'next',
        stack: 'next-ts',
        packageManager: 'npm',
        aiTools: []
      })
    })

    it('should detect Vue.js project', async () => {
      const mockPackageJson = {
        name: 'vue-app',
        dependencies: {
          vue: '^3.3.0',
          vite: '^5.0.0'
        },
        devDependencies: {
          typescript: '^5.0.0'
        }
      }

      vi.mocked(pathExists).mockResolvedValue(true)
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectExistingProject('/vue/path')

      expect(result?.framework).toBe('vue')
      expect(result?.stack).toBe('vite-vue-ts')
    })

    it('should detect package manager from lock files', async () => {
      const mockPackageJson = {
        name: 'test-app',
        dependencies: {}
      }

      vi.mocked(pathExists).mockImplementation((path) => {
        if (path.includes('pnpm-lock.yaml')) return Promise.resolve(true)
        return Promise.resolve(false)
      })
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectExistingProject('/test/path')

      expect(result?.packageManager).toBe('pnpm')
    })
  })

  describe('getAvailableStacks', () => {
    it('should return available stacks', async () => {
      const stacks = await detector.getAvailableStacks()

      expect(Array.isArray(stacks)).toBe(true)
      expect(stacks.length).toBeGreaterThan(0)
      
      const stack = stacks[0]
      expect(stack).toHaveProperty('name')
      expect(stack).toHaveProperty('description')
      expect(stack).toHaveProperty('tags')
      expect(stack).toHaveProperty('aiCompatibility')
      expect(stack).toHaveProperty('structure')
      expect(stack).toHaveProperty('dependencies')
      expect(stack).toHaveProperty('qualityGates')
    })
  })
})
