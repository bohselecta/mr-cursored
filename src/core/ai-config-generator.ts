import { ProjectContext, AIToolConfig } from '../types';
import { writeFile, ensureDir } from 'fs-extra';
import { join } from 'path';
import Handlebars from 'handlebars';

export class AIConfigGenerator {
  private readonly aiToolConfigs: Record<string, AIToolConfig> = {
    cursor: {
      name: 'Cursor',
      setup: {
        configFiles: ['.cursorrules', '.cursor/'],
        rules: this.generateCursorRules.bind(this),
        context: ['src/', 'lib/', 'types/', 'components/']
      },
      optimization: {
        patterns: [
          'Use TypeScript for all new files',
          'Follow established patterns in existing code',
          'Include JSDoc comments for functions',
          'Use proper error handling',
          'Write tests for new functionality'
        ],
        antiPatterns: [
          'Don\'t use any types',
          'Don\'t ignore existing patterns',
          'Don\'t skip error handling',
          'Don\'t forget to test'
        ]
      }
    },
    copilot: {
      name: 'GitHub Copilot',
      setup: {
        configFiles: ['.github/copilot/', '.copilotignore'],
        rules: this.generateCopilotConfig.bind(this),
        context: ['src/', 'lib/', 'types/']
      },
      optimization: {
        patterns: [
          'Write clear, descriptive function names',
          'Use consistent naming conventions',
          'Include type annotations',
          'Follow project structure'
        ],
        antiPatterns: [
          'Don\'t use ambiguous variable names',
          'Don\'t ignore TypeScript errors',
          'Don\'t skip documentation'
        ]
      }
    },
    claude: {
      name: 'Claude',
      setup: {
        configFiles: ['AGENTS.md', '.claude/'],
        rules: this.generateClaudeConfig.bind(this),
        context: ['src/', 'docs/', 'types/']
      },
      optimization: {
        patterns: [
          'Provide clear context in prompts',
          'Use structured data formats',
          'Include examples in requests',
          'Be specific about requirements'
        ],
        antiPatterns: [
          'Don\'t provide vague requirements',
          'Don\'t ignore context files',
          'Don\'t skip validation'
        ]
      }
    }
  };

  async generateAIConfigs(context: ProjectContext): Promise<void> {
    for (const aiTool of context.aiTools) {
      const config = this.aiToolConfigs[aiTool];
      if (!config) continue;

      await this.setupAITool(context, config);
    }

    // Generate comprehensive AGENTS.md
    await this.generateAgentsMarkdown(context);
  }

  private async setupAITool(context: ProjectContext, config: AIToolConfig): Promise<void> {
    switch (config.name) {
      case 'Cursor':
        await this.setupCursor(context);
        break;
      case 'GitHub Copilot':
        await this.setupCopilot(context);
        break;
      case 'Claude':
        await this.setupClaude(context);
        break;
    }
  }

  private async setupCursor(context: ProjectContext): Promise<void> {
    const cursorRules = this.generateCursorRules(context);
    await writeFile(join(context.path, '.cursorrules'), cursorRules);

    // Create .cursor directory with additional configs
    await ensureDir(join(context.path, '.cursor'));
    
    const cursorConfig = {
      version: '1.0.0',
      project: {
        name: context.name,
        description: context.description,
        stack: context.stack,
        framework: context.framework
      },
      ai: {
        tools: context.aiTools,
        contextFiles: [
          'src/',
          'lib/',
          'types/',
          'components/',
          'hooks/',
          'utils/'
        ],
        patterns: {
          coding: 'typescript',
          testing: 'vitest',
          styling: 'tailwind',
          state: 'zustand'
        }
      },
      quality: {
        preCommit: ['typecheck', 'lint', 'test'],
        ci: ['typecheck', 'lint', 'test', 'build'],
        coverage: 80
      }
    };

    await writeFile(
      join(context.path, '.cursor', 'config.json'),
      JSON.stringify(cursorConfig, null, 2)
    );
  }

  private async setupCopilot(context: ProjectContext): Promise<void> {
    await ensureDir(join(context.path, '.github', 'copilot'));
    
    const copilotConfig = {
      version: '1.0.0',
      project: context.name,
      rules: this.generateCopilotConfig(context),
      context: {
        directories: ['src/', 'lib/', 'types/'],
        files: ['package.json', 'tsconfig.json'],
        patterns: {
          language: 'typescript',
          framework: context.framework,
          testing: 'vitest'
        }
      }
    };

    await writeFile(
      join(context.path, '.github', 'copilot', 'config.json'),
      JSON.stringify(copilotConfig, null, 2)
    );

    // Create .copilotignore
    const copilotIgnore = `
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
.nuxt/

# Environment files
.env
.env.local
.env.production

# Logs
*.log
logs/

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
`;

    await writeFile(join(context.path, '.copilotignore'), copilotIgnore.trim());
  }

