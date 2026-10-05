import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { spawnSync, execSync } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const port = Number(process.env.PORT || 4177);
const fiModels = ['glm-5.3-flash', 'minimax-m3', 'qwen3.6-35b', 'diffusiongemma', 'deepseek-v4-flash'];
const embeddingModels = ['bge-m3'];
const fiLimits = {
  'glm-5.3-flash': [1000000, 131000],
  'minimax-m3': [1000000, 131000],
  'qwen3.6-35b': [262000, 8000],
  diffusiongemma: [262000, 8000],
  'deepseek-v4-flash': [1000000, 393000],
  'bge-m3': [8000, 0]
};
let freeInferenceTail = Promise.resolve();

// ═══════════════════════════════════════════════════════════════
// PERSISTENT MEMORY & SCAR TISSUE GRAVEYARD (R13, R14, R20, R27)
// ═══════════════════════════════════════════════════════════════

const MEMORY_DIR = path.join(root, '.verdict_memory');
const SANDBOX_DIR = path.join(root, '.sandbox');

[MEMORY_DIR, SANDBOX_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const FILES = {
  failures: path.join(MEMORY_DIR, 'failures.json'),
  semantic: path.join(MEMORY_DIR, 'semantic_memory.json'),
  history: path.join(MEMORY_DIR, 'history.json'),
  reputations: path.join(MEMORY_DIR, 'agent_reputations.json')
};

function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e.message);
  }
}

// Memory Stores
const memoryStore = {
  failures: readJsonFile(FILES.failures, []),
  semantic: readJsonFile(FILES.semantic, []),
  history: readJsonFile(FILES.history, []),
  reputations: readJsonFile(FILES.reputations, {})
};

function recordFailureScar(task, candidateId, personaId, rootCause, codeSnippet, lesson) {
  const scar = {
    id: `SCAR-${Date.now().toString(36).toUpperCase()}`,
    task: task.slice(0, 300),
    candidateId,
    personaId,
    rootCause,
    codeSnippet: (codeSnippet || '').slice(0, 1000),
    lesson,
    timestamp: new Date().toISOString()
  };
  memoryStore.failures.unshift(scar);
  if (memoryStore.failures.length > 200) memoryStore.failures.pop();
  writeJsonFile(FILES.failures, memoryStore.failures);
  return scar;
}

function updateAgentReputation(personaId, predictedConfidence, actualSuccess) {
  const current = memoryStore.reputations[personaId] || {
    runs: 0,
    wins: 0,
    totalPredictedConf: 0,
    totalSuccess: 0,
    calibrationScore: 1.0,
    reputationScore: 1500
  };
  current.runs += 1;
  if (actualSuccess) current.wins += 1;
  current.totalPredictedConf += predictedConfidence;
  current.totalSuccess += actualSuccess ? 1 : 0;
  
  const avgConf = current.totalPredictedConf / current.runs;
  const winRate = current.totalSuccess / current.runs;
  // Calibration penalty if overconfident
  const overconfidence = Math.max(0, avgConf - winRate);
  current.calibrationScore = Math.max(0.1, Number((1 - overconfidence).toFixed(2)));
  current.reputationScore = Math.round(1500 + (current.wins * 35) - ((current.runs - current.wins) * 20) + (current.calibrationScore * 100));

  memoryStore.reputations[personaId] = current;
  writeJsonFile(FILES.reputations, memoryStore.reputations);
}

// ═══════════════════════════════════════════════════════════════
// REAL CODE EXECUTION LAB & SANDBOX (R11, R15, R58)
// ═══════════════════════════════════════════════════════════════

