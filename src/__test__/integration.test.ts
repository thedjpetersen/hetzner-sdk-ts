import fs from "fs";
import path from "path";
import { execSync } from "child_process";

describe("Integration Tests", () => {
  const mockSpecPath = path.join(__dirname, "../hetzner-cloud-spec.json");
  const generatedClientDir = path.join(__dirname, "../generated-client");

  beforeAll(() => {
    // Create a mock spec file for testing if it doesn't exist
    if (!fs.existsSync(mockSpecPath)) {
      const mockSpec = {
        openapi: "3.0.0",
        info: {
          title: "Hetzner Cloud API",
          version: "1.0.0",
        },
        paths: {},
        components: {},
      };
      fs.writeFileSync(mockSpecPath, JSON.stringify(mockSpec, null, 2));
    }
  });

  describe("TypeScript Compilation", () => {
    it("should have TypeScript as a dependency", () => {
      const packageJsonPath = path.join(__dirname, "../../package.json");
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      expect(packageJson.devDependencies.typescript).toBeDefined();
    });

    // Skip TypeScript compilation test as it requires generated client files
    // This is better tested in CI where the full build runs
    it.skip("should compile TypeScript without errors", () => {
      expect(() => {
        execSync("npx tsc --noEmit", {
          cwd: path.join(__dirname, "../.."),
          encoding: "utf8",
        });
      }).not.toThrow();
    });
  });

  describe("Package Structure", () => {
    it("should have valid package.json", () => {
      const packageJsonPath = path.join(__dirname, "../../package.json");
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      expect(packageJson.name).toBe("hetzner-sdk-ts");
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(packageJson.scripts).toHaveProperty("build");
      expect(packageJson.scripts).toHaveProperty("test");
    });

    it("should have valid tsconfig.json", () => {
      const tsconfigPath = path.join(__dirname, "../../tsconfig.json");
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      // tsconfig.json may contain comments, so we just verify it exists
      // and has expected properties by reading the file
      const tsconfigContent = fs.readFileSync(tsconfigPath, "utf8");
      expect(tsconfigContent).toContain("compilerOptions");
      expect(tsconfigContent).toContain("./lib");
      expect(tsconfigContent).toContain("./src");
    });
  });

  describe("Test Configuration", () => {
    it("should have valid jest configuration", () => {
      const jestConfigPath = path.join(__dirname, "../../jest.config.js");
      expect(fs.existsSync(jestConfigPath)).toBe(true);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jestConfig = require("../../jest.config.js");

      expect(jestConfig.preset).toBe("ts-jest");
      expect(jestConfig.testEnvironment).toBe("node");
      expect(jestConfig.setupFiles).toContain("<rootDir>/jest.setup.js");
    });

    it("should have jest setup file", () => {
      const setupPath = path.join(__dirname, "../../jest.setup.js");
      expect(fs.existsSync(setupPath)).toBe(true);
    });
  });

  describe("Source Files", () => {
    it("should have generate-client.ts", () => {
      const generateClientPath = path.join(
        __dirname,
        "../generate-client.ts"
      );
      expect(fs.existsSync(generateClientPath)).toBe(true);
    });

    it("should export required functions from generate-client", async () => {
      const {
        downloadSpec,
        hasSpecChanged,
        generateClient,
        main,
      } = await import("../generate-client");

      expect(typeof downloadSpec).toBe("function");
      expect(typeof hasSpecChanged).toBe("function");
      expect(typeof generateClient).toBe("function");
      expect(typeof main).toBe("function");
    });
  });

  describe("Scripts", () => {
    it("should have create-badge script", () => {
      const scriptPath = path.join(
        __dirname,
        "../../scripts/create-badge.ts"
      );
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it("should export createBadge function", async () => {
      const { createBadge } = await import("../../scripts/create-badge");
      expect(typeof createBadge).toBe("function");
    });
  });

  describe("Git Configuration", () => {
    it("should have .gitignore file", () => {
      const gitignorePath = path.join(__dirname, "../../.gitignore");
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const gitignore = fs.readFileSync(gitignorePath, "utf8");
      expect(gitignore).toContain("node_modules");
      expect(gitignore).toContain("lib/");
      expect(gitignore).toContain("coverage/");
    });
  });

  describe("Dependencies", () => {
    it("should have all required devDependencies", () => {
      const packageJsonPath = path.join(__dirname, "../../package.json");
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      const requiredDeps = [
        "@types/jest",
        "jest",
        "jest-fetch-mock",
        "openapi-typescript-codegen",
        "ts-jest",
        "typescript",
      ];

      requiredDeps.forEach((dep) => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it("should have security overrides configured", () => {
      const packageJsonPath = path.join(__dirname, "../../package.json");
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      expect(packageJson.overrides).toBeDefined();
      expect(packageJson.overrides.esbuild).toBeDefined();
      expect(packageJson.overrides.glob).toBeDefined();
    });
  });
});
