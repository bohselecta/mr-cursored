# Contributing to AI Scaffold

Thank you for your interest in contributing to AI Scaffold! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **Bug Reports** - Report issues and bugs
- **Feature Requests** - Suggest new features
- **Code Contributions** - Submit code improvements
- **Documentation** - Improve documentation
- **Templates** - Add new project templates
- **Plugins** - Create new plugins
- **Testing** - Add or improve tests

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/bohselecta/mr-cursored.git
   cd mr-cursored
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## 🐛 Reporting Issues

### Before Reporting

1. Check if the issue already exists
2. Ensure you're using the latest version
3. Try to reproduce the issue
4. Gather relevant information

### Issue Template

When reporting an issue, please include:

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 12, Ubuntu 20.04]
- Node.js version: [e.g., 18.17.0]
- AI Scaffold version: [e.g., 1.0.0]
- AI Tools: [e.g., Cursor, Copilot, Claude]

## Additional Context
Any additional information, screenshots, or logs
```

## 💡 Feature Requests

### Before Requesting

1. Check if the feature already exists
2. Consider if it fits the project's scope
3. Think about the implementation approach
4. Consider the impact on existing users

### Feature Request Template

```markdown
## Feature Description
Brief description of the requested feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any additional information or examples
```

## 🔧 Code Contributions

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/mr-cursored.git
   cd mr-cursored
   ```

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Code Standards

#### TypeScript
- Use TypeScript with strict mode
- Follow established patterns
- Include proper type definitions
- Use meaningful variable names

#### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Include JSDoc comments
- Write descriptive commit messages

#### Testing
- Write tests for new functionality
- Maintain test coverage
- Use descriptive test names
- Test edge cases

### Commit Guidelines

We follow conventional commits:

```
type(scope): description

feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

Examples:
```bash
feat(create): add support for Svelte templates
fix(health): resolve dependency check issue
docs(readme): update installation instructions
test(plugin): add tests for database plugins
```

### Pull Request Process

1. **Create Pull Request**
   - Use descriptive title
   - Reference related issues
   - Include detailed description

2. **Ensure Quality**
   - All tests pass
   - Code follows standards
   - Documentation is updated
   - No breaking changes (unless major version)

3. **Review Process**
   - Address reviewer feedback
   - Update PR as needed
   - Maintain clean commit history

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 📚 Documentation Contributions

### Documentation Types

- **README Updates** - Improve main documentation
- **API Documentation** - Document functions and classes
- **Examples** - Add usage examples
- **Guides** - Create how-to guides
- **Templates** - Document new templates

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use proper markdown formatting
- Include screenshots when helpful

## 🧩 Plugin Development

### Creating Plugins

1. **Plugin Structure**
   ```typescript
   interface ScaffoldPlugin {
     name: string;
     version: string;
     description: string;
     dependencies: string[];
     files: TemplateFile[];
     hooks: {
       preGen?: (context: ProjectContext) => Promise<void>;
       postGen?: (context: ProjectContext) => Promise<void>;
     };
     aiInstructions: string;
   }
   ```

2. **Plugin Example**
   ```typescript
   const myPlugin = {
     name: 'database-postgresql',
     version: '1.0.0',
     description: 'PostgreSQL database integration',
     dependencies: ['pg', '@types/pg'],
     files: [
       {
         path: 'src/lib/database.ts',
         content: '// PostgreSQL client setup'
       }
     ],
     hooks: {
       postGen: async (context) => {
         console.log('PostgreSQL plugin installed');
       }
     },
     aiInstructions: 'Use PostgreSQL client for database operations'
   };
   ```

### Plugin Guidelines

- Follow naming conventions
- Include proper documentation
- Test with multiple stacks
- Provide clear AI instructions
- Handle errors gracefully

## 🏗️ Template Development

### Creating Templates

1. **Template Structure**
   ```yaml
   name: "Template Name"
   description: "Template description"
   tags: ["tag1", "tag2"]
   aiCompatibility: ["cursor", "copilot"]
   structure:
     - src/
     - components/
   dependencies:
     dev: ["typescript", "eslint"]
     runtime: ["react", "next"]
   ```

2. **Template Guidelines**
   - Use descriptive names
   - Include comprehensive documentation
   - Test with AI tools
   - Follow project structure conventions
   - Include quality gates

### Template Testing

```bash
# Test template creation
ai-scaffold create test-app --stack your-template

# Verify generated files
cd test-app
npm install
npm run quality
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="PluginManager"

# Watch mode
npm test -- --watch
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { PluginManager } from '../src/core/plugin-manager';

describe('PluginManager', () => {
  it('should register plugins correctly', () => {
    const manager = new PluginManager();
    const plugins = manager.getAvailablePlugins();
    expect(plugins.length).toBeGreaterThan(0);
  });
});
```

### Test Guidelines

- Write descriptive test names
- Test both success and failure cases
- Use proper assertions
- Mock external dependencies
- Maintain good test coverage

## 🔍 Code Review

### Review Guidelines

- Check code quality and style
- Verify functionality works
- Ensure tests are included
- Review documentation updates
- Consider security implications
- Check for performance issues

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Breaking changes are documented

## 📋 Release Process

### Versioning

We follow semantic versioning (SemVer):
- **Major** (1.0.0) - Breaking changes
- **Minor** (1.1.0) - New features
- **Patch** (1.0.1) - Bug fixes

### Release Steps

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm
5. Update documentation

## 🤔 Questions?

If you have questions about contributing:

1. **Check Documentation** - Review existing docs
2. **Search Issues** - Look for similar questions
3. **Join Discussions** - Use GitHub discussions
4. **Contact Maintainers** - Reach out directly

## 📄 License

By contributing to AI Scaffold, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- GitHub contributors page

Thank you for contributing to AI Scaffold! 🚀