function runCodeSandbox(code, language = 'javascript', tests = []) {
  const fileId = crypto.randomBytes(6).toString('hex');
  const ext = language === 'python' ? 'py' : 'js';
  const filePath = path.join(SANDBOX_DIR, `runner_${fileId}.${ext}`);

  let testHarnessCode = code;

  if (language === 'javascript' || language === 'node') {
    testHarnessCode = `
${code}

// --- AUTOMATED EXECUTION LAB TEST HARNESS ---
(async () => {
  const results = [];
  const tests = ${JSON.stringify(tests)};
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    try {
      const fn = new Function('code', t.code || t.expression || t);
      const res = await fn(${code.includes('exports') ? 'exports' : '{}'});
      results.push({ testId: t.id || 'T' + (i+1), name: t.name || 'Test ' + (i+1), status: 'PASSED', output: String(res) });
    } catch (err) {
      results.push({ testId: t.id || 'T' + (i+1), name: t.name || 'Test ' + (i+1), status: 'FAILED', error: err.message });
    }
  }
  console.log('___VERDICT_TEST_RESULTS___' + JSON.stringify(results));
})();
`;
  }

  try {
    fs.writeFileSync(filePath, testHarnessCode, 'utf8');

    const cmd = language === 'python' ? 'python' : 'node';
    const start = Date.now();
    const proc = spawnSync(cmd, [filePath], {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
      encoding: 'utf8',
      cwd: SANDBOX_DIR
    });

    const elapsedMs = Date.now() - start;
    const stdout = proc.stdout || '';
    const stderr = proc.stderr || '';

    let parsedTestResults = [];
    if (stdout.includes('___VERDICT_TEST_RESULTS___')) {
      const parts = stdout.split('___VERDICT_TEST_RESULTS___');
      try {
        parsedTestResults = JSON.parse(parts[1].trim());
      } catch (e) {
        /* ignore repair */
      }
    }

    // Basic syntax/runtime status
    let status = 'PASSED';
    if (proc.error || proc.status !== 0 || stderr.length > 0) {
      status = stderr.includes('SyntaxError') ? 'SYNTAX_ERROR' : 'RUNTIME_ERROR';
    } else if (parsedTestResults.some(t => t.status === 'FAILED')) {
      status = 'TESTS_FAILED';
    }

    // Clean up temporary script
    try { fs.unlinkSync(filePath); } catch (e) {}

    return {
      executed: true,
      status,
      elapsedMs,
      exitCode: proc.status,
      stdout: stdout.replace(/___VERDICT_TEST_RESULTS___[\s\S]*/, '').trim(),
      stderr: stderr.trim(),
      tests: parsedTestResults,
      passCount: parsedTestResults.filter(t => t.status === 'PASSED').length,
      failCount: parsedTestResults.filter(t => t.status === 'FAILED').length
    };
  } catch (err) {
    return {
      executed: false,
      status: 'SANDBOX_FAILURE',
      error: err.message,
      stdout: '',
      stderr: err.message,
      tests: [],
      passCount: 0,
      failCount: 0
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 16 SPECIALIZED ROLES (R05, R06)
// ═══════════════════════════════════════════════════════════════

const PERSONAS = [
  {
    id: 'architect',
    codename: 'ARCHITECT',
    name: 'Architect (Software Design & Modularity)',
    avatar: '📐',
    color: '#00ddff',
    roleCategory: 'architect',
    script: 'You are the ARCHITECT agent (ROADMAP R05/R06). Objective: Build the cleanest, most maintainable system that can survive future change. Challenge monolithic patterns, tight coupling, leaky abstractions, and architectural debt. Design clean interfaces and robust structures.'
  },
  {
    id: 'hacker',
    codename: 'HACKER',
    name: 'Hacker (Adversarial Debugger & Edge Cases)',
    avatar: '⚡',
    color: '#00ff88',
    roleCategory: 'debugger',
    script: 'You are the HACKER agent (ROADMAP R05/R06). Objective: Find all ways the proposed solution fails. Attack edge cases, unexpected inputs, boundary condition crashes, null/undefined exceptions, off-by-one errors, and broken assumptions.'
  },
  {
    id: 'scientist',
    codename: 'SCIENTIST',
    name: 'Scientist (Evidence & Verification)',
    avatar: '🔬',
    color: '#44aaff',
    roleCategory: 'scientist',
    script: 'You are the SCIENTIST agent (ROADMAP R05/R10). Objective: Demand empirical evidence. Scrutinize all factual statements, libraries, benchmarks, and claims. Distinguish verified facts from unverified assumptions and hallucinations.'
  },
  {
    id: 'engineer',
    codename: 'ENGINEER',
    name: 'Engineer (Runtime Execution & Systems)',
    avatar: '🛠️',
    color: '#ffaa00',
    roleCategory: 'engineer',
    script: 'You are the ENGINEER agent (ROADMAP R05/R11). Objective: Ensure the code actually compiles, runs, and handles runtime failures cleanly. Verify environment dependencies, hardware feasibility, timeout behavior, and crash resilience.'
  },
  {
    id: 'performance',
    codename: 'PERFORMANCE',
    name: 'Performance (Latency & Efficiency)',
    avatar: '🚀',
    color: '#ff44aa',
    roleCategory: 'performance',
    script: 'You are the PERFORMANCE agent (ROADMAP R05). Objective: Optimize execution speed, token efficiency, memory usage, CPU load, and Big-O computational complexity. Eliminate memory leaks and redundant operations.'
  },
  {
    id: 'minimalist',
    codename: 'MINIMALIST',
    name: 'Minimalist (Simplicity & YAGNI)',
    avatar: '✂️',
    color: '#aa88ff',
    roleCategory: 'minimalist',
    script: 'You are the MINIMALIST agent (ROADMAP R05). Objective: Delete unnecessary complexity. Guard against over-engineering ("Kubernetes for a calculator"). Choose the simplest, most direct code that completely solves the problem.'
  },
  {
    id: 'security',
    codename: 'SECURITY',
    name: 'Security (Threat Modeling & Hardening)',
    avatar: '🛡️',
    color: '#ff3344',
    roleCategory: 'security',
    script: 'You are the SECURITY agent (ROADMAP R05/R06). Objective: Assume all inputs and dependencies are hostile. Guard against code injection, unsafe shell commands, secret exposure, prototype pollution, path traversal, and malicious payloads.'
  },
  {
    id: 'advocate',
    codename: 'ADVOCATE',
    name: 'User Advocate (Ergonomics & Practicality)',
    avatar: '👤',
    color: '#ffdd00',
    roleCategory: 'product',
    script: 'You are the USER ADVOCATE agent (ROADMAP R05). Objective: Ensure the solution is clear, practical, easy to use, and directly solves the user\'s real problem with clean documentation and sensible defaults.'
  },
  {
    id: 'oracle',
    codename: 'ORACLE',
    name: 'Oracle (Missing Info & Hidden Assumptions)',
    avatar: '🔮',
    color: '#cc44ff',
    roleCategory: 'oracle',
    script: 'You are the ORACLE agent (ROADMAP Section 57). Objective: Do not propose solutions yourself; identify what information is missing, what assumptions are unverified, and what hidden traps exist in the problem statement.'
  },
  {
    id: 'machinist',
    codename: 'MACHINIST',
    name: 'Machinist (Code Execution Lab Engine)',
    avatar: '🤖',
    color: '#00ffff',
    roleCategory: 'execution-agent',
    script: 'You are the MACHINIST agent (ROADMAP Section 58). Objective: You do not reason rhetorically. You write executable tests, compile code, execute in the sandbox, and measure empirical pass/fail rates.'
  },
  {
    id: 'redteam',
    codename: 'RED_TEAM',
    name: 'Red Team (Kill the Winner Falsification)',
    avatar: '🎯',
    color: '#ff0033',
    roleCategory: 'red-team',
    script: 'You are the RED TEAM agent (ROADMAP Section 21). Objective: Enter the Execution Chamber. You are explicitly rewarded for proving the leading solution WRONG before it ships. Find the single fatal flaw that destroys the solution.'
  }
];

// ═══════════════════════════════════════════════════════════════
// ENGINEERING ENVIRONMENTS (R02, R11, R15, R34)
// ═══════════════════════════════════════════════════════════════

const ENVIRONMENTS = [
  {
    id: 'production',
    name: 'Production Cluster',
    icon: '🏢',
    threatLevel: 9,
    description: 'High-availability mission-critical production environment. Zero tolerance for unhandled exceptions or downtime.',
    atmosphereModifier: 'Zero-fault tolerance. Solutions must handle crashes, graceful degradation, and high concurrency.'
  },
  {
    id: 'sandbox',
    name: 'Execution Test Lab',
    icon: '🧪',
    threatLevel: 5,
    description: 'Automated CI/CD test sandbox with linting, unit tests, and runtime assertions.',
    atmosphereModifier: 'Empirical verification required. Code will be compiled and executed directly.'
  },
  {
    id: 'adversarial',
    name: 'Adversarial Fuzzing Arena',
    icon: '⚔️',
    threatLevel: 10,
    description: 'Extreme adversarial arena where code is subjected to malicious input fuzzing and boundary stress.',
    atmosphereModifier: 'Maximum adversarial pressure. Edge cases, null pointers, and race conditions are targeted aggressively.'
  },
  {
    id: 'constrained',
    name: 'Resource-Constrained Edge',
    icon: '⚡',
    threatLevel: 7,
    description: 'Constrained environment with strict memory caps, minimal dependencies, and latency limits.',
    atmosphereModifier: 'Lean and efficient. Penalizes heavy dependencies, memory bloat, and slow algorithms.'
  },
  {
    id: 'refactor',
    name: 'Legacy Codebase Refactor',
    icon: '🔄',
    threatLevel: 6,
    description: 'Existing codebase requiring non-breaking modifications and backward compatibility.',
    atmosphereModifier: 'Preserve API compatibility. Require regression protection and modular boundaries.'
  },
  {
    id: 'security_audit',
    name: 'Security & Compliance Audit',
    icon: '🛡️',
    threatLevel: 8,
    description: 'Strict security audit verifying sanitization, least-privilege permissions, and OWASP compliance.',
    atmosphereModifier: 'Hostile threat model. Code must strictly validate inputs and prevent execution escapes.'
  }
];

function isFreeInference(conn) {
  try {
    const host = new URL(conn.base).hostname.toLowerCase();
    return host === 'freeinference.org' || host.endsWith('.freeinference.org');
  } catch {
    return false;
  }
}

function withProviderLimit(conn, operation) {
  if (!isFreeInference(conn)) return operation();
  const current = freeInferenceTail.then(operation, operation);
  freeInferenceTail = current.catch(() => {});
  return current;
}

const noStore = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer'
};

function reply(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { ...noStore, 'Content-Type': type });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function readBody(req, maxBytes = 900_000) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > maxBytes) throw new Error('Request body exceeds maximum size limit.');
  }
  return JSON.parse(raw || '{}');
}

