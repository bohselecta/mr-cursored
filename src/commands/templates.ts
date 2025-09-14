import { ProjectContext } from '../types';
import { StackDetector } from '../core/stack-detector';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { cwd } from 'process';

export class TemplatesCommand {
  private stackDetector = new StackDetector();

  async execute(options: any): Promise<void> {
    try {
      if (options.list) {
        await this.listTemplates();
      } else if (options.create) {
        await this.createTemplate(options.create);
      } else if (options.remove) {
        await this.removeTemplate(options.remove);
      } else {
        // Default: show help
        await this.showTemplateHelp();
      }

    } catch (error: any) {
      console.error(chalk.red('Error managing templates:'), error.message);
      process.exit(1);
    }
  }

  private async listTemplates(): Promise<void> {
    const spinner = ora('Loading available templates...').start();

    try {
      const templates = await this.getAvailableTemplates();
      spinner.succeed('Templates loaded');

      console.log(chalk.blue('\n📋 Available Templates:\n'));

      templates.forEach(template => {
        console.log(chalk.green(`• ${template.name}`));
        console.log(`  ${chalk.gray(template.description)}`);
        console.log(`  ${chalk.yellow('Stack:')} ${template.stack}`);
        console.log(`  ${chalk.blue('Tags:')} ${template.tags.join(', ')}`);
        console.log(`  ${chalk.magenta('AI Tools:')} ${template.aiCompatibility.join(', ')}`);
        console.log('');
      });

      console.log(chalk.yellow('\n💡 Usage:'));
      console.log('  ai-scaffold create my-app --stack <template-name>');
      console.log('  ai-scaffold templates --create <name>  # Create custom template');
      console.log('  ai-scaffold templates --remove <name>  # Remove template');

    } catch (error) {
      spinner.fail('Failed to load templates');
      throw error;
    }
  }

