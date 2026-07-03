import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "node_modules", "pyodide");
const target = join(root, "public", "pyodide");
const files = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

if (existsSync(source)) {
  mkdirSync(target, { recursive: true });
  for (const file of files) {
    copyFileSync(join(source, file), join(target, file));
  }
}