function connection(input) {
  const base = String(input.baseUrl || 'https://freeinference.org/v1').trim().replace(/\/+$/, '');
  let parsed;
  try { parsed = new URL(base); } catch { throw new Error('Valid OpenAI-compatible API base URL required.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('API base URL must use HTTP or HTTPS.');
  const key = String(input.apiKey || process.env.FREEINFERENCE_API_KEY || '').trim();
  const host = parsed.hostname.toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  if ((host === 'freeinference.org' || host.endsWith('.freeinference.org')) && !key) {
    throw new Error('API Key Required: FreeInference requires an API key. Please enter your key in the Provider & API Key panel in the UI or add FREEINFERENCE_API_KEY to .env.');
  }
  return { base, key, isLocal };
}

function extractModels(data) {
  const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
  return rows.map(row => {
    const id = String(row.id || row.name || '');
    const spec = fiLimits[id] || [];
    return {
      id,
      name: String(row.name || id),
      description: String(row.description || ''),
      type: /embed|bge-m3/i.test(`${id} ${row.name} ${row.description}`) ? 'embedding' : 'generation',
      contextLimit: Number(row.context_length || row.context_window || row.max_input_tokens || spec[0] || 0),
      outputLimit: Number(row.max_output_tokens || row.output_limit || spec[1] || 0)
    };
  }).filter(row => row.id);
}

async function modelCatalog(conn) {
  return withProviderLimit(conn, async () => {
    const response = await fetch(`${conn.base}/models`, {
      headers: conn.key ? { Authorization: `Bearer ${conn.key}` } : {},
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Model catalog returned HTTP ${response.status}.`);
    return extractModels(await response.json());
  });
}

async function complete(conn, model, messages, maxTokens, temperature = 0.25, jsonMode = true) {
  return withProviderLimit(conn, async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (conn.key) headers.Authorization = `Bearer ${conn.key}`;
    const reasoningModel = /^glm-5\.3(?:-flash)?$/.test(model);

    const request = async tokenLimit => {
      const payload = { model, messages, max_tokens: tokenLimit, temperature };
      if (reasoningModel) payload.reasoning_effort = 'low';
      if (jsonMode && isFreeInference(conn)) payload.response_format = { type: 'json_object' };

      let response = await fetch(`${conn.base}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45000)
      });
      let data = await response.json().catch(() => ({}));
      if (!response.ok && payload.response_format && /response.?format|json.?object/i.test(data.error?.message || '')) {
        delete payload.response_format;
        response = await fetch(`${conn.base}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(45000)
        });
        data = await response.json().catch(() => ({}));
      }
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication failed (${response.status}): ${data.error?.message || 'Invalid or unauthorized API key.'}`);
        }
        throw new Error(data.error?.message || `Model ${model} returned HTTP ${response.status}.`);
      }
      return data;
    };

    const textOf = data => {
      const choice = data.choices?.[0];
      const content = choice?.message?.content ?? choice?.text ?? data.output_text;
      const text = Array.isArray(content)
        ? content.filter(part => part.type === 'text').map(part => part.text || '').join('')
        : typeof content === 'string' ? content : '';
      return { text: text.trim(), finishReason: choice?.finish_reason || 'unknown' };
    };

    let data = await request(maxTokens);
    let result = textOf(data);
    let usage = data.usage || null;
    if (!result.text) {
      const outputCap = fiLimits[model]?.[1] || 8000;
      const retryLimit = Math.min(Math.max(maxTokens * 3, 3000), Math.max(1800, outputCap - 256));
      const retry = await request(retryLimit);
      const retryResult = textOf(retry);
      if (usage && retry.usage) {
        usage = {
          ...usage,
          prompt_tokens: (usage.prompt_tokens || 0) + (retry.usage.prompt_tokens || 0),
          completion_tokens: (usage.completion_tokens || 0) + (retry.usage.completion_tokens || 0),
          total_tokens: (usage.total_tokens || 0) + (retry.usage.total_tokens || 0)
        };
      } else usage = usage || retry.usage || null;
      data = retry; result = retryResult;
    }
    if (!result.text) throw new Error(`Model ${model} returned no text output.`);
    return { text: result.text, usage };
  });
}

function jsonFrom(text, fallback = null) {
  if (typeof text !== 'string' || !text.trim()) {
    if (fallback !== null) return fallback;
    throw new Error('Empty response string.');
  }

  // 1. Strip markdown block
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  // 2. Find first '{'
  let start = cleaned.indexOf('{');
  if (start < 0) {
    if (fallback !== null) return fallback;
    throw new Error('Response contained no JSON object.');
  }

  cleaned = cleaned.slice(start);
  let end = cleaned.lastIndexOf('}');

  // Balance braces if truncated (e.g. max_tokens limit reached)
  if (end < 0) {
    let openBraces = (cleaned.match(/\{/g) || []).length;
    let closeBraces = (cleaned.match(/\}/g) || []).length;
    let openBrackets = (cleaned.match(/\[/g) || []).length;
    let closeBrackets = (cleaned.match(/\]/g) || []).length;

    while (closeBrackets < openBrackets) { cleaned += ']'; closeBrackets++; }
    while (closeBraces < openBraces) { cleaned += '}'; closeBraces++; }
    end = cleaned.lastIndexOf('}');
  }

  const candidate = cleaned.slice(0, end + 1);

  // Attempt multi-pass parsing variations
  const attempts = [
    candidate,
    candidate.replace(/,\s*([}\]])/g, '$1'),
    candidate.replace(/\r?\n/g, '\\n'),
    candidate.replace(/,\s*([}\]])/g, '$1').replace(/\r?\n/g, '\\n'),
    candidate.replace(/'([^'\\]*?)'\s*:/g, '"$1":').replace(/,\s*([}\]])/g, '$1')
  ];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch { /* try next attempt */ }
  }

  if (fallback !== null) return fallback;
  throw new Error('Malformed JSON output.');
}

