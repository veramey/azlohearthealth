/**
 * Scaffold validation tests for Issue #2
 * Validates project configuration files without runtime/HealthKit dependencies.
 * Uses Node.js fs to read actual files from repo root.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

describe('tsconfig.json', () => {
  let tsconfig: Record<string, unknown>;

  beforeAll(() => {
    const raw = fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf-8');
    tsconfig = JSON.parse(raw);
  });

  it('extends expo/tsconfig.base', () => {
    expect(tsconfig.extends).toBe('expo/tsconfig.base');
  });

  it('has strict mode enabled', () => {
    const options = tsconfig.compilerOptions as Record<string, unknown>;
    expect(options.strict).toBe(true);
  });
});

describe('package.json', () => {
  let pkg: Record<string, unknown>;

  beforeAll(() => {
    const raw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8');
    pkg = JSON.parse(raw);
  });

  const requiredDeps = [
    'expo-router',
    'react-native-health',
    'zustand',
    'date-fns',
    'react-native-gifted-charts',
    'expo-sqlite',
  ];

  it.each(requiredDeps)('lists required production dependency: %s', (dep) => {
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).toHaveProperty(dep);
  });

  it('lists expo-dev-client as a production dependency', () => {
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps).toHaveProperty('expo-dev-client');
  });
});

describe('app.config.ts', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let appConfig: any;

  beforeAll(() => {
    // Require the compiled config — jest-expo handles ts transpilation
    // We call the default export as a function (ConfigContext shape)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../app.config');
    const configFn = mod.default ?? mod;
    appConfig = typeof configFn === 'function' ? configFn({ config: {} }) : configFn;
  });

  it('has ios.bundleIdentifier set', () => {
    expect(appConfig.ios?.bundleIdentifier).toBeTruthy();
  });

  it('has ios.deploymentTarget set to "16.0"', () => {
    expect(appConfig.ios?.deploymentTarget).toBe('16.0');
  });

  it('has com.apple.developer.healthkit entitlement set to true', () => {
    expect(appConfig.ios?.entitlements?.['com.apple.developer.healthkit']).toBe(true);
  });

  it('includes NSHealthShareUsageDescription in ios.infoPlist', () => {
    expect(appConfig.ios?.infoPlist?.NSHealthShareUsageDescription).toBeTruthy();
  });

  it('includes NSHealthUpdateUsageDescription in ios.infoPlist', () => {
    expect(appConfig.ios?.infoPlist?.NSHealthUpdateUsageDescription).toBeTruthy();
  });

  it('lists expo-dev-client in plugins array', () => {
    const plugins: unknown[] = appConfig.plugins ?? [];
    const hasDevClient = plugins.some((p) =>
      p === 'expo-dev-client' || (Array.isArray(p) && p[0] === 'expo-dev-client'),
    );
    expect(hasDevClient).toBe(true);
  });
});

describe('project directory structure', () => {
  const requiredDirs = [
    'app',
    'components',
    'services',
    'stores',
    'hooks',
    'types',
    'constants',
    'utils',
  ];

  it.each(requiredDirs)('directory exists: %s', (dir) => {
    const dirPath = path.join(ROOT, dir);
    expect(fs.existsSync(dirPath)).toBe(true);
    expect(fs.statSync(dirPath).isDirectory()).toBe(true);
  });
});
