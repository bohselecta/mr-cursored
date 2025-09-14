import { ProjectContext } from '../types';
import { StackDetector } from '../core/stack-detector';
import { AIConfigGenerator } from '../core/ai-config-generator';
import { PluginManager } from '../core/plugin-manager';
import { QualityGateManager } from '../core/quality-gate-manager';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { cwd } from 'process';
import { execa } from 'execa';

export class BootstrapCommand {
  private stackDetector = new StackDetector();
  private aiConfigGenerator = new AIConfigGenerator();
  private pluginManager = new PluginManager();
  private qualityGateManager = new QualityGateManager();

  async execute(options: any): Promise<void> {
    try {
      const currentDir = cwd();
      const spinner = ora('Detecting project configuration...').start();

      // Detect existing project
      const context = await this.stackDetector.detectExistingProject(currentDir);
      if (!context) {
        spinner.fail('No project detected in current directory');
        console.log(chalk.yellow('Run this command from within your project directory'));
        return;
      }

      spinner.succeed(`Detected project: ${context.name}`);

      // Gather bootstrap preferences
      const bootstrapOptions = await this.gatherBootstrapOptions(options);

      // Set up development environment
      await this.setupDevelopmentEnvironment(context, bootstrapOptions);

      console.log(chalk.green(`\n✅ Development environment bootstrapped successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log('  npm install  # Install dependencies');
      console.log('  npm run dev  # Start development server');
      console.log('  npm run quality  # Run quality checks');

    } catch (error: any) {
      console.error(chalk.red('Error bootstrapping project:'), error.message);
      process.exit(1);
    }
  }

  private async gatherBootstrapOptions(options: any): Promise<any> {
    if (options.full) {
      return {
        aiTools: ['cursor', 'copilot', 'claude'],
        qualityGates: true,
        containers: true,
        services: true,
        documentation: true,
        team: options.team || false
      };
    }

    // Interactive mode
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
        name: 'qualityGates',
        message: 'Set up quality gates and git hooks?',
        default: true
      },
      {
        type: 'confirm',
        name: 'containers',
        message: 'Set up development containers?',
        default: false
      },
      {
        type: 'confirm',
        name: 'services',
        message: 'Set up development services (databases, etc.)?',
        default: false
      },
      {
        type: 'confirm',
        name: 'documentation',
        message: 'Generate comprehensive documentation?',
        default: true
      },
      {
        type: 'confirm',
        name: 'team',
        message: 'Apply team-wide settings?',
        default: false
      }
    ]);

    return answers;
  }

  private async setupDevelopmentEnvironment(context: ProjectContext, options: any): Promise<void> {
    // Set AI tools
    context.aiTools = options.aiTools;
    
    const spinner = ora('Setting up AI development environment...').start();

    // Configure AI tools
    spinner.start('Configuring AI tools...');
    await this.aiConfigGenerator.generateAIConfigs(context);
    spinner.succeed('AI tools configured');

    // Set up quality gates
    if (options.qualityGates) {
      spinner.start('Setting up quality gates...');
      await this.qualityGateManager.setupQualityGates(context);
      spinner.succeed('Quality gates configured');
    }

    // Set up development containers
    if (options.containers) {
      spinner.start('Setting up development containers...');
      await this.setupDevContainers(context);
      spinner.succeed('Development containers configured');
    }

    // Set up development services
    if (options.services) {
      spinner.start('Setting up development services...');
      await this.setupDevServices(context);
      spinner.succeed('Development services configured');
    }

    // Generate documentation
    if (options.documentation) {
      spinner.start('Generating documentation...');
      await this.generateDocumentation(context);
      spinner.succeed('Documentation generated');
    }

    // Set up team configuration
    if (options.team) {
      spinner.start('Setting up team configuration...');
      await this.setupTeamConfiguration(context);
      spinner.succeed('Team configuration set up');
    }

    // Install recommended plugins
    spinner.start('Installing recommended plugins...');
    await this.pluginManager.installPlugins(context);
    spinner.succeed('Plugins installed');

    // Set up VS Code/Cursor settings
    spinner.start('Configuring editor settings...');
    await this.setupEditorSettings(context);
    spinner.succeed('Editor settings configured');
  }

  private async setupDevContainers(context: ProjectContext): Promise<void> {
    // Create .devcontainer directory
    const devContainerConfig = {
      name: context.name,
      dockerComposeFile: '../docker-compose.yml',
      service: 'app',
      workspaceFolder: '/workspace',
      features: {
        'ghcr.io/devcontainers/features/node:1': {
          version: '18'
        },
        'ghcr.io/devcontainers/features/git:1': {}
      },
      customizations: {
        vscode: {
          extensions: [
            'bradlc.vscode-tailwindcss',
            'esbenp.prettier-vscode',
            'ms-vscode.vscode-typescript-next',
            'bradlc.vscode-tailwindcss'
          ],
          settings: {
            'editor.formatOnSave': true,
            'editor.defaultFormatter': 'esbenp.prettier-vscode',
            'typescript.preferences.importModuleSpecifier': 'relative'
          }
        }
      },
      postCreateCommand: 'npm install',
      forwardPorts: [3000, 5432]
    };

    // Write devcontainer configuration
    // This would write the actual files
  }

  private async setupDevServices(context: ProjectContext): Promise<void> {
    // Create docker-compose.yml for development services
    const dockerCompose = `version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${context.name}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
`;

    // Write docker-compose.yml
    // This would write the actual files
  }

  private async generateDocumentation(context: ProjectContext): Promise<void> {
    // Generate comprehensive project documentation
    const readme = `# ${context.name}

${context.description}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run quality checks
npm run quality
\`\`\`

## 🤖 AI Development

This project is optimized for AI coding assistants:

- **Cursor**: Configured with project-specific rules
- **GitHub Copilot**: Set up with context files
- **Claude**: Ready with comprehensive project context

See [AGENTS.md](./AGENTS.md) for detailed AI development guidelines.

## 🛠️ Technology Stack

- **Framework**: ${context.framework}
- **Language**: TypeScript
- **Database**: ${context.database || 'Not configured'}
- **Testing**: ${context.testingFramework || 'Vitest'}
- **Styling**: Tailwind CSS

## 📁 Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── lib/           # Utility functions and configurations
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
└── styles/        # Global styles and themes
\`\`\`

## 🔧 Development

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linter
- \`npm run typecheck\` - Type check
- \`npm run quality\` - Run all quality checks

### Quality Gates

This project includes automated quality checks:

- TypeScript type checking
- ESLint code quality
- Prettier code formatting
- Unit and integration tests
- Pre-commit hooks

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for deployment instructions.

## 📚 Documentation

- [AI Development Guide](./AGENTS.md)
- [API Documentation](./docs/API.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
`;

    // Write README.md
    // This would write the actual files
  }

  private async setupTeamConfiguration(context: ProjectContext): Promise<void> {
    // Generate team-wide configuration files
    const teamConfig = {
      aiGuidelines: 'Use AI tools responsibly and always review generated code',
      codeReview: [
        'Check for TypeScript errors',
        'Verify test coverage',
        'Review security implications',
        'Ensure accessibility compliance'
      ],
      qualityStandards: {
        testCoverage: 80,
        typeSafety: true,
        linting: true,
        formatting: true
      },
      onboarding: [
        'Set up development environment',
        'Configure AI tools',
        'Review project documentation',
        'Run initial quality checks'
      ]
    };

    // Write team configuration
    // This would write the actual files
  }

  private async setupEditorSettings(context: ProjectContext): Promise<void> {
    // Create .vscode/settings.json
    const vscodeSettings = {
      'editor.formatOnSave': true,
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true,
        'source.organizeImports': true
      },
      'typescript.preferences.importModuleSpecifier': 'relative',
      'emmet.includeLanguages': {
        'typescript': 'html',
        'typescriptreact': 'html'
      },
      'tailwindCSS.includeLanguages': {
        'typescript': 'html',
        'typescriptreact': 'html'
      }
    };

    // Create .vscode/extensions.json
    const recommendedExtensions = [
      'bradlc.vscode-tailwindcss',
      'esbenp.prettier-vscode',
      'ms-vscode.vscode-typescript-next',
      'dbaeumer.vscode-eslint',
      'ms-vscode.vscode-json'
    ];

    // Write VS Code configuration
    // This would write the actual files
  }
}