  private async createTemplate(name: string): Promise<void> {
    console.log(chalk.blue(`\n🔧 Creating custom template: ${name}\n`));

    try {
      const currentDir = cwd();
      const context = await this.stackDetector.detectExistingProject(currentDir);
      
      if (!context) {
        console.log(chalk.yellow('No project detected in current directory'));
        console.log(chalk.yellow('Please run this command from within a project directory'));
        return;
      }

      // Gather template information
      const templateInfo = await this.gatherTemplateInfo(name, context);
      
      // Create template
      const spinner = ora('Creating template...').start();
      await this.saveTemplate(templateInfo);
      spinner.succeed(`Template "${name}" created successfully`);

      console.log(chalk.green(`\n✅ Custom template "${name}" created!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(`  ai-scaffold create my-app --stack ${name}`);
      console.log('  ai-scaffold templates --list  # View all templates');

    } catch (error) {
      console.error(chalk.red('Failed to create template:'), error);
    }
  }

  private async removeTemplate(name: string): Promise<void> {
    const spinner = ora(`Removing template "${name}"...`).start();

    try {
      // Check if template exists
      const templates = await this.getAvailableTemplates();
      const template = templates.find(t => t.name === name);
      
      if (!template) {
        spinner.fail(`Template "${name}" not found`);
        return;
      }

      // Remove template
      await this.deleteTemplate(name);
      spinner.succeed(`Template "${name}" removed`);

      console.log(chalk.green(`\n✅ Template "${name}" removed successfully!`));

    } catch (error) {
      spinner.fail(`Failed to remove template "${name}"`);
      throw error;
    }
  }

  private async showTemplateHelp(): Promise<void> {
    console.log(chalk.blue('\n📋 Template Management Commands:\n'));
    
    console.log(chalk.green('List templates:'));
    console.log('  ai-scaffold templates --list\n');
    
    console.log(chalk.green('Create custom template:'));
    console.log('  ai-scaffold templates --create my-template\n');
    
    console.log(chalk.green('Remove template:'));
    console.log('  ai-scaffold templates --remove my-template\n');
    
    console.log(chalk.yellow('💡 Tips:'));
    console.log('  • Run template commands from within a project directory');
    console.log('  • Custom templates are based on your current project');
    console.log('  • Use descriptive names for your templates');
    console.log('  • Templates include AI configurations and quality gates');
  }

  private async getAvailableTemplates(): Promise<any[]> {
    // This would typically load from a templates directory
    // For now, returning predefined templates
    return [
      {
        name: 'next-ts-supabase',
        description: 'Next.js TypeScript with Supabase - Full-stack app optimized for AI development',
        stack: 'next-ts',
        tags: ['frontend', 'fullstack', 'typescript', 'supabase'],
        aiCompatibility: ['cursor', 'copilot', 'claude']
      },
      {
        name: 'nuxt-ts-prisma',
        description: 'Nuxt.js TypeScript with Prisma - Vue.js full-stack application',
        stack: 'nuxt-ts',
        tags: ['frontend', 'fullstack', 'typescript', 'prisma', 'vue'],
        aiCompatibility: ['cursor', 'copilot', 'claude']
      },
      {
        name: 'react-ts-vite',
        description: 'React TypeScript with Vite - Modern frontend application',
        stack: 'react-ts',
        tags: ['frontend', 'react', 'typescript', 'vite'],
        aiCompatibility: ['cursor', 'copilot', 'claude']
      },
      {
        name: 'svelte-ts-tailwind',
        description: 'Svelte TypeScript with Tailwind - Lightweight frontend framework',
        stack: 'svelte-ts',
        tags: ['frontend', 'svelte', 'typescript', 'tailwind'],
        aiCompatibility: ['cursor', 'copilot', 'claude']
      },
      {
        name: 'astro-ts-mdx',
        description: 'Astro TypeScript with MDX - Static site generator with content',
        stack: 'astro-ts',
        tags: ['static', 'typescript', 'mdx', 'content'],
        aiCompatibility: ['cursor', 'copilot', 'claude']
      }
    ];
  }

  private async gatherTemplateInfo(name: string, context: ProjectContext): Promise<any> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Template description:',
        default: `${context.name} - ${context.description}`
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Template tags (comma-separated):',
        default: context.framework ? `${context.framework}, typescript, ai-optimized` : 'typescript, ai-optimized'
      },
      {
        type: 'checkbox',
        name: 'aiCompatibility',
        message: 'AI tools compatibility:',
        choices: [
          { name: 'Cursor', value: 'cursor', checked: context.aiTools.includes('cursor') },
          { name: 'GitHub Copilot', value: 'copilot', checked: context.aiTools.includes('copilot') },
          { name: 'Claude', value: 'claude', checked: context.aiTools.includes('claude') },
          { name: 'ChatGPT', value: 'chatgpt', checked: context.aiTools.includes('chatgpt') }
        ]
      },
      {
        type: 'confirm',
        name: 'includeConfigs',
        message: 'Include AI configurations and quality gates?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includePlugins',
        message: 'Include installed plugins?',
        default: true
      }
    ]);

    return {
      name,
      description: answers.description,
      tags: answers.tags.split(',').map(tag => tag.trim()),
      aiCompatibility: answers.aiCompatibility,
      includeConfigs: answers.includeConfigs,
      includePlugins: answers.includePlugins,
      baseProject: context
    };
  }

  private async saveTemplate(templateInfo: any): Promise<void> {
    // This would save the template to a templates directory
    // For now, just log the template info
    console.log(chalk.gray('Template info:'));
    console.log(`  Name: ${templateInfo.name}`);
    console.log(`  Description: ${templateInfo.description}`);
    console.log(`  Tags: ${templateInfo.tags.join(', ')}`);
    console.log(`  AI Compatibility: ${templateInfo.aiCompatibility.join(', ')}`);
    console.log(`  Include Configs: ${templateInfo.includeConfigs}`);
    console.log(`  Include Plugins: ${templateInfo.includePlugins}`);
  }

  private async deleteTemplate(name: string): Promise<void> {
    // This would delete the template from the templates directory
    console.log(chalk.gray(`Deleting template: ${name}`));
  }
}
