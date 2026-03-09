import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default defineConfig([
  // UMD build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "ResumeStack",
      sourcemap: true,
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      terser(),
    ],
    external: ["crypto"],
  },
  // ES Module build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // Only generate declaration in UMD build
      }),
      terser(),
    ],
    external: ["crypto"],
  },
]);
