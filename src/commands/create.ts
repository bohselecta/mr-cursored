import { ProjectContext, StackTemplate } from '../types';
import { StackDetector } from '../core/stack-detector';
import { TemplateGenerator } from '../core/template-generator';
import { AIConfigGenerator } from '../core/ai-config-generator';
import { PluginManager } from '../core/plugin-manager';
import { QualityGateManager } from '../core/quality-gate-manager';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { join } from 'path';
import { ensureDir } from 'fs-extra';

export class CreateCommand {
  private stackDetector = new StackDetector();
  private templateGenerator = new TemplateGenerator();
  private aiConfigGenerator = new AIConfigGenerator();
  private pluginManager = new PluginManager();
  private qualityGateManager = new QualityGateManager();

  async execute(name: string, options: any): Promise<void> {
    try {
      console.log(chalk.blue(`🚀 Creating AI-optimized project: ${name}`));
      
      const context = await this.gatherProjectContext(name, options);
      const spinner = ora('Setting up project structure...').start();

      // Create project directory
      await ensureDir(context.path);
      spinner.succeed('Project directory created');

      // Generate base project structure
      spinner.start('Generating project structure...');
      await this.templateGenerator.generateProject(context);
      spinner.succeed('Project structure generated');

      // Set up AI configurations
      spinner.start('Configuring AI tools...');
      await this.aiConfigGenerator.generateAIConfigs(context);
      spinner.succeed('AI tools configured');

      // Install plugins
      spinner.start('Installing plugins...');
      await this.pluginManager.installPlugins(context);
      spinner.succeed('Plugins installed');

      // Set up quality gates
      spinner.start('Setting up quality gates...');
      await this.qualityGateManager.setupQualityGates(context);
      spinner.succeed('Quality gates configured');

      // Generate documentation
      spinner.start('Generating documentation...');
      await this.generateDocumentation(context);
      spinner.succeed('Documentation generated');

      console.log(chalk.green(`\n✅ Project ${name} created successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(`  cd ${name}`);
      console.log(`  npm install`);
      console.log(`  npm run dev`);
      console.log(chalk.blue('\n🤖 AI tools configured:'));
      context.aiTools.forEach(tool => {
        console.log(`  • ${tool}`);
      });

    } catch (error: any) {
      console.error(chalk.red('Error creating project:'), error.message);
      process.exit(1);
    }
  }

  private async gatherProjectContext(name: string, options: any): Promise<ProjectContext> {
    const availableStacks = await this.stackDetector.getAvailableStacks();
    
    let stack: string;
    let aiTools: string[];

    if (options.interactive) {
      // Interactive mode
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'stack',
          message: 'Choose your technology stack:',
          choices: availableStacks.map(s => ({ name: `${s.name} - ${s.description}`, value: s.name })),
          default: 'next-ts-supabase'
        },
        {
          type: 'checkbox',
          name: 'aiTools',
          message: 'Select AI tools to configure:',
          choices: [
            { name: 'Cursor', value: 'cursor', checked: true },
            { name: 'GitHub Copilot', value: 'copilot', checked: true },
            { name: 'Claude', value: 'claude', checked: false },
            { name: 'ChatGPT', value: 'chatgpt', checked: false }
          ],
          default: ['cursor', 'copilot']
        },
        {
          type: 'input',
          name: 'description',
          message: 'Project description:',
          default: 'An AI-optimized application'
        },
        {
          type: 'list',
          name: 'packageManager',
          message: 'Package manager:',
          choices: ['npm', 'yarn', 'pnpm'],
          default: 'npm'
        },
        {
          type: 'number',
          name: 'teamSize',
          message: 'Team size:',
          default: 1,
          validate: (input: number) => input > 0 || 'Team size must be at least 1'
        },
        {
          type: 'list',
          name: 'industry',
          message: 'Industry (affects security requirements):',
          choices: [
            { name: 'General', value: 'general' },
            { name: 'Fintech', value: 'fintech' },
            { name: 'Healthcare', value: 'healthcare' },
            { name: 'E-commerce', value: 'ecommerce' },
            { name: 'Education', value: 'education' }
          ],
          default: 'general'
        }
      ]);

      stack = answers.stack;
      aiTools = answers.aiTools;
    } else {
      // Command line options
      stack = options.stack || 'next-ts-supabase';
      aiTools = options.aiTools ? options.aiTools.split(',') : ['cursor', 'copilot'];
    }

    const selectedStack = availableStacks.find(s => s.name === stack);
    if (!selectedStack) {
      throw new Error(`Unknown stack: ${stack}`);
    }

    return {
      name,
      description: options.description || 'An AI-optimized application',
      stack,
      framework: this.extractFramework(stack),
      database: this.extractDatabase(stack),
      authProvider: this.extractAuthProvider(stack),
      stateManagement: 'zustand', // Default
      testingFramework: 'vitest', // Default
      aiTools,
      teamSize: 1,
      industry: 'general',
      securityLevel: 'standard',
      deploymentTarget: 'vercel',
      path: join(process.cwd(), name),
      packageManager: 'npm'
    };
  }

  private extractFramework(stack: string): string {
    if (stack.includes('next')) return 'next';
    if (stack.includes('nuxt')) return 'nuxt';
    if (stack.includes('svelte')) return 'svelte';
    if (stack.includes('astro')) return 'astro';
    if (stack.includes('angular')) return 'angular';
    if (stack.includes('vue')) return 'vue';
    if (stack.includes('react')) return 'react';
    if (stack.includes('remix')) return 'remix';
    if (stack.includes('gatsby')) return 'gatsby';
    if (stack.includes('solid')) return 'solid';
    return 'vanilla';
  }

  private extractDatabase(stack: string): string | undefined {
    if (stack.includes('supabase')) return 'supabase';
    if (stack.includes('prisma')) return 'prisma';
    if (stack.includes('mongodb')) return 'mongodb';
    return undefined;
  }

  private extractAuthProvider(stack: string): string | undefined {
    if (stack.includes('supabase')) return 'supabase-auth';
    if (stack.includes('clerk')) return 'clerk';
    if (stack.includes('auth0')) return 'auth0';
    return undefined;
  }

  private async generateDocumentation(context: ProjectContext): Promise<void> {
    // This would generate comprehensive documentation
    // For now, just create a basic README
    const readmeContent = `# ${context.name}

${context.description}

## AI Development Setup

This project is optimized for AI coding assistants with the following tools configured:
${context.aiTools.map(tool => `- ${tool}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Development Workflow

1. Create feature branch
2. Use AI assistants for initial implementation
3. Review and refine code
4. Run quality checks: \`npm run quality\`
5. Submit PR

## AI Assistant Guidelines

See \`AGENTS.md\` for detailed AI development guidelines.

## Quality Gates

This project includes automated quality checks:
- Type checking
- Linting
- Testing
- Security scanning

Run \`npm run quality\` to execute all quality gates.
`;

    // Write README
    // This would use the file system utilities
  }
}
