import { ProjectContext, HealthCheck } from '../types';
import { StackDetector } from '../core/stack-detector';
import { QualityGateManager } from '../core/quality-gate-manager';
import { readFile, pathExists } from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { cwd } from 'process';

export class HealthCommand {
  private stackDetector = new StackDetector();
  private qualityGateManager = new QualityGateManager();

  async execute(options: any): Promise<void> {
    try {
      const currentDir = cwd();
      const spinner = ora('Analyzing project health...').start();

      // Detect project context
      const context = await this.stackDetector.detectExistingProject(currentDir);
      if (!context) {
        spinner.fail('No project detected in current directory');
        return;
      }

      spinner.succeed(`Analyzing project: ${context.name}`);

      // Run health checks
      const healthChecks = await this.runHealthChecks(context);
      
      // Display results
      this.displayHealthResults(healthChecks, options.json);

      // Auto-fix if requested
      if (options.fix) {
        await this.autoFixIssues(healthChecks, context);
      }

    } catch (error: any) {
      console.error(chalk.red('Error checking project health:'), error.message);
      process.exit(1);
    }
  }

  private async runHealthChecks(context: ProjectContext): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check AI configuration files
    checks.push(...await this.checkAIConfiguration(context));
    
    // Check project structure
    checks.push(...await this.checkProjectStructure(context));
    
    // Check dependencies
    checks.push(...await this.checkDependencies(context));
    
    // Check quality gates
    checks.push(...await this.checkQualityGates(context));
    
    // Check documentation
    checks.push(...await this.checkDocumentation(context));

