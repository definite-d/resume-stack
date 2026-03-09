import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import { createRequire } from "module";
import { rollup } from "rollup";

const require = createRequire(import.meta.url);

// Crypto polyfill plugin
const cryptoPolyfill = {
  name: "crypto-polyfill",
  resolveId(source) {
    if (source === "crypto") {
      return { id: "crypto", external: true };
    }
    return null;
  },
  load(id) {
    if (id === "crypto") {
      return 'import { createRequire } from "module"; const require = createRequire(import.meta.url); export default require("crypto");';
    }
    return null;
  },
};

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
      cryptoPolyfill,
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
      cryptoPolyfill,
      nodeResolve({
        preferBuiltins: true,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // Only generate declaration in UMD build
      }),
      terser(),
    ],
  },
]);
