import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginManager } from '../core/plugin-manager'
import { ProjectContext } from '../types'

describe('PluginManager', () => {
  let pluginManager: PluginManager
  let mockContext: ProjectContext

  beforeEach(() => {
    pluginManager = new PluginManager()
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

  describe('getAvailablePlugins', () => {
    it('should return available plugins', () => {
      const plugins = pluginManager.getAvailablePlugins()

      expect(Array.isArray(plugins)).toBe(true)
      expect(plugins.length).toBeGreaterThan(0)
      
      const plugin = plugins[0]
      expect(plugin).toHaveProperty('name')
      expect(plugin).toHaveProperty('version')
      expect(plugin).toHaveProperty('description')
      expect(plugin).toHaveProperty('dependencies')
      expect(plugin).toHaveProperty('files')
      expect(plugin).toHaveProperty('hooks')
      expect(plugin).toHaveProperty('aiInstructions')
    })
  })

  describe('getPlugin', () => {
    it('should return plugin by name', () => {
      const plugin = pluginManager.getPlugin('database-supabase')

      expect(plugin).toBeDefined()
      expect(plugin?.name).toBe('database-supabase')
    })

    it('should return undefined for non-existent plugin', () => {
      const plugin = pluginManager.getPlugin('non-existent-plugin')

      expect(plugin).toBeUndefined()
    })
  })

  describe('getPluginsForContext', () => {
    it('should return plugins for database context', () => {
      const contextWithDatabase = {
        ...mockContext,
        database: 'supabase'
      }

      // Access private method through any cast for testing
      const plugins = (pluginManager as any).getPluginsForContext(contextWithDatabase)

      expect(plugins).toContain('database-supabase')
    })

    it('should return plugins for auth context', () => {
      const contextWithAuth = {
        ...mockContext,
        authProvider: 'clerk'
      }

      const plugins = (pluginManager as any).getPluginsForContext(contextWithAuth)

      expect(plugins).toContain('auth-clerk')
    })

    it('should return plugins for testing context', () => {
      const contextWithTesting = {
        ...mockContext,
        testingFramework: 'vitest'
      }

      const plugins = (pluginManager as any).getPluginsForContext(contextWithTesting)

      expect(plugins).toContain('testing-vitest')
    })
  })

  describe('installPlugins', () => {
    it('should install plugins for context', async () => {
      const context = {
        ...mockContext,
        database: 'supabase',
        authProvider: 'clerk'
      }

      // Mock the installPlugin method
      const installPluginSpy = vi.spyOn(pluginManager, 'addPlugin').mockResolvedValue()

      await pluginManager.installPlugins(context)

      expect(installPluginSpy).toHaveBeenCalled()
    })
  })

  describe('addPlugin', () => {
    it('should add plugin successfully', async () => {
      const plugin = pluginManager.getPlugin('database-supabase')
      expect(plugin).toBeDefined()

      // Mock file system operations
      const mockWriteFile = vi.fn().mockResolvedValue(undefined)
      const mockEnsureDir = vi.fn().mockResolvedValue(undefined)
      
      vi.doMock('fs-extra', () => ({
        writeFile: mockWriteFile,
        ensureDir: mockEnsureDir
      }))

      await pluginManager.addPlugin('database-supabase', mockContext)

      // Plugin should be added without errors
      expect(true).toBe(true) // Test passes if no error thrown
    })

    it('should throw error for non-existent plugin', async () => {
      await expect(
        pluginManager.addPlugin('non-existent-plugin', mockContext)
      ).rejects.toThrow('Plugin non-existent-plugin not found')
    })
  })
})
