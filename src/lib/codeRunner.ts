import type { CodeRunResult, CodeSnippet } from "../types/game";

const workerSource = `
let pyodideReadyPromise = null;
async function ensurePyodide() {
  if (!pyodideReadyPromise) {
    importScripts('/pyodide/pyodide.js');
    pyodideReadyPromise = loadPyodide({ indexURL: '/pyodide/' });
  }
  return pyodideReadyPromise;
}
self.onmessage = async (event) => {
  const { code, tests } = event.data;
  try {
    const pyodide = await ensurePyodide();
    pyodide.globals.set('USER_CODE', code);
    pyodide.globals.set('TESTS_JSON', JSON.stringify(tests));
    const result = pyodide.runPython(\`
import json, math
namespace = {}
result = {"passed": 0, "total": 0, "runtimeError": False, "cases": []}
try:
    exec(USER_CODE, namespace)
    tests = json.loads(TESTS_JSON)
    result["total"] = len(tests)
    for case in tests:
        case_res = {"call": case["call"], "expected": case["expected"], "passed": False}
        try:
            actual = eval(case["call"], namespace)
            try:
                json.dumps(actual)
                case_res["actual"] = actual
            except Exception:
                case_res["actual"] = str(actual)
            
            if actual == case["expected"]:
                result["passed"] += 1
                case_res["passed"] = True
        except Exception as e:
            case_res["error"] = str(e)
        result["cases"].append(case_res)
except Exception as e:
    result["runtimeError"] = True
json.dumps(result)
\`);
    self.postMessage(JSON.parse(result));
  } catch (error) {
    self.postMessage({ passed: 0, total: tests.length, runtimeError: true });
  }
};`;

export function runPythonSnippet(snippet: CodeSnippet, code: string, timeoutMs = 3000): Promise<CodeRunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" })));
    const timeout = window.setTimeout(() => {
      worker.terminate();
      resolve({ passed: 0, total: snippet.tests.length, timedOut: true });
    }, timeoutMs);
    worker.onmessage = (event: MessageEvent<CodeRunResult>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve({ passed: 0, total: snippet.tests.length, runtimeError: true });
    };
    worker.postMessage({ code, tests: snippet.tests });
  });
}
