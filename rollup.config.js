import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

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
        browser: false,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      terser(),
    ],
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
        browser: false,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // Only generate declaration in UMD build
      }),
      terser(),
    ],
  },
]);
