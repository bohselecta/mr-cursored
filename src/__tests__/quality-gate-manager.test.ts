import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QualityGateManager } from '../core/quality-gate-manager'
import { ProjectContext } from '../types'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  ensureDir: vi.fn().mockResolvedValue(undefined)
}))

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '' })
}))

describe('QualityGateManager', () => {
  let manager: QualityGateManager
  let mockContext: ProjectContext

  beforeEach(() => {
    manager = new QualityGateManager()
    mockContext = {
      name: 'test-app',
      description: 'Test application',
      stack: 'next-ts',
      framework: 'next',
      aiTools: ['cursor', 'copilot'],
      path: '/test/path',
      packageManager: 'npm'
    }
  })

  describe('setupQualityGates', () => {
    it('should set up quality gates', async () => {
      await manager.setupQualityGates(mockContext)

      // Should not throw any errors
      expect(true).toBe(true)
    })
  })

  describe('runQualityGates', () => {
    it('should run quality gates successfully', async () => {
      const result = await manager.runQualityGates(mockContext)

      expect(typeof result).toBe('boolean')
    })
  })

  describe('generateQualityReport', () => {
    it('should generate quality report', async () => {
      await manager.generateQualityReport(mockContext)

      // Should not throw any errors
      expect(true).toBe(true)
    })
  })

  describe('getQualityGatesForContext', () => {
    it('should return quality gates for context', () => {
      const gates = (manager as any).getQualityGatesForContext(mockContext)

      expect(Array.isArray(gates)).toBe(true)
      expect(gates.length).toBeGreaterThan(0)
      
      const gate = gates[0]
      expect(gate).toHaveProperty('name')
      expect(gate).toHaveProperty('command')
      expect(gate).toHaveProperty('required')
      expect(gate).toHaveProperty('description')
    })

    it('should include framework-specific gates', () => {
      const nextContext = {
        ...mockContext,
        framework: 'next'
      }

      const gates = (manager as any).getQualityGatesForContext(nextContext)

      const buildGate = gates.find((gate: any) => gate.name === 'Build Check')
      expect(buildGate).toBeDefined()
    })

    it('should include database-specific gates', () => {
      const prismaContext = {
        ...mockContext,
        database: 'prisma'
      }

      const gates = (manager as any).getQualityGatesForContext(prismaContext)

      const prismaGate = gates.find((gate: any) => gate.name === 'Prisma Generate')
      expect(prismaGate).toBeDefined()
    })
  })
})
