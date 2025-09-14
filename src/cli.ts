#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { CreateCommand } from './commands/create';
import { InitCommand } from './commands/init';
import { AddCommand } from './commands/add';
import { BootstrapCommand } from './commands/bootstrap';
import { HealthCommand } from './commands/health';
import { ReviewCommand } from './commands/review';
import { SyncCommand } from './commands/sync';
import { TemplatesCommand } from './commands/templates';

const program = new Command();

// ASCII Art Banner
const banner = figlet.textSync('AI Scaffold', {
  font: 'ANSI Shadow',
  horizontalLayout: 'default',
  verticalLayout: 'default'
});

console.log(gradient.rainbow(banner));
console.log(chalk.gray('The ultimate pre-flight tool for AI development\n'));

program
  .name('ai-scaffold')
  .description('Create projects optimized for AI coding assistants from day one')
  .version('1.0.0');

// Create command
program
  .command('create <name>')
  .description('Create a new AI-optimized project')
  .option('-s, --stack <stack>', 'Choose technology stack')
  .option('-a, --ai-tools <tools>', 'Comma-separated list of AI tools (cursor,copilot,claude)', 'cursor,copilot')
  .option('-i, --interactive', 'Interactive setup mode')
  .option('-c, --config <file>', 'Use custom configuration file')
  .action(async (name: string, options: any) => {
    const createCommand = new CreateCommand();
    await createCommand.execute(name, options);
  });

// Init command
program
  .command('init')
  .description('Initialize existing project for AI development')
  .option('-d, --detect', 'Auto-detect project type')
  .option('-a, --ai-tools <tools>', 'Comma-separated list of AI tools', 'cursor,copilot')
  .action(async (options: any) => {
    const initCommand = new InitCommand();
    await initCommand.execute(options);
  });

// Add command
program
  .command('add <plugin>')
  .description('Add functionality to existing project')
  .option('-t, --type <type>', 'Plugin type')
  .option('-c, --config <config>', 'Plugin configuration')
  .action(async (plugin: string, options: any) => {
    const addCommand = new AddCommand();
    await addCommand.execute(plugin, options);
  });

// Bootstrap command
program
  .command('bootstrap')
  .description('Set up development environment')
  .option('-f, --full', 'Full setup including containers and services')
  .option('-t, --team', 'Apply team-wide settings')
  .action(async (options: any) => {
    const bootstrapCommand = new BootstrapCommand();
    await bootstrapCommand.execute(options);
  });

// Health command
program
  .command('health')
  .description('Check project health for AI development')
  .option('-f, --fix', 'Attempt to fix issues automatically')
  .option('-j, --json', 'Output as JSON')
  .action(async (options: any) => {
    const healthCommand = new HealthCommand();
    await healthCommand.execute(options);
  });

// Review command
program
  .command('review')
  .description('AI-assisted code review')
  .option('-f, --files <files>', 'Specific files to review')
  .option('-a, --all', 'Review all changed files')
  .action(async (options: any) => {
    const reviewCommand = new ReviewCommand();
    await reviewCommand.execute(options);
  });

// Sync command
program
  .command('sync')
  .description('Synchronize team AI settings')
  .option('-t, --team', 'Sync team-wide settings')
  .option('-g, --generate-guide', 'Generate team guide')
  .action(async (options: any) => {
    const syncCommand = new SyncCommand();
    await syncCommand.execute(options);
  });

// Templates command
program
  .command('templates')
  .description('Manage custom templates')
  .option('-l, --list', 'List available templates')
  .option('-c, --create <name>', 'Create new template')
  .option('-r, --remove <name>', 'Remove template')
  .action(async (options: any) => {
    const templatesCommand = new TemplatesCommand();
    await templatesCommand.execute(options);
  });

// Global options
program
  .option('-v, --verbose', 'Verbose output')
  .option('-q, --quiet', 'Quiet mode')
  .option('--dry-run', 'Show what would be done without making changes');

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error: any) {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

export { program };
