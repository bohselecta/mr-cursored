import { ProjectContext } from '../types';
import { StackDetector } from '../core/stack-detector';
import { AIConfigGenerator } from '../core/ai-config-generator';
import { PluginManager } from '../core/plugin-manager';
import { QualityGateManager } from '../core/quality-gate-manager';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { cwd } from 'process';

export class InitCommand {
  private stackDetector = new StackDetector();
  private aiConfigGenerator = new AIConfigGenerator();
  private pluginManager = new PluginManager();
  private qualityGateManager = new QualityGateManager();

  async execute(options: any): Promise<void> {
    try {
      console.log(chalk.blue('🚀 Initializing existing project for AI development'));
      
      const currentDir = cwd();
      const spinner = ora('Detecting project configuration...').start();

      // Detect existing project
      let context = await this.stackDetector.detectExistingProject(currentDir);
      
      if (!context) {
        spinner.fail('No existing project detected');
        console.log(chalk.yellow('Use "ai-scaffold create <name>" to create a new project'));
        return;
      }

      spinner.succeed(`Detected project: ${context.name} (${context.stack})`);

      // Gather AI tool preferences
      if (options.interactive || !options.aiTools) {
        const answers = await inquirer.prompt([
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
            type: 'confirm',
            name: 'setupQualityGates',
            message: 'Set up quality gates and git hooks?',
            default: true
          },
          {
            type: 'confirm',
            name: 'addPlugins',
            message: 'Add recommended plugins for detected stack?',
            default: true
          }
        ]);

        context.aiTools = answers.aiTools;
        
        // Set up AI configurations
        spinner.start('Configuring AI tools...');
        await this.aiConfigGenerator.generateAIConfigs(context);
        spinner.succeed('AI tools configured');

        // Add plugins if requested
        if (answers.addPlugins) {
          spinner.start('Installing recommended plugins...');
          await this.pluginManager.installPlugins(context);
          spinner.succeed('Plugins installed');
        }

        // Set up quality gates if requested
        if (answers.setupQualityGates) {
          spinner.start('Setting up quality gates...');
          await this.qualityGateManager.setupQualityGates(context);
          spinner.succeed('Quality gates configured');
        }
      } else {
        // Non-interactive mode
        context.aiTools = options.aiTools.split(',');
        
        spinner.start('Configuring AI tools...');
        await this.aiConfigGenerator.generateAIConfigs(context);
        spinner.succeed('AI tools configured');

        spinner.start('Setting up quality gates...');
        await this.qualityGateManager.setupQualityGates(context);
        spinner.succeed('Quality gates configured');
      }

      console.log(chalk.green(`\n✅ Project ${context.name} initialized for AI development!`));
      console.log(chalk.yellow('\n📋 AI tools configured:'));
      context.aiTools.forEach(tool => {
        console.log(`  • ${tool}`);
      });
      console.log(chalk.blue('\n🔧 Next steps:'));
      console.log('  npm install  # Install dependencies');
      console.log('  npm run dev  # Start development server');
      console.log('  npm run quality  # Run quality checks');

    } catch (error: any) {
      console.error(chalk.red('Error initializing project:'), error.message);
      process.exit(1);
    }
  }
}