  private async setupClaude(context: ProjectContext): Promise<void> {
    await ensureDir(join(context.path, '.claude'));
    
    const claudeConfig = {
      version: '1.0.0',
      project: {
        name: context.name,
        stack: context.stack,
        framework: context.framework
      },
      instructions: {
        primary: 'Help develop a high-quality, maintainable application',
        style: 'Follow TypeScript best practices and project conventions',
        testing: 'Always include tests for new functionality',
        documentation: 'Provide clear JSDoc comments'
      },
      context: {
        files: ['AGENTS.md', 'README.md', 'package.json'],
        directories: ['src/', 'docs/']
      }
    };

    await writeFile(
      join(context.path, '.claude', 'config.json'),
      JSON.stringify(claudeConfig, null, 2)
    );
  }

  private generateCursorRules(context: ProjectContext): string {
    const template = `# {{projectName}} - AI Development Guidelines

## Project Context
- **Stack**: {{stack}}
- **Framework**: {{framework}}
- **Database**: {{database}}
- **AI Tools**: {{aiTools}}

## Coding Standards

### TypeScript
- Always use TypeScript for new files
- Enable strict mode and use proper typing
- Use interfaces for object shapes
- Prefer type unions over any
- Use proper error handling with Result types

### Code Organization
- Follow the established patterns in /lib
- Place components in /components with proper exports
- Use custom hooks from /hooks for shared logic
- Store utilities in /utils with proper documentation
- Reference the schema in /types for data structures

### Testing
- Test files should be co-located with source files
- Use descriptive test names and proper assertions
- Aim for 80%+ test coverage
- Include both unit and integration tests

### Styling
- Use Tailwind CSS utility classes
- Follow the design system in /styles
- Ensure responsive design
- Use CSS variables for theming

## AI Assistant Instructions

### File Creation
- Always create TypeScript files (.ts/.tsx)
- Include proper imports and exports
- Follow the project's folder structure
- Add JSDoc comments for functions and classes

### Code Quality
- Use meaningful variable and function names
- Implement proper error handling
- Follow the established coding patterns
- Ensure accessibility compliance

### Database Operations
- Use the custom client in /lib for database queries
- Implement proper error handling for database operations
- Use transactions for multi-step operations
- Follow the schema defined in /types

### API Development
- API routes need proper error handling
- Use proper HTTP status codes
- Implement request validation
- Add comprehensive logging

## Quality Requirements
- All functions must have JSDoc comments
- Components should have Storybook stories (if configured)
- API routes need error handling and validation
- Database queries should use the custom client
- All new code must pass linting and type checking

## Development Workflow
1. Create feature branch from main
2. Use AI to generate initial implementation
3. Manually review and refine the code
4. Run quality checks: npm run quality
5. Write or update tests
6. Submit PR with clear description

## Anti-Patterns to Avoid
- Using \`any\` type without justification
- Ignoring existing patterns in the codebase
- Skipping error handling
- Creating components without proper TypeScript types
- Forgetting to add tests for new functionality
- Not following the established folder structure
`;

    return Handlebars.compile(template)({
      projectName: context.name,
      stack: context.stack,
      framework: context.framework,
      database: context.database || 'None configured',
      aiTools: context.aiTools.join(', ')
    });
  }

  private generateCopilotConfig(context: ProjectContext): string {
    return `# Copilot Configuration for ${context.name}

## Project Context
- Framework: ${context.framework}
- Language: TypeScript
- Testing: Vitest
- Styling: Tailwind CSS

## Coding Guidelines
- Use TypeScript with strict mode
- Follow established patterns in the codebase
- Include proper error handling
- Write tests for new functionality
- Use meaningful variable names
- Follow the project's folder structure

## Patterns to Follow
- Use interfaces for object shapes
- Implement proper error handling
- Use custom hooks for shared logic
- Follow the established API patterns
- Use the project's styling system

## Anti-Patterns to Avoid
- Using any type without justification
- Ignoring existing code patterns
- Skipping error handling
- Not writing tests
- Using unclear variable names`;
  }

