export interface ProjectContext {
  name: string;
  description?: string;
  stack: string;
  framework?: string;
  database?: string;
  authProvider?: string;
  stateManagement?: string;
  testingFramework?: string;
  aiTools: string[];
  teamSize?: number;
  industry?: string;
  securityLevel?: 'basic' | 'standard' | 'high';
  deploymentTarget?: string;
  path: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface ScaffoldPlugin {
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
  qualityGates?: QualityGate[];
  devTools?: DevTool[];
}

export interface TemplateFile {
  path: string;
  content: string;
  template?: boolean;
  executable?: boolean;
  condition?: (context: ProjectContext) => boolean;
}

export interface QualityGate {
  name: string;
  command: string;
  required: boolean;
  description: string;
}

export interface DevTool {
  name: string;
  type: 'container' | 'service' | 'script';
  config: Record<string, any>;
}

export interface StackTemplate {
  name: string;
  description: string;
  tags: string[];
  aiCompatibility: string[];
  structure: string[];
  dependencies: {
    dev: string[];
    runtime: string[];
  };
  aiSetup: {
    cursorRules: boolean;
    agentsMd: boolean;
    contextFiles: string[];
  };
  qualityGates: QualityGate[];
  devTools: DevTool[];
  plugins: string[];
}

export interface AIToolConfig {
  name: string;
  setup: {
    configFiles: string[];
    rules: string;
    context: string[];
  };
  optimization: {
    patterns: string[];
    antiPatterns: string[];
  };
}

export interface HealthCheck {
  category: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fix?: string;
}

export interface TeamConfig {
  aiGuidelines: string;
  codeReview: string[];
  qualityStandards: Record<string, any>;
  onboarding: string[];
}
