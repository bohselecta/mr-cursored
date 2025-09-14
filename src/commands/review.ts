import { ProjectContext } from '../types';
import { StackDetector } from '../core/stack-detector';
import chalk from 'chalk';
import ora from 'ora';
import { cwd } from 'process';
import { execa } from 'execa';

export class ReviewCommand {
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

      // Determine files to review
      const filesToReview = await this.getFilesToReview(options);

      if (filesToReview.length === 0) {
        console.log(chalk.yellow('No files to review'));
        return;
      }

      // Run AI-assisted code review
      await this.runCodeReview(filesToReview, context);

    } catch (error: any) {
      console.error(chalk.red('Error running code review:'), error.message);
      process.exit(1);
    }
  }

  private async getFilesToReview(options: any): Promise<string[]> {
    if (options.files) {
      return options.files.split(',');
    }

    if (options.all) {
      // Get all changed files from git
      try {
        const { stdout } = await execa('git', ['diff', '--name-only', 'HEAD~1']);
        return stdout.split('\n').filter(file => file.trim());
      } catch (error) {
        console.log(chalk.yellow('Could not get git diff, reviewing all TypeScript files'));
        return await this.getAllTypeScriptFiles();
      }
    }

    // Default: get staged files
    try {
      const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
      return stdout.split('\n').filter(file => file.trim());
    } catch (error) {
      console.log(chalk.yellow('Could not get staged files, reviewing all TypeScript files'));
      return await this.getAllTypeScriptFiles();
    }
  }

  private async getAllTypeScriptFiles(): Promise<string[]> {
    try {
      const { stdout } = await execa('find', ['src', '-name', '*.ts', '-o', '-name', '*.tsx']);
      return stdout.split('\n').filter(file => file.trim());
    } catch (error) {
      return [];
    }
  }

  private async runCodeReview(files: string[], context: ProjectContext): Promise<void> {
    console.log(chalk.blue(`\n🔍 Running AI-assisted code review for ${files.length} files\n`));

    for (const file of files) {
      await this.reviewFile(file, context);
    }

    console.log(chalk.green('\n✅ Code review completed!'));
  }

  private async reviewFile(filePath: string, context: ProjectContext): Promise<void> {
    const spinner = ora(`Reviewing ${filePath}...`).start();

    try {
      // Read file content
      const { stdout } = await execa('cat', [filePath]);
      const content = stdout;

      // Run basic quality checks
      const issues = await this.analyzeFile(filePath, content, context);

      if (issues.length === 0) {
        spinner.succeed(`${filePath} - No issues found`);
      } else {
        spinner.warn(`${filePath} - ${issues.length} issues found`);
        this.displayIssues(filePath, issues);
      }

    } catch (error) {
      spinner.fail(`${filePath} - Could not review file`);
    }
  }

  private async analyzeFile(filePath: string, content: string, context: ProjectContext): Promise<any[]> {
    const issues: any[] = [];

    // Check for common issues
    issues.push(...this.checkTypeScriptIssues(content));
    issues.push(...this.checkSecurityIssues(content));
    issues.push(...this.checkPerformanceIssues(content));
    issues.push(...this.checkAccessibilityIssues(content));
    issues.push(...this.checkBestPractices(content, context));

    return issues;
  }

  private checkTypeScriptIssues(content: string): any[] {
    const issues: any[] = [];

    // Check for any types
    if (content.includes(': any')) {
      issues.push({
        type: 'warning',
        category: 'TypeScript',
        message: 'Avoid using "any" type',
        suggestion: 'Use specific types or unknown instead'
      });
    }

    // Check for missing return types
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*{/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      if (!match[0].includes(':')) {
        issues.push({
          type: 'info',
          category: 'TypeScript',
          message: 'Function missing return type annotation',
          suggestion: 'Add explicit return type for better type safety'
        });
      }
    }

    // Check for console.log in production code
    if (content.includes('console.log')) {
      issues.push({
        type: 'warning',
        category: 'Debugging',
        message: 'Console.log found in code',
        suggestion: 'Remove or replace with proper logging'
      });
    }

    return issues;
  }

  private checkSecurityIssues(content: string): any[] {
    const issues: any[] = [];

    // Check for potential SQL injection
    if (content.includes('SELECT') && content.includes('+')) {
      issues.push({
        type: 'error',
        category: 'Security',
        message: 'Potential SQL injection vulnerability',
        suggestion: 'Use parameterized queries or ORM'
      });
    }

    // Check for eval usage
    if (content.includes('eval(')) {
      issues.push({
        type: 'error',
        category: 'Security',
        message: 'Use of eval() is dangerous',
        suggestion: 'Avoid eval() and use safer alternatives'
      });
    }

    // Check for innerHTML usage
    if (content.includes('.innerHTML =')) {
      issues.push({
        type: 'warning',
        category: 'Security',
        message: 'innerHTML can lead to XSS attacks',
        suggestion: 'Use textContent or sanitize input'
      });
    }

    return issues;
  }

  private checkPerformanceIssues(content: string): any[] {
    const issues: any[] = [];

    // Check for missing React.memo
    if (content.includes('export const') && content.includes('React.FC') && !content.includes('React.memo')) {
      issues.push({
        type: 'info',
        category: 'Performance',
        message: 'Consider using React.memo for optimization',
        suggestion: 'Wrap component with React.memo if it receives stable props'
      });
    }

    // Check for missing useMemo/useCallback
    if (content.includes('useState') && content.includes('expensive') && !content.includes('useMemo')) {
      issues.push({
        type: 'info',
        category: 'Performance',
        message: 'Consider using useMemo for expensive calculations',
        suggestion: 'Memoize expensive computations with useMemo'
      });
    }

    return issues;
  }

  private checkAccessibilityIssues(content: string): any[] {
    const issues: any[] = [];

    // Check for missing alt attributes
    if (content.includes('<img') && !content.includes('alt=')) {
      issues.push({
        type: 'warning',
        category: 'Accessibility',
        message: 'Image missing alt attribute',
        suggestion: 'Add descriptive alt text for accessibility'
      });
    }

    // Check for missing button types
    if (content.includes('<button') && !content.includes('type=')) {
      issues.push({
        type: 'warning',
        category: 'Accessibility',
        message: 'Button missing type attribute',
        suggestion: 'Add type="button" or type="submit" as appropriate'
      });
    }

    return issues;
  }

  private checkBestPractices(content: string, context: ProjectContext): any[] {
    const issues: any[] = [];

    // Check for hardcoded strings
    if (content.includes('"http://') || content.includes("'http://")) {
      issues.push({
        type: 'warning',
        category: 'Best Practices',
        message: 'Hardcoded URL found',
        suggestion: 'Use environment variables for URLs'
      });
    }

    // Check for missing error handling
    if (content.includes('fetch(') && !content.includes('catch')) {
      issues.push({
        type: 'warning',
        category: 'Best Practices',
        message: 'API call missing error handling',
        suggestion: 'Add try-catch or .catch() for error handling'
      });
    }

    // Check for magic numbers
    const magicNumberRegex = /\b\d{3,}\b/g;
    if (magicNumberRegex.test(content)) {
      issues.push({
        type: 'info',
        category: 'Best Practices',
        message: 'Magic number detected',
        suggestion: 'Consider using named constants instead'
      });
    }

    return issues;
  }

  private displayIssues(filePath: string, issues: any[]): void {
    console.log(chalk.yellow(`\n📄 ${filePath}:`));

    issues.forEach(issue => {
      const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
      const color = issue.type === 'error' ? chalk.red : issue.type === 'warning' ? chalk.yellow : chalk.blue;
      
      console.log(`  ${icon} ${color(issue.category)}: ${issue.message}`);
      console.log(`    ${chalk.gray('Suggestion:')} ${issue.suggestion}`);
    });
  }
}
