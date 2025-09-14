import { ProjectContext, TeamConfig } from '../types';
import { StackDetector } from '../core/stack-detector';
import { writeFile, ensureDir } from 'fs-extra';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { cwd } from 'process';

export class SyncCommand {
  private stackDetector = new StackDetector();

  async execute(options: any): Promise<void> {
    try {
      const currentDir = cwd();
      const spinner = ora('Detecting project configuration...').start();

      // Detect existing project
      const context = await this.stackDetector.detectExistingProject(currentDir);
      if (!context) {
        spinner.fail('No project detected in current directory');
        return;
      }

      spinner.succeed(`Detected project: ${context.name}`);

      if (options.team) {
        await this.syncTeamSettings(context);
      }

      if (options.generateGuide) {
        await this.generateTeamGuide(context);
      }

      console.log(chalk.green('\n✅ Synchronization completed!'));

    } catch (error: any) {
      console.error(chalk.red('Error synchronizing settings:'), error.message);
      process.exit(1);
    }
  }

  private async syncTeamSettings(context: ProjectContext): Promise<void> {
    const spinner = ora('Synchronizing team settings...').start();

    try {
      // Create team configuration
      const teamConfig: TeamConfig = {
        aiGuidelines: this.generateAIGuidelines(),
        codeReview: this.generateCodeReviewChecklist(),
        qualityStandards: this.generateQualityStandards(),
        onboarding: this.generateOnboardingSteps()
      };

      // Write team configuration files
      await this.writeTeamConfigFiles(context, teamConfig);

      spinner.succeed('Team settings synchronized');

      console.log(chalk.yellow('\n📋 Team configuration updated:'));
      console.log('  • AI development guidelines');
      console.log('  • Code review checklist');
      console.log('  • Quality standards');
      console.log('  • Onboarding documentation');

    } catch (error) {
      spinner.fail('Failed to synchronize team settings');
      throw error;
    }
  }

  private async generateTeamGuide(context: ProjectContext): Promise<void> {
    const spinner = ora('Generating team guide...').start();

    try {
      const teamGuide = this.createTeamGuide(context);
      await writeFile(join(context.path, 'TEAM_GUIDE.md'), teamGuide);

      spinner.succeed('Team guide generated');

      console.log(chalk.yellow('\n📚 Team guide created: TEAM_GUIDE.md'));

    } catch (error) {
      spinner.fail('Failed to generate team guide');
      throw error;
    }
  }

  private generateAIGuidelines(): string {
    return `
# AI Development Guidelines

## Principles
- Always review AI-generated code before committing
- Use AI tools to accelerate development, not replace thinking
- Maintain code quality and project standards
- Document complex AI-generated solutions

## Best Practices
- Start with clear, specific prompts
- Iterate and refine AI suggestions
- Test AI-generated code thoroughly
- Follow established patterns in the codebase

## Tools Configuration
- Cursor: Use project-specific rules and context
- Copilot: Leverage for boilerplate and common patterns
- Claude: Use for architectural decisions and complex logic

## Quality Assurance
- All AI-generated code must pass quality gates
- Include tests for AI-generated functionality
- Review security implications of AI suggestions
- Ensure accessibility compliance
`;
  }

  private generateCodeReviewChecklist(): string[] {
    return [
      'Check for TypeScript errors and type safety',
      'Verify test coverage for new functionality',
      'Review security implications and vulnerabilities',
      'Ensure accessibility compliance (a11y)',
      'Validate performance impact and optimization',
      'Check for proper error handling',
      'Verify documentation is updated',
      'Ensure consistent code style and formatting',
      'Review AI-generated code for correctness',
      'Validate API contracts and data flow'
    ];
  }

  private generateQualityStandards(): Record<string, any> {
    return {
      testCoverage: {
        minimum: 80,
        target: 90,
        critical: 95
      },
      typeSafety: {
        strict: true,
        noAny: true,
        noImplicitAny: true
      },
      performance: {
        bundleSize: 'monitored',
        runtime: 'optimized',
        accessibility: 'WCAG 2.1 AA'
      },
      security: {
        vulnerabilityScan: true,
        dependencyAudit: true,
        codeReview: 'required'
      }
    };
  }

  private generateOnboardingSteps(): string[] {
    return [
      'Clone repository and set up development environment',
      'Install dependencies and configure AI tools',
      'Review project documentation and architecture',
      'Run initial quality checks and tests',
      'Complete AI tool configuration and setup',
      'Review team guidelines and coding standards',
      'Set up development containers (if applicable)',
      'Create first feature branch and make test commit',
      'Review and understand CI/CD pipeline',
      'Join team communication channels and standups'
    ];
  }

