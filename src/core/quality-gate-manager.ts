import { ProjectContext, QualityGate } from '../types';
import { writeFile, ensureDir } from 'fs-extra';
import { join } from 'path';
import { execa } from 'execa';

export class QualityGateManager {
  async setupQualityGates(context: ProjectContext): Promise<void> {
    // Set up pre-commit hooks
    await this.setupPreCommitHooks(context);
    
    // Set up CI/CD configuration
    await this.setupCIConfiguration(context);
    
    // Set up quality check scripts
    await this.setupQualityScripts(context);
    
    // Set up lint-staged configuration
    await this.setupLintStaged(context);
  }

  private async setupPreCommitHooks(context: ProjectContext): Promise<void> {
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit quality checks..."

# Type checking
echo "📝 Type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ Type check failed"
  exit 1
fi

# Linting
echo "🧹 Linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed"
  exit 1
fi

# Testing
echo "🧪 Running tests..."
npm run test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ All quality checks passed!"
`;

    await ensureDir(join(context.path, '.husky'));
    await writeFile(join(context.path, '.husky', 'pre-commit'), preCommitContent);
  }

  private async setupCIConfiguration(context: ProjectContext): Promise<void> {
    const ciConfig = {
      name: 'Quality Gates',
      on: {
        push: {
          branches: ['main', 'develop']
        },
        pull_request: {
          branches: ['main', 'develop']
        }
      },
      jobs: {
        quality: {
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v4',
              with: {
                'node-version': '18',
                'cache': 'npm'
              }
            },
            {
              name: 'Install dependencies',
              run: 'npm ci'
            },
            {
              name: 'Type check',
              run: 'npm run typecheck'
            },
            {
              name: 'Lint',
              run: 'npm run lint'
            },
            {
              name: 'Test',
              run: 'npm run test:coverage'
            },
            {
              name: 'Build',
              run: 'npm run build'
            },
            {
              name: 'Upload coverage',
              uses: 'codecov/codecov-action@v3',
              with: {
                'file': './coverage/lcov.info'
              }
            }
          ]
        }
      }
    };

    await ensureDir(join(context.path, '.github', 'workflows'));
    await writeFile(
      join(context.path, '.github', 'workflows', 'quality.yml'),
      JSON.stringify(ciConfig, null, 2)
    );
  }

  private async setupQualityScripts(context: ProjectContext): Promise<void> {
    const qualityScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🔍 Running quality gates...'));

const checks = [
  {
    name: 'Type Check',
    command: 'npm run typecheck',
    required: true
  },
  {
    name: 'Lint',
    command: 'npm run lint',
    required: true
  },
  {
    name: 'Test',
    command: 'npm run test',
    required: true
  },
  {
    name: 'Build',
    command: 'npm run build',
    required: false
  }
];

let allPassed = true;

for (const check of checks) {
  try {
    console.log(chalk.yellow(\`Running \${check.name}...\`));
    execSync(check.command, { stdio: 'inherit' });
    console.log(chalk.green(\`✅ \${check.name} passed\`));
  } catch (error) {
    if (check.required) {
      console.log(chalk.red(\`❌ \${check.name} failed\`));
      allPassed = false;
    } else {
      console.log(chalk.yellow(\`⚠️  \${check.name} failed (not required)\`));
    }
  }
}

if (allPassed) {
  console.log(chalk.green('\\n🎉 All quality gates passed!'));
  process.exit(0);
} else {
  console.log(chalk.red('\\n💥 Some quality gates failed!'));
  process.exit(1);
}
`;

    await writeFile(join(context.path, 'scripts', 'quality.js'), qualityScript);
    await ensureDir(join(context.path, 'scripts'));
  }

  private async setupLintStaged(context: ProjectContext): Promise<void> {
    const lintStagedConfig = {
      '*.{ts,tsx,js,jsx}': [
        'eslint --fix',
        'prettier --write'
      ],
      '*.{json,md,yml,yaml}': [
        'prettier --write'
      ],
      '*.{css,scss}': [
        'prettier --write'
      ]
    };

    await writeFile(
      join(context.path, '.lintstagedrc.json'),
      JSON.stringify(lintStagedConfig, null, 2)
    );
  }

  async runQualityGates(context: ProjectContext): Promise<boolean> {
    const gates = this.getQualityGatesForContext(context);
    let allPassed = true;

    console.log('🔍 Running quality gates...');

    for (const gate of gates) {
      try {
        console.log(`Running ${gate.name}...`);
        await execa('sh', ['-c', gate.command], { cwd: context.path });
        console.log(`✅ ${gate.name} passed`);
      } catch (error) {
        if (gate.required) {
          console.log(`❌ ${gate.name} failed: ${gate.description}`);
          allPassed = false;
        } else {
          console.log(`⚠️  ${gate.name} failed (not required)`);
        }
      }
    }

    return allPassed;
  }

  private getQualityGatesForContext(context: ProjectContext): QualityGate[] {
    const baseGates: QualityGate[] = [
      {
        name: 'Type Check',
        command: 'npm run typecheck',
        required: true,
        description: 'TypeScript type checking'
      },
      {
        name: 'Lint',
        command: 'npm run lint',
        required: true,
        description: 'ESLint code quality check'
      },
      {
        name: 'Test',
        command: 'npm run test',
        required: true,
        description: 'Unit and integration tests'
      }
    ];

    // Add framework-specific gates
    switch (context.framework) {
      case 'next':
        baseGates.push({
          name: 'Build Check',
          command: 'npm run build',
          required: false,
          description: 'Next.js build verification'
        });
        break;
      case 'nuxt':
        baseGates.push({
          name: 'Build Check',
          command: 'npm run build',
          required: false,
          description: 'Nuxt.js build verification'
        });
        break;
    }

    // Add database-specific gates
    if (context.database === 'prisma') {
      baseGates.push({
        name: 'Prisma Generate',
        command: 'npx prisma generate',
        required: true,
        description: 'Prisma client generation'
      });
    }

    return baseGates;
  }

  async generateQualityReport(context: ProjectContext): Promise<void> {
    const gates = this.getQualityGatesForContext(context);
    const results: Array<{ gate: QualityGate; passed: boolean; error?: string }> = [];

    for (const gate of gates) {
      try {
        await execa('sh', ['-c', gate.command], { cwd: context.path });
        results.push({ gate, passed: true });
      } catch (error: any) {
        results.push({ gate, passed: false, error: error.message });
      }
    }

    const report = {
      timestamp: new Date().toISOString(),
      project: context.name,
      results: results.map(r => ({
        name: r.gate.name,
        description: r.gate.description,
        required: r.gate.required,
        passed: r.passed,
        error: r.error
      })),
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        requiredFailed: results.filter(r => !r.passed && r.gate.required).length
      }
    };

    await writeFile(
      join(context.path, 'quality-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📊 Quality report generated: quality-report.json');
  }
}
