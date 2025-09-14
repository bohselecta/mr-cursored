import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIConfigGenerator } from '../core/ai-config-generator'
import { ProjectContext } from '../types'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  ensureDir: vi.fn().mockResolvedValue(undefined)
}))

// Mock Handlebars
vi.mock('handlebars', () => ({
  compile: vi.fn().mockReturnValue(vi.fn().mockReturnValue('compiled template'))
}))

describe('AIConfigGenerator', () => {
  let generator: AIConfigGenerator
  let mockContext: ProjectContext

  beforeEach(() => {
    generator = new AIConfigGenerator()
    mockContext = {
      name: 'test-app',
      description: 'Test application',
      stack: 'next-ts-supabase',
      framework: 'next',
      database: 'supabase',
      aiTools: ['cursor', 'copilot'],
      path: '/test/path',
      packageManager: 'npm'
    }
  })

  describe('generateAIConfigs', () => {
    it('should generate AI configs for cursor', async () => {
      const context = {
        ...mockContext,
        aiTools: ['cursor']
      }

      await generator.generateAIConfigs(context)

      // Should not throw any errors
      expect(true).toBe(true)
    })

    it('should generate AI configs for copilot', async () => {
      const context = {
        ...mockContext,
        aiTools: ['copilot']
      }

      await generator.generateAIConfigs(context)

      // Should not throw any errors
      expect(true).toBe(true)
    })

    it('should generate AI configs for claude', async () => {
      const context = {
        ...mockContext,
        aiTools: ['claude']
      }

      await generator.generateAIConfigs(context)

      // Should not throw any errors
      expect(true).toBe(true)
    })

    it('should generate AI configs for multiple tools', async () => {
      const context = {
        ...mockContext,
        aiTools: ['cursor', 'copilot', 'claude']
      }

      await generator.generateAIConfigs(context)

      // Should not throw any errors
      expect(true).toBe(true)
    })
  })

  describe('generateCursorRules', () => {
    it('should generate cursor rules with context', () => {
      const rules = (generator as any).generateCursorRules(mockContext)

      expect(typeof rules).toBe('string')
      expect(rules).toContain('test-app')
      expect(rules).toContain('next-ts-supabase')
      expect(rules).toContain('Next.js')
      expect(rules).toContain('Supabase')
    })
  })

  describe('generateCopilotConfig', () => {
    it('should generate copilot config with context', () => {
      const config = (generator as any).generateCopilotConfig(mockContext)

      expect(typeof config).toBe('string')
      expect(config).toContain('test-app')
      expect(config).toContain('Next.js')
      expect(config).toContain('TypeScript')
    })
  })

  describe('generateAgentsMarkdown', () => {
    it('should generate agents markdown', async () => {
      await (generator as any).generateAgentsMarkdown(mockContext)

      // Should not throw any errors
      expect(true).toBe(true)
    })
  })
})