  private async writeTeamConfigFiles(context: ProjectContext, teamConfig: TeamConfig): Promise<void> {
    // Write AI guidelines
    await writeFile(
      join(context.path, '.team', 'ai-guidelines.md'),
      teamConfig.aiGuidelines
    );

    // Write code review checklist
    const codeReviewContent = `# Code Review Checklist

${teamConfig.codeReview.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Review Process
1. Self-review before requesting review
2. Request review from at least one team member
3. Address all feedback before merging
4. Ensure all quality gates pass

## AI-Generated Code Review
- Verify correctness and completeness
- Check for security vulnerabilities
- Ensure proper error handling
- Validate test coverage
- Review performance implications
`;

    await ensureDir(join(context.path, '.team'));
    await writeFile(
      join(context.path, '.team', 'code-review-checklist.md'),
      codeReviewContent
    );

    // Write quality standards
    await writeFile(
      join(context.path, '.team', 'quality-standards.json'),
      JSON.stringify(teamConfig.qualityStandards, null, 2)
    );

    // Write onboarding steps
    const onboardingContent = `# Team Onboarding Guide

## Getting Started

${teamConfig.onboarding.map((step, index) => `### Step ${index + 1}: ${step}`).join('\n\n')}

## Resources
- [Project Documentation](./docs/)
- [AI Development Guidelines](./.team/ai-guidelines.md)
- [Code Review Checklist](./.team/code-review-checklist.md)
- [Quality Standards](./.team/quality-standards.json)

## Getting Help
- Ask questions in team channels
- Review existing documentation
- Use AI tools for guidance
- Schedule pairing sessions with team members
`;

    await writeFile(
      join(context.path, '.team', 'onboarding.md'),
      onboardingContent
    );
  }

  private createTeamGuide(context: ProjectContext): string {
    return `# Team Development Guide

## Project Overview
**${context.name}** - ${context.description}

## Technology Stack
- **Framework**: ${context.framework}
- **Language**: TypeScript
- **Database**: ${context.database || 'Not configured'}
- **Testing**: ${context.testingFramework || 'Vitest'}
- **Styling**: Tailwind CSS

## AI Development Setup

### Configured AI Tools
${context.aiTools.map(tool => `- **${tool}**: Configured with project-specific rules`).join('\n')}

### Quick Start
\`\`\`bash
# Set up development environment
npm install
npm run dev

# Run quality checks
npm run quality

# Check project health
ai-scaffold health
\`\`\`

## Development Workflow

### 1. Feature Development
1. Create feature branch from main
2. Use AI tools for initial implementation
3. Review and refine AI-generated code
4. Write tests for new functionality
5. Run quality checks: \`npm run quality\`
6. Submit pull request

### 2. Code Review Process
- Self-review before requesting review
- Use AI tools to check for common issues
- Follow the code review checklist
- Ensure all quality gates pass
- Address feedback before merging

### 3. Quality Assurance
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Automated testing with coverage
- Pre-commit hooks for quality checks
- CI/CD pipeline for continuous integration

## AI Tool Guidelines

### Cursor
- Use project-specific rules in .cursorrules
- Leverage context files for better suggestions
- Review all generated code before committing
- Follow established patterns in the codebase

### GitHub Copilot
- Use for boilerplate code and common patterns
- Verify suggestions align with project standards
- Don't accept suggestions without review
- Use for test generation and documentation

### Claude
- Use for architectural decisions and complex logic
- Leverage for code explanation and debugging
- Use for generating comprehensive documentation
- Validate suggestions against project requirements

## Best Practices

### Code Quality
- Write TypeScript with strict typing
- Follow established naming conventions
- Include proper error handling
- Write comprehensive tests
- Document complex logic

### Security
- Review AI suggestions for security implications
- Use environment variables for sensitive data
- Validate all user inputs
- Follow OWASP security guidelines
- Regular dependency audits

### Performance
- Monitor bundle size and runtime performance
- Use React.memo and useMemo appropriately
- Optimize database queries
- Implement proper caching strategies
- Profile and optimize critical paths

## Troubleshooting

### Common Issues
1. **Type Errors**: Check TypeScript configuration and types
2. **AI Suggestions**: Always review and validate AI output
3. **Test Failures**: Ensure tests cover edge cases
4. **Build Errors**: Check for syntax and dependency issues

### Getting Help
- Check project documentation first
- Use AI tools for debugging assistance
- Ask team members for guidance
- Review similar implementations in the codebase
- Use online resources and documentation

## Resources

### Documentation
- [AI Development Guide](./AGENTS.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

### Tools
- [Cursor Documentation](https://cursor.sh/docs)
- [GitHub Copilot Guide](https://docs.github.com/en/copilot)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

### Team Communication
- Use team channels for questions and discussions
- Schedule regular code review sessions
- Share knowledge and best practices
- Collaborate on complex features
- Maintain open communication about AI tool usage

## Continuous Improvement

### Regular Reviews
- Monthly team retrospectives
- Quarterly AI tool effectiveness reviews
- Annual technology stack evaluations
- Continuous process improvement

### Learning
- Stay updated with AI tool developments
- Share new techniques and patterns
- Attend relevant conferences and workshops
- Contribute to open source projects
- Mentor team members on AI development

---

*This guide is living documentation. Please contribute improvements and updates as the project evolves.*
`;
  }
}