  private async generateAgentsMarkdown(context: ProjectContext): Promise<void> {
    const template = `# AI Development Context for {{projectName}}

## Project Overview
{{description}}

## Architecture Decisions
- **Framework**: {{framework}} - Modern, performant, and AI-friendly
- **Database**: {{database}} - Chosen for scalability and developer experience
- **State Management**: {{stateManagement}} - Lightweight and TypeScript-friendly
- **Testing**: {{testingFramework}} - Fast, modern testing framework
- **Styling**: Tailwind CSS - Utility-first CSS framework

## Technology Stack
\`\`\`
Framework: {{framework}}
Database: {{database}}
Language: TypeScript
Testing: {{testingFramework}}
Styling: Tailwind CSS
Package Manager: {{packageManager}}
\`\`\`

## Code Patterns

### Component Structure
\`\`\`typescript
interface {{projectName}}ComponentProps {
  // Define props with proper types
}

export const {{projectName}}Component: React.FC<{{projectName}}ComponentProps> = ({
  // Destructure props
}) => {
  // Component logic
  return (
    // JSX with proper structure
  );
};
\`\`\`

### API Route Pattern
\`\`\`typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // API logic with proper error handling
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
\`\`\`

### Database Query Pattern
\`\`\`typescript
import { db } from '@/lib/database';

export async function getData(id: string) {
  try {
    const result = await db.query('SELECT * FROM table WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch data');
  }
}
\`\`\`

## Development Workflow
1. **Create feature branch**: \`git checkout -b feature/new-feature\`
2. **Start development**: \`npm run dev\`
3. **Use AI for initial implementation**: Leverage AI tools for scaffolding
4. **Manual review and refinement**: Always review AI-generated code
5. **Quality checks**: \`npm run quality\`
6. **Submit PR**: Include clear description and testing notes

## AI Assistant Guidelines

### When Creating New Files
- Always use TypeScript (.ts/.tsx extensions)
- Include proper imports and exports
- Follow the established folder structure
- Add JSDoc comments for functions and classes
- Use meaningful, descriptive names

### When Modifying Existing Code
- Maintain existing patterns and conventions
- Update types when changing interfaces
- Ensure all tests still pass
- Update documentation if needed
- Preserve existing functionality

### Code Quality Standards
- **Type Safety**: Use proper TypeScript types, avoid \`any\`
- **Error Handling**: Always handle errors appropriately
- **Testing**: Write tests for new functionality
- **Documentation**: Include JSDoc for functions
- **Performance**: Consider performance implications
- **Accessibility**: Ensure components are accessible

### Database Guidelines
- Use the custom database client from /lib
- Implement proper error handling for all queries
- Use transactions for multi-step operations
- Follow the schema defined in /types
- Always validate input data

### API Guidelines
- Use proper HTTP status codes
- Implement request validation
- Add comprehensive error handling
- Include proper logging
- Follow RESTful conventions

## Quality Gates
This project includes automated quality checks:

\`\`\`bash
# Run all quality checks
npm run quality

# Individual checks
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code quality
npm run test       # Unit and integration tests
npm run build      # Build verification
\`\`\`

## Troubleshooting

### Common Issues
1. **Type Errors**: Ensure all types are properly defined
2. **Import Errors**: Check file paths and exports
3. **Test Failures**: Review test logic and assertions
4. **Build Errors**: Check for syntax and type issues

### Getting Help
- Check existing code for patterns
- Review the documentation in /docs
- Use AI tools for debugging assistance
- Follow the established conventions

## AI Tool Configuration
This project is optimized for:
{{#each aiTools}}
- **{{this}}**: Configured with project-specific rules and context
{{/each}}

Each AI tool has been configured with:
- Project-specific coding standards
- Context files for better understanding
- Quality requirements and patterns
- Anti-patterns to avoid

## Contributing
When contributing to this project:
1. Follow the AI development guidelines above
2. Use AI tools to accelerate development
3. Always review and refine AI-generated code
4. Ensure all quality gates pass
5. Write clear commit messages and PR descriptions
`;

    const content = Handlebars.compile(template)({
      projectName: context.name,
      description: context.description,
      framework: context.framework,
      database: context.database || 'None configured',
      stateManagement: context.stateManagement || 'zustand',
      testingFramework: context.testingFramework || 'vitest',
      packageManager: context.packageManager,
      aiTools: context.aiTools
    });

    await writeFile(join(context.path, 'AGENTS.md'), content);
  }
}
