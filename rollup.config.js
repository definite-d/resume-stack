import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default [
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
      nodeResolve(),
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
      nodeResolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // Only generate declaration in UMD build
      }),
      terser(),
    ],
  },
];
