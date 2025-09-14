import { describe, it, expect, vi, beforeEach } from 'vitest'
import { program } from '../cli'

describe('CLI', () => {
  beforeEach(() => {
    // Mock console.log to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should have create command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('create')
  })

  it('should have init command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('init')
  })

  it('should have add command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('add')
  })

  it('should have bootstrap command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('bootstrap')
  })

  it('should have health command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('health')
  })

  it('should have review command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('review')
  })

  it('should have sync command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('sync')
  })

  it('should have templates command', () => {
    const commands = program.commands.map(cmd => cmd.name())
    expect(commands).toContain('templates')
  })

  it('should have version option', () => {
    expect(program.version()).toBe('1.0.0')
  })
})