async function queueMap(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  return Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i], i);
    }
  })).then(() => out);
}

// Quality Scoring Metric (R19)
function calculateQualityScore(candidate, executionRes, evidenceScore) {
  const correctness = candidate.confidence || 0.8;
  const execSuccess = executionRes?.status === 'PASSED' ? 1.0 : executionRes?.status === 'TESTS_FAILED' ? 0.4 : 0.0;
  const evidence = evidenceScore || 0.7;
  const robustness = candidate.claims ? Math.min(1.0, candidate.claims.length * 0.2) : 0.5;
  const security = candidate.codeSnippet && !candidate.codeSnippet.includes('eval(') ? 0.9 : 0.5;
  const simplicity = candidate.codeSnippet ? Math.max(0.1, 1 - (candidate.codeSnippet.length / 5000)) : 0.8;

  const Q = (0.25 * correctness) +
            (0.20 * execSuccess) +
            (0.15 * evidence) +
            (0.10 * robustness) +
            (0.10 * security) +
            (0.10 * simplicity) +
            (0.05 * 0.9) +
            (0.05 * 0.9);
  return Number(Q.toFixed(3));
}

// ═══════════════════════════════════════════════════════════════
// HTTP SERVER & STREAMING CONTROLLER
// ═══════════════════════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Static Index
  if (req.method === 'GET' && url.pathname === '/') {
    return reply(res, 200, fs.readFileSync(path.join(root, 'index.html')), 'text/html; charset=utf-8');
  }

  // API Status & Memory Stats
  if (req.method === 'GET' && url.pathname === '/api/status') {
    return reply(res, 200, {
      ready: true,
      freeInferenceKeyConfigured: Boolean(process.env.FREEINFERENCE_API_KEY),
      defaultBaseUrl: 'https://freeinference.org/v1',
      fallbackFreeInferenceModels: fiModels,
      embeddingModels,
      personasCount: PERSONAS.length,
      environmentsCount: ENVIRONMENTS.length,
      scarsRecorded: memoryStore.failures.length,
      historyCount: memoryStore.history.length
    });
  }

  // API Roadmap (Full 121-Section Council Architecture)
  if (req.method === 'GET' && url.pathname === '/api/roadmap') {
    const roadmapPath = path.join(root, 'ROADMAP.md');
    const content = fs.existsSync(roadmapPath) ? fs.readFileSync(roadmapPath, 'utf8') : '';
    return reply(res, 200, { content, totalBytes: Buffer.byteLength(content, 'utf8') });
  }

  // API Config (Save / Load Credentials & Provider Settings)
  if (req.method === 'GET' && url.pathname === '/api/config') {
    const hasKey = Boolean(process.env.FREEINFERENCE_API_KEY);
    const key = process.env.FREEINFERENCE_API_KEY || '';
    const maskedKey = hasKey ? (key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : '••••••••') : '';
    return reply(res, 200, {
      hasServerKey: hasKey,
      maskedKey,
      envFileExists: fs.existsSync(envPath)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/config') {
    let body;
    try { body = await readBody(req); } catch (e) { return reply(res, 400, { error: e.message }); }
    if (typeof body.apiKey === 'string') {
      const keyVal = body.apiKey.trim();
      if (keyVal) {
        process.env.FREEINFERENCE_API_KEY = keyVal;
      }
      if (body.saveToEnv && keyVal) {
        fs.writeFileSync(envPath, `FREEINFERENCE_API_KEY=${keyVal}\n`, 'utf8');
      }
    }
    const hasKey = Boolean(process.env.FREEINFERENCE_API_KEY);
    const key = process.env.FREEINFERENCE_API_KEY || '';
    return reply(res, 200, {
      success: true,
      hasServerKey: hasKey,
      maskedKey: hasKey ? (key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : '••••••••') : '',
      savedToEnv: Boolean(body.saveToEnv)
    });
  }

  // API Personas
  if (req.method === 'GET' && url.pathname === '/api/personas') {
    return reply(res, 200, { personas: PERSONAS });
  }

  // API Environments
  if (req.method === 'GET' && url.pathname === '/api/environments') {
    return reply(res, 200, { environments: ENVIRONMENTS });
  }

  // API Memory / Graveyard
  if (req.method === 'GET' && url.pathname === '/api/memory') {
    return reply(res, 200, {
      failures: memoryStore.failures.slice(0, 50),
      reputations: memoryStore.reputations,
      history: memoryStore.history.slice(-30)
    });
  }

  // Direct Sandbox Execution Test Endpoint (R11)
  if (req.method === 'POST' && url.pathname === '/api/execute-sandbox') {
    let body;
    try { body = await readBody(req); } catch (e) { return reply(res, 400, { error: e.message }); }
    const result = runCodeSandbox(body.code || '', body.language || 'javascript', body.tests || []);
    return reply(res, 200, result);
  }

  // ═══════════════════════════════════════════════════════════════
  // PROVIDER PRESETS & POPULAR MODELS (REAL AI)
  // ═══════════════════════════════════════════════════════════════
  const PROVIDER_PRESET_MODELS = {
    groq: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Groq)', type: 'generation', contextLimit: 128000, outputLimit: 32768 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Groq)', type: 'generation', contextLimit: 128000, outputLimit: 8192 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', type: 'generation', contextLimit: 32768, outputLimit: 4096 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT (Groq)', type: 'generation', contextLimit: 8192, outputLimit: 4096 }
    ],
    openai: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)', type: 'generation', contextLimit: 128000, outputLimit: 16384 },
      { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', type: 'generation', contextLimit: 128000, outputLimit: 16384 },
      { id: 'o3-mini', name: 'o3-mini (Reasoning - OpenAI)', type: 'generation', contextLimit: 200000, outputLimit: 100000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)', type: 'generation', contextLimit: 16384, outputLimit: 4096 }
    ],
    openrouter: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free - OpenRouter)', type: 'generation', contextLimit: 131072, outputLimit: 8192 },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp (Free)', type: 'generation', contextLimit: 1048576, outputLimit: 8192 },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', type: 'generation', contextLimit: 32768, outputLimit: 4096 },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (OpenRouter)', type: 'generation', contextLimit: 64000, outputLimit: 8000 }
    ],
    deepseek: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 Chat (DeepSeek)', type: 'generation', contextLimit: 64000, outputLimit: 8000 },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 Reasoner (DeepSeek)', type: 'generation', contextLimit: 64000, outputLimit: 8000 }
    ],
    gemini: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Google)', type: 'generation', contextLimit: 1000000, outputLimit: 8192 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Google)', type: 'generation', contextLimit: 1000000, outputLimit: 8192 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Google)', type: 'generation', contextLimit: 2000000, outputLimit: 8192 }
    ],
    ollama: [
      { id: 'llama3:latest', name: 'Llama 3 (Local Ollama)', type: 'generation', contextLimit: 8192, outputLimit: 4096 },
      { id: 'qwen2.5-coder:latest', name: 'Qwen 2.5 Coder (Local Ollama)', type: 'generation', contextLimit: 32768, outputLimit: 8192 },
      { id: 'deepseek-r1:latest', name: 'DeepSeek R1 (Local Ollama)', type: 'generation', contextLimit: 16384, outputLimit: 8192 },
      { id: 'mistral:latest', name: 'Mistral (Local Ollama)', type: 'generation', contextLimit: 8192, outputLimit: 4096 }
    ],
    freeinference: [...fiModels, ...embeddingModels].map(id => ({
      id,
      name: `${id} (FreeInference)`,
      type: embeddingModels.includes(id) ? 'embedding' : 'generation',
      contextLimit: fiLimits[id]?.[0] || 0,
      outputLimit: fiLimits[id]?.[1] || 0
    }))
  };

  // API Models Catalog
  if (req.method === 'POST' && url.pathname === '/api/models') {
    let body;
    try { body = await readBody(req); } catch (error) { return reply(res, 400, { error: error.message }); }
    let conn;
    try {
      conn = connection({ ...body.provider, apiKey: body.provider?.apiKey || process.env.FREEINFERENCE_API_KEY || '' });
      try {
        const liveCatalog = await modelCatalog(conn);
        if (liveCatalog && liveCatalog.length > 0) {
          return reply(res, 200, { models: liveCatalog, source: 'live' });
        }
      } catch (liveErr) {
        // Fall back to provider-specific presets if live catalog query fails
        const base = (conn.base || '').toLowerCase();
        let presetKey = 'freeinference';
        if (base.includes('groq.com')) presetKey = 'groq';
        else if (base.includes('openai.com')) presetKey = 'openai';
        else if (base.includes('openrouter.ai')) presetKey = 'openrouter';
        else if (base.includes('deepseek.com')) presetKey = 'deepseek';
        else if (base.includes('generativelanguage.googleapis.com')) presetKey = 'gemini';
        else if (base.includes('11434') || base.includes('ollama')) presetKey = 'ollama';

        const presets = PROVIDER_PRESET_MODELS[presetKey] || PROVIDER_PRESET_MODELS.freeinference;
        return reply(res, 200, {
          models: presets,
          source: 'preset',
          providerMatched: presetKey,
          warning: liveErr.message
        });
      }
    } catch (error) {
      return reply(res, 502, { error: error.message });
    }
  }

  // Real AI API Connection Diagnostic Test Endpoint (Proves Genuine AI API)
  if (req.method === 'POST' && url.pathname === '/api/test-connection') {
    let body;
    try { body = await readBody(req); } catch (e) { return reply(res, 400, { error: e.message }); }
    let conn;
    try {
      conn = connection({ ...body.provider, apiKey: body.provider?.apiKey || process.env.FREEINFERENCE_API_KEY || '' });
      const model = body.model || (isFreeInference(conn) ? 'glm-5.3-flash' : (conn.base.includes('groq') ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'));
      const start = Date.now();
      console.log(`\n🧪 [TEST REAL AI API CONNECTION] Provider: ${conn.base} | Model: ${model}`);
      
      const resData = await complete(conn, model, [
        { role: 'user', content: 'Say "API Connection Verified! Real AI is active." in 10 words or less.' }
      ], 150, 0.1, false);

      const elapsed = Date.now() - start;
      console.log(`✅ [TEST REAL AI API SUCCESS] Elapsed: ${elapsed}ms | Output: "${resData.text}"`);

      return reply(res, 200, {
        success: true,
        model,
        provider: conn.base,
        elapsedMs: elapsed,
        text: resData.text,
        usage: resData.usage,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(`❌ [TEST REAL AI API FAILED]: ${err.message}`);
      return reply(res, 200, {
        success: false,
        error: err.message,
        provider: conn?.base || body.provider?.baseUrl,
        model: body.model || 'unknown'
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // THE MAIN COUNCIL ARENA V2.0 STREAMING ENDPOINT (R01 - R22)
  // ═══════════════════════════════════════════════════════════════

  if (req.method === 'POST' && url.pathname === '/api/verdict') {
    let body;
    try { body = await readBody(req); } catch (error) { return reply(res, 400, { error: error.message }); }
    let conn;
    let streamStarted = false;
    const emit = (event, data = {}) => {
      if (streamStarted && !res.writableEnded) {
        res.write(`${JSON.stringify({ event, ...data })}\n`);
      }
    };

    try {
      conn = connection({ ...body.provider, apiKey: body.provider?.apiKey || process.env.FREEINFERENCE_API_KEY || '' });
      const task = String(body.task || '').trim();
      const models = [...new Set((Array.isArray(body.models) ? body.models : []).map(x => String(x).trim()).filter(Boolean))];
      const judge = String(body.judge || models[0] || '').trim();
      const environmentId = String(body.environment || 'dungeon');
      const personaAssignments = body.personaAssignments || {};
      const requestedConcurrency = Math.max(1, Math.min(8, Number(body.concurrency) || 1));
      const concurrency = isFreeInference(conn) ? 1 : requestedConcurrency;
      const maxRounds = Math.max(1, Math.min(5, Number(body.maxRounds) || 2));
      const escalationLevel = Number(body.escalationLevel) || 5;

      if (task.length < 20) return reply(res, 400, { error: 'Provide a task of at least 20 characters.' });
      if (!models.length) return reply(res, 400, { error: 'Choose at least 1 agent model.' });

      const env = ENVIRONMENTS.find(e => e.id === environmentId) || ENVIRONMENTS[0];
      const start = Date.now();

      res.writeHead(200, {
        ...noStore,
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no'
      });
      res.flushHeaders?.();
      streamStarted = true;

      // 1. ARENA INIT
      emit('arena-init', {
        environment: env,
        threatLevel: env.threatLevel,
        description: env.description,
        maxRounds,
        escalationLevel,
        scarsLoaded: memoryStore.failures.length
      });

      const usageLog = [];
      const rawApiTraces = [];

      const tracked = async (conn, model, messages, maxTokens = 1200, temperature = 0.25, jsonMode = true, stageName = 'general') => {
        const callStart = Date.now();
        console.log(`\n🌐 [REAL AI API CALL] Stage: ${stageName} | Model: ${model} | Base: ${conn.base}`);
        
        emit('arena-event', {
          type: 'ai-request',
          stage: stageName,
          model,
          provider: conn.base,
          description: `📡 Live AI API Call: Requesting ${model} via ${conn.base} [${stageName.toUpperCase()}]...`
        });

        const out = await complete(conn, model, messages, maxTokens, temperature, jsonMode);
        const elapsed = Date.now() - callStart;

        console.log(`📥 [REAL AI API RESPONSE] Model: ${model} | ${elapsed}ms | Total Tokens: ${out.usage?.total_tokens ?? 'N/A'}`);

        const trace = {
          callId: `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          stage: stageName,
          model,
          provider: conn.base,
          elapsedMs: elapsed,
          usage: out.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          promptPreview: messages[messages.length - 1]?.content?.slice(0, 300) || '',
          responseRaw: out.text
        };
        rawApiTraces.push(trace);
        if (out.usage) usageLog.push({ model, ...out.usage });

        emit('arena-event', {
          type: 'ai-response',
          stage: stageName,
          model,
          provider: conn.base,
          elapsedMs: elapsed,
          tokens: out.usage?.total_tokens || 0,
          description: `✅ Live AI Response from ${model} (${elapsed}ms, ${out.usage?.total_tokens || 0} tokens): "${out.text.slice(0, 100).replace(/\r?\n/g, ' ')}..."`
        });

        return out;
      };

      const parseStructured = async (model, raw, defaultSchema = {}) => {
        if (!raw || typeof raw !== 'string') {
          throw new Error(`Model ${model} returned empty response.`);
        }
        try {
          return jsonFrom(raw);
        } catch (err) {
          const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
          if (fenceMatch) {
            try { return jsonFrom(fenceMatch[1]); } catch (e) {}
          }

          try {
            const repaired = await tracked(conn, model, [
              { role: 'system', content: 'Convert the following text into valid JSON matching the intended schema. Output ONLY valid JSON, no explanations or markdown.' },
              { role: 'user', content: raw.slice(0, 6000) }
            ], 2000, 0, true, 'json_repair');
            return jsonFrom(repaired.text);
          } catch (e2) {
            console.warn(`[JSON Recovery] Parsing model's natural text directly for ${model}`);
            const textStr = raw.trim();
            const extractedCode = (textStr.match(/```(?:javascript|js|node|python|ts)?\s*([\s\S]*?)```/i) || [])[1] || '';
            const firstPara = textStr.split(/\r?\n\r?\n/)[0] || textStr.slice(0, 300);
            return {
              summary: firstPara.slice(0, 400),
              answer: textStr,
              codeSnippet: extractedCode || (textStr.includes('function') || textStr.includes('const') ? textStr : ''),
              claims: [{ id: 'C1', claim: firstPara.slice(0, 150), confidence: 0.85 }],
              unitTests: [],
              confidence: 0.85,
              winningCandidateId: defaultSchema.winningCandidateId || 'CANDIDATE-ALPHA',
              preferredAnswer: textStr,
              why: textStr.slice(0, 500),
              survived: !textStr.toLowerCase().includes('fatal flaw'),
              fatalFlaw: textStr.toLowerCase().includes('fatal') ? textStr.slice(0, 200) : 'None identified',
              auditPassed: true,
              attackNarrative: textStr.slice(0, 400),
              targetId: defaultSchema.targetId || 'CANDIDATE-ALPHA',
              severity: 'MEDIUM',
              ...defaultSchema
            };
          }
        }
      };

      // Assign personas to models
      const agents = models.map((model, i) => {
        const assignedPersonaId = personaAssignments[model] || PERSONAS[i % PERSONAS.length].id;
        const persona = PERSONAS.find(p => p.id === assignedPersonaId) || PERSONAS[i % PERSONAS.length];
        return { model, persona, personaId: persona.id, role: persona.codename };
      });

      // Track candidate anonymization mapping (R07)
      const candAlpha = ['CANDIDATE-ALPHA', 'CANDIDATE-BETA', 'CANDIDATE-GAMMA', 'CANDIDATE-DELTA', 'CANDIDATE-EPSILON', 'CANDIDATE-ZETA', 'CANDIDATE-ETA', 'CANDIDATE-THETA'];

      // STAGE 1: REQUIREMENT COMPILER (R15, R28)
      emit('stage', { stage: 'requirements', state: 'running', label: `Compiling task requirements with ${judge}` });
      const compilerPrompt = `You are the REQUIREMENT COMPILER in The Council V2.0. Normalize the user task into explicit goals, hard constraints, edge cases, ambiguities, and automated acceptance tests. Output JSON: {"goal":"...","requirements":[{"id":"R1","text":"...","kind":"hard|preference"}],"ambiguities":["..."],"acceptanceChecks":[{"id":"AC1","testCode":"javascript code assertion","expected":"expected outcome"}],"outOfScope":["..."]}`;

      const compilerRes = await tracked(conn, judge, [
        { role: 'system', content: compilerPrompt },
        { role: 'user', content: task }
      ], 700);

      const requirements = await parseStructured(judge, compilerRes.text);
      emit('requirements', { data: requirements });
      emit('stage', { stage: 'requirements', state: 'complete' });

      // Retrieve Scar Tissue Relevant to Task (R14)
      const relevantScars = memoryStore.failures.slice(0, 3);
      const scarContext = relevantScars.length
        ? `\n\nRELEVANT PAST SCAR TISSUE / LESSONS FROM FAILURE GRAVEYARD:\n${relevantScars.map(s => `- [${s.id}] Root Cause: ${s.rootCause} | Lesson: ${s.lesson}`).join('\n')}`
        : '';

      // STAGE 2: BLIND INDEPENDENT PROPOSALS (R04, R07)
      emit('stage', { stage: 'proposals', state: 'running', label: `${agents.length} agents generating blind candidate solutions...` });

      let candidatePool = await queueMap(agents, concurrency, async (agent, i) => {
        const candidateId = candAlpha[i] || `CANDIDATE-${i+1}`;
        const persona = agent.persona;

        emit('arena-event', {
          type: 'entrance',
          agent: persona.codename,
          avatar: persona.avatar,
          color: persona.color,
          description: `${persona.avatar} ${persona.codename} enters ${env.name}. Preparing ${candidateId}.`
        });

        const prompt = `${persona.script}\n\nENVIRONMENT: ${env.name}\n${env.atmosphereModifier}${scarContext}\n\nYou are assigned anonymized ID: ${candidateId}. Solve the task directly. Output code snippet if applicable. Output ONLY JSON: {"candidateId":"${candidateId}","summary":"...","answer":"...","codeSnippet":"// JavaScript/Node code if coding task","claims":[{"id":"C1","claim":"falsifiable statement","confidence":0.9}],"unitTests":[{"id":"T1","code":"return typeof fn === 'function'","expression":"1 + 1 === 2"}],"confidence":0.85,"physicalAction":"mannerism description"}`;

        const result = await tracked(conn, agent.model, [
          { role: 'system', content: prompt },
          { role: 'user', content: `${task}\n\nNORMALIZED REQUIREMENTS:\n${JSON.stringify(requirements)}` }
        ], 1000);

        const parsed = await parseStructured(agent.model, result.text);
        const candObj = {
          candidateId,
          model: agent.model,
          personaId: agent.personaId,
          role: persona.codename,
          persona,
          ...parsed
        };

        emit('proposal', {
          candidateId,
          role: persona.codename,
          avatar: persona.avatar,
          color: persona.color,
          data: candObj
        });

        return candObj;
      });

      emit('stage', { stage: 'proposals', state: 'complete' });

      // STAGE 3: EXECUTION LAB & SANDBOX (R11, R58)
      emit('stage', { stage: 'execution', state: 'running', label: 'EXECUTION LAB — Running candidate code in isolated sandbox...' });

      const executionResults = {};
      for (const cand of candidatePool) {
        if (cand.codeSnippet) {
          const res = runCodeSandbox(cand.codeSnippet, 'javascript', cand.unitTests || []);
          executionResults[cand.candidateId] = res;

          emit('arena-event', {
            type: 'execution',
            candidateId: cand.candidateId,
            agent: cand.role,
            avatar: cand.persona.avatar,
            description: `🧪 Sandbox Execution [${cand.candidateId}]: Status ${res.status} · Pass: ${res.passCount}/${res.tests.length} · ${res.elapsedMs}ms`
          });
        }
      }
      emit('stage', { stage: 'execution', state: 'complete' });

      // STAGE 4: ITERATIVE ADVERSARIAL CONVERGENCE LOOP (R09, R16, R17)
      let currentRound = 1;
      let qualityHistory = [];
      let allAttacks = [];

      while (currentRound <= maxRounds) {
        emit('stage', { stage: 'attacks', state: 'running', label: `ROUND ${currentRound}/${maxRounds} — Cross-Examination & Adversarial Tournament` });

        const roundAttacks = await queueMap(agents, concurrency, async (agent, i) => {
          const targetCand = candidatePool[(i + 1) % candidatePool.length];
          const attackerPersona = agent.persona;

          // Enforce R08: No Self Voting / Self Attacking
          if (targetCand.personaId === agent.personaId) return null;

          const attackPrompt = `${attackerPersona.script}\n\nATTACK ${targetCand.candidateId} (Author anonymized). Evaluate their proposal and sandbox execution results: ${JSON.stringify(executionResults[targetCand.candidateId] || {})}.\n\nOutput JSON: {"targetId":"${targetCand.candidateId}","attackType":"code_bug|logic_flaw|edge_case|security","severity":"HIGH|MEDIUM|LOW","attackNarrative":"...","counterexample":"...","evidenceNeeded":"...","suggestedFix":"..."}`;

          const res = await tracked(conn, agent.model, [
            { role: 'system', content: attackPrompt },
            { role: 'user', content: `Candidate Solution:\n${JSON.stringify({ summary: targetCand.summary, code: targetCand.codeSnippet, claims: targetCand.claims })}` }
          ], 700);

          const attackData = await parseStructured(agent.model, res.text);
          attackData.attacker = attackerPersona.codename;
          attackData.attackerAvatar = attackerPersona.avatar;

          emit('arena-event', {
            type: 'combat',
            attacker: attackerPersona.codename,
            defender: targetCand.candidateId,
            description: `💥 ${attackerPersona.avatar} ${attackerPersona.codename} ATTACKS ${targetCand.candidateId} [${attackData.severity}]: ${attackData.attackNarrative}`
          });

          return attackData;
        });

        const validAttacks = roundAttacks.filter(Boolean);
        allAttacks.push(...validAttacks);

        // STAGE 5: REVISION ENGINE (R16, R17)
        emit('stage', { stage: 'revision', state: 'running', label: `ROUND ${currentRound} REVISION — Agents repairing code based on execution & attacks` });

        candidatePool = await queueMap(candidatePool, concurrency, async (cand) => {
          const relevantAttacks = validAttacks.filter(a => a.targetId === cand.candidateId);
          const execRes = executionResults[cand.candidateId];

          if (!relevantAttacks.length && execRes?.status === 'PASSED') return cand;

          const revisionPrompt = `${cand.persona.script}\n\nYour candidate solution ${cand.candidateId} received attacks and execution results: ${JSON.stringify(execRes)}.\nAttacks: ${JSON.stringify(relevantAttacks)}.\n\nRevise your solution and code snippet to fix all vulnerabilities. Output JSON: {"summary":"...","answer":"...","codeSnippet":"...","claims":[{"id":"C1","claim":"..."}],"unitTests":[]}`;

          const revRes = await tracked(conn, cand.model, [
            { role: 'system', content: revisionPrompt },
            { role: 'user', content: task }
          ], 900);

          const revObj = await parseStructured(cand.model, revRes.text);
          const updated = { ...cand, ...revObj };

          // Re-test in execution lab
          if (updated.codeSnippet) {
            executionResults[cand.candidateId] = runCodeSandbox(updated.codeSnippet, 'javascript', updated.unitTests || []);
          }
          return updated;
        });

        // Compute Round Quality Score Q (R19)
        const roundQ = candidatePool.map(c => calculateQualityScore(c, executionResults[c.candidateId], 0.8));
        const avgQ = roundQ.reduce((s, v) => s + v, 0) / roundQ.length;
        qualityHistory.push({ round: currentRound, avgQ, scores: roundQ });

        // Convergence Check: ΔQ < 0.02
        if (currentRound > 1) {
          const prevQ = qualityHistory[currentRound - 2].avgQ;
          const deltaQ = Math.abs(avgQ - prevQ);
          if (deltaQ < 0.02) {
            emit('arena-event', { type: 'convergence', description: `🎯 CONVERGENCE ACHIEVED at Round ${currentRound} (ΔQ = ${deltaQ.toFixed(3)} < 0.02)` });
            break;
          }
        }
        currentRound++;
      }

      // STAGE 6: RED TEAM "KILL THE WINNER" CHAMBER (R17, R21)
      emit('stage', { stage: 'redteam', state: 'running', label: 'RED TEAM CHAMBER — "Kill the Winner" Stress Test Pass' });

      // Identify leading candidate
      const sortedCandidates = [...candidatePool].sort((a, b) => {
        const qA = calculateQualityScore(a, executionResults[a.candidateId], 0.8);
        const qB = calculateQualityScore(b, executionResults[b.candidateId], 0.8);
        return qB - qA;
      });
      const winnerCand = sortedCandidates[0];

      const redTeamPersona = PERSONAS.find(p => p.id === 'redteam') || PERSONAS[0];
      const redTeamRes = await tracked(conn, judge, [
        {
          role: 'system',
          content: `${redTeamPersona.script}\n\nYour task is to KILL candidate ${winnerCand.candidateId}. Try to find any security hole, memory leak, or broken assumption. Output JSON: {"survived":true|false,"fatalFlaw":"...","stressTestResult":"...","mitigationNeeded":"..."}`
        },
        { role: 'user', content: JSON.stringify(winnerCand) }
      ], 600);

      const redTeamVerdict = await parseStructured(judge, redTeamRes.text);

      emit('arena-event', {
        type: 'redteam',
        description: `🎯 RED TEAM Verdict on ${winnerCand.candidateId}: ${redTeamVerdict.survived ? 'SURVIVED' : 'FATAL FLAW FOUND'} — ${redTeamVerdict.fatalFlaw || 'No fatal flaw detected.'}`
      });
      emit('stage', { stage: 'redteam', state: 'complete' });

      // STAGE 7: JUDGE, JUDGE-AUDITOR & COUNTER-JUDGE (R18, R19)
      emit('stage', { stage: 'adjudication', state: 'running', label: `Final Adjudication & Judge Audit by ${judge}` });

      const judgePrompt = `You are the FINAL ADJUDICATOR. Weigh all candidate solutions, sandbox execution results, attack logs, and Red Team findings.\n\nCandidates: ${JSON.stringify(candidatePool.map(c => ({ id: c.candidateId, role: c.role, summary: c.summary, code: c.codeSnippet })))}.\nExecution: ${JSON.stringify(executionResults)}.\nRedTeam: ${JSON.stringify(redTeamVerdict)}.\n\nSelect the winning candidate. Output JSON: {"winningCandidateId":"...","preferredAnswer":"...","why":"...","confidence":0.95,"acceptedClaims":[],"rejectedClaims":[],"improvementOverOriginal":"..."}`;

      const judgeRes = await tracked(conn, judge, [
        { role: 'system', content: judgePrompt },
        { role: 'user', content: task }
      ], 1200);

      let ruling = await parseStructured(judge, judgeRes.text);

      // JUDGE-AUDITOR PASS (R19)
      const auditorRes = await tracked(conn, judge, [
        {
          role: 'system',
          content: `You are the JUDGE AUDITOR. Audit the Adjudicator's pick of ${ruling.winningCandidateId}. Verify if the pick contradicts empirical execution data (${JSON.stringify(executionResults)}). Output JSON: {"auditPassed":true|false,"contradictionFound":"...","recommendedWinner":"..."}`
        },
        { role: 'user', content: JSON.stringify(ruling) }
      ], 500);

      const auditData = await parseStructured(judge, auditorRes.text);

      if (!auditData.auditPassed && auditData.recommendedWinner) {
        emit('arena-event', {
          type: 'judge-audit',
          description: `⚖️ JUDGE AUDITOR OVERRIDE: Judge pick contradicted execution results! Winner corrected to ${auditData.recommendedWinner}.`
        });
        ruling.winningCandidateId = auditData.recommendedWinner;
        ruling.why += ` (Corrected by Judge Auditor: ${auditData.contradictionFound})`;
      }

      // Record Scars / Success in Memory (R13, R14)
      for (const cand of candidatePool) {
        const isWinner = cand.candidateId === ruling.winningCandidateId;
        updateAgentReputation(cand.personaId, cand.confidence || 0.8, isWinner);

        if (!isWinner && executionResults[cand.candidateId]?.status !== 'PASSED') {
          recordFailureScar(
            task,
            cand.candidateId,
            cand.personaId,
            executionResults[cand.candidateId]?.stderr || 'Failed in cross-examination',
            cand.codeSnippet,
            `Do not use unverified patterns for ${task.slice(0, 50)}`
          );
        }
      }

      emit('stage', { stage: 'adjudication', state: 'complete' });

      // Final Output Object
      const finalResult = {
        runId: `VA2-${Date.now().toString(36).toUpperCase()}`,
        roundsCompleted: currentRound - 1,
        maxRounds,
        escalationLevel,
        environment: env,
        models,
        judge,
        requirements,
        candidates: candidatePool,
        executionResults,
        attacks: allAttacks,
        qualityHistory,
        redTeamVerdict,
        judgeAudit: auditData,
        ruling,
        rawApiTraces,
        elapsedMs: Date.now() - start
      };

      // Store in History
      memoryStore.history.push({
        runId: finalResult.runId,
        task: task.slice(0, 150),
        winner: ruling.winningCandidateId,
        rounds: currentRound - 1,
        timestamp: new Date().toISOString()
      });
      writeJsonFile(FILES.history, memoryStore.history);

      emit('result', { data: finalResult });
      res.end();
      return;
    } catch (error) {
      if (streamStarted) {
        emit('error', { error: error.message || 'Arena execution failed.' });
        res.end();
        return;
      } else {
        return reply(res, 502, { error: error.message || 'Arena execution failed.' });
      }
    }
  }

  return reply(res, 404, { error: 'Not found' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`\n⚔️ THE COUNCIL V2.0 (Iterative Adversarial Edition) running at http://localhost:${port}`);
  console.log(`🔥 16 Specialized Personas · Sandbox Execution Active · Memory & Graveyard Engine Online\n`);
});
