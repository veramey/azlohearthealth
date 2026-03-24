/**
 * Tests for Issue #2: Project initialization configuration.
 * These tests verify the scaffold is correctly configured by reading
 * actual config files from the repo root — no mocking needed.
 */

import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

describe("tsconfig.json", () => {
  let tsconfig: Record<string, unknown>;

  beforeAll(() => {
    const raw = fs.readFileSync(path.join(root, "tsconfig.json"), "utf-8");
    tsconfig = JSON.parse(raw);
  });

  it("extends expo/tsconfig.base", () => {
    expect(tsconfig.extends).toBe("expo/tsconfig.base");
  });

  it("has strict mode enabled", () => {
    const options = tsconfig.compilerOptions as Record<string, unknown>;
    expect(options.strict).toBe(true);
  });
});

describe("package.json", () => {
  let pkg: Record<string, unknown>;

  beforeAll(() => {
    const raw = fs.readFileSync(path.join(root, "package.json"), "utf-8");
    pkg = JSON.parse(raw);
  });

  const requiredDeps = [
    "expo-router",
    "react-native-health",
    "zustand",
    "date-fns",
    "react-native-gifted-charts",
    "expo-sqlite",
  ];

  it.each(requiredDeps)(
    "lists required production dependency: %s",
    (dep) => {
      const deps = pkg.dependencies as Record<string, string>;
      expect(deps).toHaveProperty(dep);
    }
  );
});

describe("app.config.ts", () => {
  // We import the compiled/evaluated config via require
  let config: {
    ios?: {
      bundleIdentifier?: string;
      deploymentTarget?: string;
      infoPlist?: Record<string, string>;
      entitlements?: Record<string, unknown>;
    };
    plugins?: unknown[];
  };

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(path.join(root, "app.config.ts"));
    // app.config.ts exports a function that receives { config }
    const factory = mod.default ?? mod;
    config = typeof factory === "function" ? factory({ config: {} }) : factory;
  });

  it("sets ios.bundleIdentifier", () => {
    expect(config.ios?.bundleIdentifier).toBeTruthy();
  });

  it("sets ios.deploymentTarget to 16.0", () => {
    expect(config.ios?.deploymentTarget).toBe("16.0");
  });

  it("sets HealthKit entitlement to true", () => {
    expect(
      config.ios?.entitlements?.["com.apple.developer.healthkit"]
    ).toBe(true);
  });

  it("includes NSHealthShareUsageDescription in infoPlist", () => {
    expect(
      config.ios?.infoPlist?.["NSHealthShareUsageDescription"]
    ).toBeTruthy();
  });

  it("includes NSHealthUpdateUsageDescription in infoPlist", () => {
    expect(
      config.ios?.infoPlist?.["NSHealthUpdateUsageDescription"]
    ).toBeTruthy();
  });

  it("includes expo-dev-client in plugins array", () => {
    const plugins = config.plugins ?? [];
    const hasDevClient = plugins.some(
      (p) => p === "expo-dev-client" || (Array.isArray(p) && p[0] === "expo-dev-client")
    );
    expect(hasDevClient).toBe(true);
  });
});

describe("Project directory structure", () => {
  const requiredDirs = [
    "app",
    "components",
    "services",
    "stores",
    "hooks",
    "types",
    "constants",
    "utils",
  ];

  it.each(requiredDirs)("directory exists: %s", (dir) => {
    const dirPath = path.join(root, dir);
    expect(fs.existsSync(dirPath)).toBe(true);
    expect(fs.statSync(dirPath).isDirectory()).toBe(true);
  });
});
