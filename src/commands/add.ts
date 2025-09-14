import { ProjectContext } from '../types';
import { StackDetector } from '../core/stack-detector';
import { PluginManager } from '../core/plugin-manager';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { cwd } from 'process';

export class AddCommand {
  private stackDetector = new StackDetector();
  private pluginManager = new PluginManager();

  async execute(plugin: string, options: any): Promise<void> {
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

      // Handle different plugin types
      if (plugin === 'database') {
        await this.addDatabasePlugin(context, options);
      } else if (plugin === 'auth') {
        await this.addAuthPlugin(context, options);
      } else if (plugin === 'testing') {
        await this.addTestingPlugin(context, options);
      } else if (plugin === 'state') {
        await this.addStatePlugin(context, options);
      } else {
        // Try to add as a specific plugin
        await this.addSpecificPlugin(plugin, context, options);
      }

    } catch (error: any) {
      console.error(chalk.red('Error adding plugin:'), error.message);
      process.exit(1);
    }
  }

  private async addDatabasePlugin(context: ProjectContext, options: any): Promise<void> {
    const availableDatabases = [
      { name: 'Supabase', value: 'supabase' },
      { name: 'Prisma', value: 'prisma' },
      { name: 'MongoDB', value: 'mongodb' },
      { name: 'PostgreSQL', value: 'postgresql' },
      { name: 'MySQL', value: 'mysql' }
    ];

    let databaseType = options.type;
    
    if (!databaseType) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'database',
          message: 'Choose database type:',
          choices: availableDatabases
        }
      ]);
      databaseType = answers.database;
    }

    const pluginName = `database-${databaseType}`;
    const spinner = ora(`Adding ${pluginName} plugin...`).start();

    try {
      await this.pluginManager.addPlugin(pluginName, context);
      spinner.succeed(`Added ${pluginName} plugin`);
      
      console.log(chalk.green(`\n✅ Database plugin added successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      
      switch (databaseType) {
        case 'supabase':
          console.log('  1. Set up your Supabase project');
          console.log('  2. Add environment variables to .env.local');
          console.log('  3. Update your schema in Supabase dashboard');
          break;
        case 'prisma':
          console.log('  1. Run "npx prisma generate"');
          console.log('  2. Set up your database connection');
          console.log('  3. Run "npx prisma migrate dev"');
          break;
      }
    } catch (error: any) {
      spinner.fail(`Failed to add ${pluginName} plugin: ${error.message}`);
    }
  }

  private async addAuthPlugin(context: ProjectContext, options: any): Promise<void> {
    const availableAuthProviders = [
      { name: 'Supabase Auth', value: 'supabase-auth' },
      { name: 'Clerk', value: 'clerk' },
      { name: 'Auth0', value: 'auth0' },
      { name: 'NextAuth.js', value: 'nextauth' },
      { name: 'Firebase Auth', value: 'firebase-auth' }
    ];

    let authProvider = options.type;
    
    if (!authProvider) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'auth',
          message: 'Choose authentication provider:',
          choices: availableAuthProviders
        }
      ]);
      authProvider = answers.auth;
    }

    const pluginName = `auth-${authProvider}`;
    const spinner = ora(`Adding ${pluginName} plugin...`).start();

    try {
      await this.pluginManager.addPlugin(pluginName, context);
      spinner.succeed(`Added ${pluginName} plugin`);
      
      console.log(chalk.green(`\n✅ Authentication plugin added successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      
      switch (authProvider) {
        case 'supabase-auth':
          console.log('  1. Configure Supabase Auth in your dashboard');
          console.log('  2. Add auth environment variables');
          console.log('  3. Set up auth components');
          break;
        case 'clerk':
          console.log('  1. Create Clerk application');
          console.log('  2. Add Clerk environment variables');
          console.log('  3. Wrap your app with ClerkProvider');
          break;
        case 'auth0':
          console.log('  1. Set up Auth0 application');
          console.log('  2. Configure Auth0 settings');
          console.log('  3. Add environment variables');
          break;
      }
    } catch (error: any) {
      spinner.fail(`Failed to add ${pluginName} plugin: ${error.message}`);
    }
  }

  private async addTestingPlugin(context: ProjectContext, options: any): Promise<void> {
    const availableTestingFrameworks = [
      { name: 'Vitest', value: 'vitest' },
      { name: 'Jest', value: 'jest' },
      { name: 'Testing Library', value: 'testing-library' },
      { name: 'Cypress', value: 'cypress' },
      { name: 'Playwright', value: 'playwright' }
    ];

    let testingFramework = options.type;
    
    if (!testingFramework) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'testing',
          message: 'Choose testing framework:',
          choices: availableTestingFrameworks
        }
      ]);
      testingFramework = answers.testing;
    }

    const pluginName = `testing-${testingFramework}`;
    const spinner = ora(`Adding ${pluginName} plugin...`).start();

    try {
      await this.pluginManager.addPlugin(pluginName, context);
      spinner.succeed(`Added ${pluginName} plugin`);
      
      console.log(chalk.green(`\n✅ Testing plugin added successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      
      switch (testingFramework) {
        case 'vitest':
          console.log('  1. Run "npm install" to install dependencies');
          console.log('  2. Create test files with .test.ts extension');
          console.log('  3. Run "npm test" to run tests');
          break;
        case 'jest':
          console.log('  1. Run "npm install" to install dependencies');
          console.log('  2. Create test files with .test.ts extension');
          console.log('  3. Run "npm test" to run tests');
          break;
        case 'cypress':
          console.log('  1. Run "npx cypress open" to set up tests');
          console.log('  2. Create test files in cypress/e2e/');
          console.log('  3. Run "npx cypress run" for headless testing');
          break;
      }
    } catch (error: any) {
      spinner.fail(`Failed to add ${pluginName} plugin: ${error.message}`);
    }
  }

  private async addStatePlugin(context: ProjectContext, options: any): Promise<void> {
    const availableStateManagers = [
      { name: 'Zustand', value: 'zustand' },
      { name: 'Redux Toolkit', value: 'redux' },
      { name: 'Jotai', value: 'jotai' },
      { name: 'Recoil', value: 'recoil' },
      { name: 'MobX', value: 'mobx' }
    ];

    let stateManager = options.type;
    
    if (!stateManager) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'state',
          message: 'Choose state management solution:',
          choices: availableStateManagers
        }
      ]);
      stateManager = answers.state;
    }

    const pluginName = `state-${stateManager}`;
    const spinner = ora(`Adding ${pluginName} plugin...`).start();

    try {
      await this.pluginManager.addPlugin(pluginName, context);
      spinner.succeed(`Added ${pluginName} plugin`);
      
      console.log(chalk.green(`\n✅ State management plugin added successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      
      switch (stateManager) {
        case 'zustand':
          console.log('  1. Create stores in src/store/');
          console.log('  2. Use stores in components with useStore hook');
          console.log('  3. Follow Zustand patterns for state management');
          break;
        case 'redux':
          console.log('  1. Create slices in src/store/features/');
          console.log('  2. Use typed hooks (useAppSelector, useAppDispatch)');
          console.log('  3. Follow Redux Toolkit patterns');
          break;
      }
    } catch (error: any) {
      spinner.fail(`Failed to add ${pluginName} plugin: ${error.message}`);
    }
  }

  private async addSpecificPlugin(pluginName: string, context: ProjectContext, options: any): Promise<void> {
    const spinner = ora(`Adding ${pluginName} plugin...`).start();

    try {
      await this.pluginManager.addPlugin(pluginName, context);
      spinner.succeed(`Added ${pluginName} plugin`);
      
      console.log(chalk.green(`\n✅ Plugin ${pluginName} added successfully!`));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log('  1. Review the generated files');
      console.log('  2. Install any new dependencies');
      console.log('  3. Configure the plugin as needed');
    } catch (error: any) {
      spinner.fail(`Failed to add ${pluginName} plugin: ${error.message}`);
      
      // Show available plugins
      const availablePlugins = this.pluginManager.getAvailablePlugins();
      console.log(chalk.yellow('\n📋 Available plugins:'));
      availablePlugins.forEach(plugin => {
        console.log(`  • ${plugin.name} - ${plugin.description}`);
      });
    }
  }
}