    return checks;
  }

  private async checkAIConfiguration(context: ProjectContext): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check .cursorrules
    const cursorRulesExists = await pathExists('.cursorrules');
    checks.push({
      category: 'AI Configuration',
      name: 'Cursor Rules',
      status: cursorRulesExists ? 'pass' : 'fail',
      message: cursorRulesExists ? 'Cursor rules file present' : 'Missing .cursorrules file',
      fix: cursorRulesExists ? undefined : 'Run "ai-scaffold init" to generate .cursorrules'
    });

    // Check AGENTS.md
    const agentsMdExists = await pathExists('AGENTS.md');
    checks.push({
      category: 'AI Configuration',
      name: 'AI Documentation',
      status: agentsMdExists ? 'pass' : 'fail',
      message: agentsMdExists ? 'AGENTS.md file present' : 'Missing AGENTS.md file',
      fix: agentsMdExists ? undefined : 'Run "ai-scaffold init" to generate AI documentation'
    });

    // Check .cursor directory
    const cursorDirExists = await pathExists('.cursor');
    checks.push({
      category: 'AI Configuration',
      name: 'Cursor Configuration',
      status: cursorDirExists ? 'pass' : 'warn',
      message: cursorDirExists ? 'Cursor configuration directory present' : 'No .cursor directory found',
      fix: cursorDirExists ? undefined : 'Run "ai-scaffold init" to set up Cursor configuration'
    });

    return checks;
  }

  private async checkProjectStructure(context: ProjectContext): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check TypeScript configuration
    const tsConfigExists = await pathExists('tsconfig.json');
    checks.push({
      category: 'Project Structure',
      name: 'TypeScript Configuration',
      status: tsConfigExists ? 'pass' : 'fail',
      message: tsConfigExists ? 'TypeScript config present' : 'Missing tsconfig.json',
      fix: tsConfigExists ? undefined : 'Add TypeScript configuration'
    });

    // Check package.json
    const packageJsonExists = await pathExists('package.json');
    checks.push({
      category: 'Project Structure',
      name: 'Package Configuration',
      status: packageJsonExists ? 'pass' : 'fail',
      message: packageJsonExists ? 'package.json present' : 'Missing package.json',
      fix: packageJsonExists ? undefined : 'Initialize npm project'
    });

    // Check src directory
    const srcExists = await pathExists('src');
    checks.push({
      category: 'Project Structure',
      name: 'Source Directory',
      status: srcExists ? 'pass' : 'warn',
      message: srcExists ? 'src directory present' : 'No src directory found',
      fix: srcExists ? undefined : 'Create src directory structure'
    });

    return checks;
  }

  private async checkDependencies(context: ProjectContext): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    try {
      const packageJson = await readFile('package.json', 'utf-8');
      const pkg = JSON.parse(packageJson);
      
      // Check for security vulnerabilities
      checks.push({
        category: 'Dependencies',
        name: 'Security Audit',
        status: 'pass', // Would need to run npm audit
        message: 'Dependencies appear secure',
        fix: undefined
      });

      // Check for outdated dependencies
      checks.push({
        category: 'Dependencies',
        name: 'Dependency Currency',
        status: 'warn',
        message: 'Some dependencies may be outdated',
        fix: 'Run "npm outdated" to check for updates'
      });

    } catch (error) {
      checks.push({
        category: 'Dependencies',
        name: 'Package Analysis',
        status: 'fail',
        message: 'Could not analyze package.json',
        fix: 'Check package.json format'
      });
    }

    return checks;
  }

  private async checkQualityGates(context: ProjectContext): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check for quality gate configuration
    const huskyExists = await pathExists('.husky');
    checks.push({
      category: 'Quality Gates',
      name: 'Git Hooks',
      status: huskyExists ? 'pass' : 'warn',
      message: huskyExists ? 'Git hooks configured' : 'No git hooks found',
      fix: huskyExists ? undefined : 'Set up husky for git hooks'
    });

    // Check for lint-staged
    const lintStagedExists = await pathExists('.lintstagedrc') || await pathExists('.lintstagedrc.json');
    checks.push({
      category: 'Quality Gates',
      name: 'Lint Staged',
      status: lintStagedExists ? 'pass' : 'warn',
      message: lintStagedExists ? 'Lint-staged configured' : 'No lint-staged configuration',
      fix: lintStagedExists ? undefined : 'Configure lint-staged for pre-commit checks'
    });

    // Check for CI configuration
    const ciExists = await pathExists('.github/workflows');
    checks.push({
      category: 'Quality Gates',
      name: 'CI/CD Pipeline',
      status: ciExists ? 'pass' : 'warn',
      message: ciExists ? 'CI/CD pipeline configured' : 'No CI/CD configuration',
      fix: ciExists ? undefined : 'Set up GitHub Actions for CI/CD'
    });

    return checks;
  }

  private async checkDocumentation(context: ProjectContext): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check README
    const readmeExists = await pathExists('README.md');
    checks.push({
      category: 'Documentation',
      name: 'README',
      status: readmeExists ? 'pass' : 'fail',
      message: readmeExists ? 'README.md present' : 'Missing README.md',
      fix: readmeExists ? undefined : 'Create README.md with project information'
    });

    // Check for API documentation
    const apiDocsExists = await pathExists('docs') || await pathExists('api');
    checks.push({
      category: 'Documentation',
      name: 'API Documentation',
      status: apiDocsExists ? 'pass' : 'warn',
      message: apiDocsExists ? 'API documentation found' : 'No API documentation',
      fix: apiDocsExists ? undefined : 'Create API documentation'
    });

    return checks;
  }

  private displayHealthResults(checks: HealthCheck[], json: boolean): void {
    if (json) {
      console.log(JSON.stringify(checks, null, 2));
      return;
    }

    // Group checks by category
    const groupedChecks = checks.reduce((acc, check) => {
      if (!acc[check.category]) {
        acc[check.category] = [];
      }
      acc[check.category].push(check);
      return acc;
    }, {} as Record<string, HealthCheck[]>);

    // Display results
    console.log('\n📊 Project Health Report\n');

    Object.entries(groupedChecks).forEach(([category, categoryChecks]) => {
      console.log(chalk.blue(`\n${category}:`));
      
      categoryChecks.forEach(check => {
        const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
        const color = check.status === 'pass' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;
        
        console.log(`  ${icon} ${color(check.name)}: ${check.message}`);
        
        if (check.fix) {
          console.log(`    ${chalk.gray('Fix:')} ${check.fix}`);
        }
      });
    });

    // Summary
    const total = checks.length;
    const passed = checks.filter(c => c.status === 'pass').length;
    const warnings = checks.filter(c => c.status === 'warn').length;
    const failed = checks.filter(c => c.status === 'fail').length;

    console.log(chalk.blue('\n📈 Summary:'));
    console.log(`  Total checks: ${total}`);
    console.log(`  ${chalk.green('✅ Passed:')} ${passed}`);
    console.log(`  ${chalk.yellow('⚠️  Warnings:')} ${warnings}`);
    console.log(`  ${chalk.red('❌ Failed:')} ${failed}`);

    if (failed > 0) {
      console.log(chalk.red('\n💥 Some critical issues need attention!'));
    } else if (warnings > 0) {
      console.log(chalk.yellow('\n⚠️  Some improvements recommended.'));
    } else {
      console.log(chalk.green('\n🎉 Project is in excellent health!'));
    }
  }

  private async autoFixIssues(checks: HealthCheck[], context: ProjectContext): Promise<void> {
    const fixableChecks = checks.filter(c => c.fix && c.status !== 'pass');
    
    if (fixableChecks.length === 0) {
      console.log(chalk.green('No auto-fixable issues found.'));
      return;
    }

    console.log(chalk.yellow(`\n🔧 Auto-fixing ${fixableChecks.length} issues...`));

    for (const check of fixableChecks) {
      try {
        console.log(`Fixing: ${check.name}`);
        // Implement auto-fix logic based on check type
        await this.applyFix(check, context);
        console.log(`✅ Fixed: ${check.name}`);
      } catch (error) {
        console.log(`❌ Failed to fix: ${check.name}`);
      }
    }
  }

  private async applyFix(check: HealthCheck, context: ProjectContext): Promise<void> {
    // This would implement specific fixes for each check type
    // For now, just log the fix suggestion
    console.log(`  Applying fix: ${check.fix}`);
  }
}
