// ═══════════════════════════════════════════════════════════════════════════
// ECHO DIAGNOSTICS AGENT v1.0.0
// ═══════════════════════════════════════════════════════════════════════════
// Autonomous agent that scans ALL GitHub repos for missing diagnostics,
// health endpoints, and structured logging — then adds them intelligently.
//
// Capabilities:
// - Scans repos for missing /health endpoints
// - Detects console.log usage that should be structured logging
// - Identifies Workers without proper error handling
// - Detects missing CORS headers
// - Finds missing D1 migrations or table creation
// - Adds structured logging helpers where needed
// - Injects health endpoints into Workers that lack them
// - Reports all findings to Shared Brain
//
// Cron: Every 6 hours (0 */6 * * *)
// ═══════════════════════════════════════════════════════════════════════════

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  WORKER_VERSION: string;
  GITHUB_OWNER: string;
  GITHUB_TOKEN?: string;
  ECHO_API_KEY?: string;
  SVC_BRAIN: Fetcher;
  SVC_ENGINE: Fetcher;
  SVC_BUILDER: Fetcher;
}

const GITHUB_API = 'https://api.github.com';
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://echo-ept.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Echo-API-Key',
};

// ═══ DIAGNOSTIC CHECKS ═══
// Each check returns findings for a given source file

interface DiagFinding {
  repo: string;
  file: string;
  check: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  line?: number;
  canAutoFix: boolean;
}

interface ScanResult {
  repo: string;
  scanned: number;
  findings: DiagFinding[];
  duration_ms: number;
  error?: string;
}

// Repos to scan — all Worker repos with src/index.ts
const WORKER_REPOS = [
  'echo-autonomous-daemon', 'echo-shared-brain', 'echo-engine-runtime',
  'echo-doctrine-forge', 'echo-knowledge-forge', 'echo-chat',
  'echo-speak-cloud', 'echo-analytics-engine', 'echo-crm',
  'echo-helpdesk', 'echo-booking', 'echo-invoice', 'echo-inventory',
  'echo-forms', 'echo-hr', 'echo-contracts', 'echo-lms',
  'echo-email-marketing', 'echo-surveys', 'echo-knowledge-base',
  'echo-workflow-automation', 'echo-social-media', 'echo-document-manager',
  'echo-live-chat', 'echo-link-shortener', 'echo-feedback-board',
  'echo-newsletter', 'echo-web-analytics', 'echo-waitlist',
  'echo-reviews', 'echo-signatures', 'echo-affiliate',
  'echo-proposals', 'echo-gamer-companion', 'echo-qr-menu',
  'echo-podcast', 'echo-payroll', 'echo-calendar',
  'echo-compliance', 'echo-recruiting', 'echo-timesheet',
  'echo-finance-ai', 'echo-home-ai', 'echo-shepherd-ai',
  'echo-intel-hub', 'echo-call-center', 'echo-project-manager',
  'echo-expense', 'echo-okr', 'echo-x-bot', 'echo-linkedin',
  'echo-telegram', 'echo-reddit-bot', 'echo-instagram',
  'echo-slack', 'echo-qa-tester', 'echo-autonomous-builder',
  'echo-feature-flags', 'echo-vault-api', 'echo-config-manager',
  'echo-alert-router', 'echo-rate-limiter', 'echo-cron-orchestrator',
  'echo-notification-hub', 'echo-service-registry',
  'echo-health-dashboard', 'echo-cost-optimizer',
];

// ═══ GITHUB HELPERS ═══

async function githubFetch(env: Env, path: string): Promise<{ data: any; status: number; error?: string }> {
  const token = env.GITHUB_TOKEN;
  if (!token) return { data: null, status: 0, error: 'GITHUB_TOKEN not set' };

  const resp = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'echo-diagnostics-agent/1.0',
    },
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    return { data: null, status: resp.status, error: body.slice(0, 200) };
  }
  return { data: await resp.json(), status: resp.status };
}

async function getFileContent(env: Env, repo: string, filePath: string): Promise<{ content: string | null; error?: string }> {
  const result = await githubFetch(env, `/repos/${env.GITHUB_OWNER}/${repo}/contents/${filePath}`);
  if (!result.data?.content) return { content: null, error: result.error || `status ${result.status}` };
  try {
    return { content: atob(result.data.content.replace(/\n/g, '')) };
  } catch {
    return { content: null, error: 'base64 decode failed' };
  }
}

// Try multiple common file paths for Worker source
async function findWorkerSource(env: Env, repo: string): Promise<{ content: string | null; file: string; error?: string }> {
  const paths = ['src/index.ts', 'src/index.js', 'index.ts', 'index.js', 'src/worker.ts', 'worker.ts'];
  for (const p of paths) {
    const result = await getFileContent(env, repo, p);
    if (result.content) return { content: result.content, file: p };
  }
  // Return the error from the first attempt for debugging
  const firstResult = await getFileContent(env, repo, 'src/index.ts');
  return { content: null, file: 'src/index.ts', error: firstResult.error };
}

async function pushFix(env: Env, repo: string, filePath: string, content: string, message: string): Promise<boolean> {
  const token = env.GITHUB_TOKEN;
  if (!token) return false;

  // Get current file SHA
  const existing = await githubFetch(env, `/repos/${env.GITHUB_OWNER}/${repo}/contents/${filePath}`);
  const sha = existing.data?.sha;

  const resp = await fetch(`${GITHUB_API}/repos/${env.GITHUB_OWNER}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'echo-diagnostics-agent/1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `fix(diagnostics): ${message}`,
      content: btoa(content),
      ...(sha ? { sha } : {}),
    }),
  });

  return resp.ok;
}

// ═══ DIAGNOSTIC CHECKS ═══

function checkHealthEndpoint(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  // Check for /health endpoint
  const hasHealth = /['"\/]health['"]/.test(source) || /path\s*===?\s*['"]\/health['"]/.test(source);
  if (!hasHealth && source.includes('fetch(') && source.includes('Request')) {
    findings.push({
      repo, file, check: 'missing_health_endpoint',
      severity: 'critical',
      description: 'Worker has no /health endpoint. Fleet monitoring cannot detect if this Worker is alive.',
      suggestion: 'Add a GET /health route returning { status: "ok", service, version, timestamp }',
      canAutoFix: true,
    });
  }

  return findings;
}

function checkStructuredLogging(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];
  const lines = source.split('\n');

  let consoleLogCount = 0;
  const consoleLogLines: number[] = [];

  lines.forEach((line, i) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (/console\.(log|warn|info|debug)\(/.test(line)) {
      consoleLogCount++;
      if (consoleLogLines.length < 5) consoleLogLines.push(i + 1);
    }
  });

  if (consoleLogCount > 3) {
    findings.push({
      repo, file, check: 'unstructured_logging',
      severity: 'high',
      description: `${consoleLogCount} console.log/warn/info/debug calls found. Should use structured JSON logging.`,
      suggestion: 'Replace console.log with structured log helper: function slog(level, msg, data) { console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...data })); }',
      line: consoleLogLines[0],
      canAutoFix: true,
    });
  }

  return findings;
}

function checkErrorHandling(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  // Check for bare catch blocks that swallow errors
  const bareMatches = source.match(/catch\s*\([^)]*\)\s*\{[\s\n]*\}/g);
  if (bareMatches && bareMatches.length > 0) {
    findings.push({
      repo, file, check: 'bare_catch_blocks',
      severity: 'high',
      description: `${bareMatches.length} empty catch blocks found — errors are silently swallowed.`,
      suggestion: 'Add error logging inside catch blocks: catch(e) { slog("error", "operation failed", { error: e.message }); }',
      canAutoFix: true,
    });
  }

  // Check for missing try-catch around D1 queries
  const d1Calls = (source.match(/env\.DB\.prepare\(/g) || []).length;
  const tryCatchBlocks = (source.match(/try\s*\{/g) || []).length;
  if (d1Calls > 5 && tryCatchBlocks < d1Calls / 3) {
    findings.push({
      repo, file, check: 'unprotected_d1_queries',
      severity: 'medium',
      description: `${d1Calls} D1 queries but only ${tryCatchBlocks} try-catch blocks. Many queries may crash without error handling.`,
      suggestion: 'Wrap D1 queries in try-catch blocks with structured error logging.',
      canAutoFix: false,
    });
  }

  return findings;
}

function checkCorsHeaders(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  const hasRawCors = /Access-Control-Allow-Origin/.test(source);
  const hasHonoCors = /from\s+['"]hono\/cors['"]/.test(source) || /cors\(\)/.test(source);
  const hasCors = hasRawCors || hasHonoCors;
  const hasOptions = /OPTIONS/.test(source);
  const hasFetch = /async\s+fetch/.test(source) || /export\s+default/.test(source);

  if (hasFetch && !hasCors) {
    findings.push({
      repo, file, check: 'missing_cors',
      severity: 'medium',
      description: 'No CORS headers found. API calls from browser-based dashboards will fail.',
      suggestion: 'Add CORS headers constant and OPTIONS preflight handler.',
      canAutoFix: true,
    });
  }

  if (hasFetch && hasCors && !hasOptions) {
    findings.push({
      repo, file, check: 'missing_options_handler',
      severity: 'low',
      description: 'CORS headers present but no OPTIONS preflight handler found.',
      suggestion: 'Add: if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });',
      canAutoFix: true,
    });
  }

  return findings;
}

function checkVersionTracking(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  // Recognize multiple version patterns: env var, hardcoded string in health response, or version constant
  const hasEnvVersion = /WORKER_VERSION/.test(source) || /env\.WORKER_VERSION/.test(source);
  const hasHardcodedVersion = /version:\s*['"][0-9]+\.[0-9]+\.[0-9]+['"]/.test(source);
  const hasVersionConst = /(?:const|let|var)\s+(?:VERSION|WORKER_VERSION|APP_VERSION)\s*=/.test(source);
  const hasVersion = hasEnvVersion || hasHardcodedVersion || hasVersionConst;

  if (!hasVersion) {
    findings.push({
      repo, file, check: 'no_version_tracking',
      severity: 'low',
      description: 'No version tracking found. Health endpoint should report the deployed version.',
      suggestion: 'Add WORKER_VERSION to wrangler.toml [vars] and include it in /health response.',
      canAutoFix: false,
    });
  }

  return findings;
}

function checkRequestValidation(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  // Check for auth middleware
  const hasAuth = /X-Echo-API-Key/i.test(source) || /authorization/i.test(source) || /auth/i.test(source);
  const hasPOST = /POST/.test(source);
  const hasPUT = /PUT/.test(source);
  const hasDELETE = /DELETE/.test(source);

  if ((hasPOST || hasPUT || hasDELETE) && !hasAuth) {
    findings.push({
      repo, file, check: 'no_auth_middleware',
      severity: 'critical',
      description: 'Worker accepts POST/PUT/DELETE requests but has no authentication check.',
      suggestion: 'Add X-Echo-API-Key header validation for write endpoints.',
      canAutoFix: false,
    });
  }

  return findings;
}

function checkTimestamps(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  const hasD1 = /env\.DB/.test(source);
  const hasCreatedAt = /created_at/.test(source);
  const hasUpdatedAt = /updated_at/.test(source);

  if (hasD1 && !hasCreatedAt) {
    findings.push({
      repo, file, check: 'missing_timestamps',
      severity: 'low',
      description: 'D1 database used but no created_at timestamps found. Audit trail is incomplete.',
      suggestion: 'Add created_at DATETIME DEFAULT CURRENT_TIMESTAMP to all tables.',
      canAutoFix: false,
    });
  }

  return findings;
}

function checkRootRoute(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  const hasRootRoute = /app\.get\s*\(\s*['"]\/['"]/.test(source)
    || /path\s*===?\s*['"]\/['"]/.test(source)
    || /pathname\s*===?\s*['"]\/['"]/.test(source)
    || /\bp\s*===?\s*['"]\/['"]/.test(source)
    || /\burl\.pathname\s*===?\s*['"]\/['"]/.test(source)
    || /===?\s*['"]\/['"]/.test(source)
    || /case\s+['"]\/['"]\s*:/.test(source);

  const isWorker = /async\s+fetch/.test(source) || /export\s+default/.test(source) || /new\s+Hono/.test(source);

  if (isWorker && !hasRootRoute) {
    findings.push({
      repo, file, check: 'missing_root_route',
      severity: 'low',
      description: 'No root route handler (/) found. Requests to / will return 404, causing false alerts in monitoring.',
      suggestion: "Add root route: app.get('/', (c) => c.redirect('/health')) or if (path === '/') return json({...})",
      canAutoFix: true,
    });
  }

  return findings;
}

function checkConsoleLogging(source: string, repo: string, file: string): DiagFinding[] {
  const findings: DiagFinding[] = [];

  // Count unstructured console.log calls (not already JSON.stringify)
  const unstructuredLogs = (source.match(/console\.log\((?!JSON\.stringify)/g) || []).length;
  const structuredLogs = (source.match(/console\.log\(JSON\.stringify/g) || []).length;
  const totalLogs = unstructuredLogs + structuredLogs;

  if (unstructuredLogs > 5 && unstructuredLogs > structuredLogs) {
    findings.push({
      repo, file, check: 'unstructured_logging',
      severity: 'low',
      description: `${unstructuredLogs} unstructured console.log calls vs ${structuredLogs} structured. Logs will be hard to parse in production.`,
      suggestion: 'Replace console.log(msg) with console.log(JSON.stringify({ ts, level, msg, service }))',
      canAutoFix: true,
    });
  }

  return findings;
}

// ═══ SCAN ORCHESTRATOR ═══

async function scanRepo(env: Env, repo: string): Promise<ScanResult> {
  const start = Date.now();
  const findings: DiagFinding[] = [];

  const { content: source, file, error } = await findWorkerSource(env, repo);
  if (!source) {
    return { repo, scanned: 0, findings: [], duration_ms: Date.now() - start, error };
  }

  // Run all checks
  findings.push(...checkHealthEndpoint(source, repo, file));
  findings.push(...checkStructuredLogging(source, repo, file));
  findings.push(...checkErrorHandling(source, repo, file));
  findings.push(...checkCorsHeaders(source, repo, file));
  findings.push(...checkVersionTracking(source, repo, file));
  findings.push(...checkRequestValidation(source, repo, file));
  findings.push(...checkTimestamps(source, repo, file));
  findings.push(...checkRootRoute(source, repo, file));
  findings.push(...checkConsoleLogging(source, repo, file));

  return { repo, scanned: 1, findings, duration_ms: Date.now() - start };
}

async function runDiagnosticScan(env: Env): Promise<{
  totalRepos: number;
  scannedRepos: number;
  totalFindings: number;
  criticalFindings: number;
  autoFixable: number;
  results: ScanResult[];
}> {
  // Rotate through repos — scan 5 per cycle
  const cycleKey = 'diag_scan_offset';
  const cached = await env.CACHE.get(cycleKey);
  const offset = cached ? parseInt(cached) : 0;

  const batch = WORKER_REPOS.slice(offset, offset + 5);
  const nextOffset = (offset + 5) >= WORKER_REPOS.length ? 0 : offset + 5;
  await env.CACHE.put(cycleKey, String(nextOffset));

  const results: ScanResult[] = [];
  for (const repo of batch) {
    try {
      const result = await scanRepo(env, repo);
      results.push(result);

      // Store findings in D1
      for (const f of result.findings) {
        // Check for duplicate
        const existing = await env.DB.prepare(
          `SELECT id FROM diagnostic_findings WHERE repo = ? AND file = ? AND check_type = ? AND status != 'resolved'`
        ).bind(f.repo, f.file, f.check).first();

        if (!existing) {
          await env.DB.prepare(
            `INSERT INTO diagnostic_findings (repo, file, check_type, severity, description, suggestion, line_number, can_auto_fix, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'detected', datetime('now'))`
          ).bind(f.repo, f.file, f.check, f.severity, f.description, f.suggestion, f.line || null, f.canAutoFix ? 1 : 0).run();
        }
      }
    } catch (e: any) {
      results.push({ repo, scanned: 0, findings: [], duration_ms: 0 });
    }
  }

  const totalFindings = results.reduce((s, r) => s + r.findings.length, 0);
  const criticalFindings = results.reduce((s, r) => s + r.findings.filter(f => f.severity === 'critical').length, 0);
  const autoFixable = results.reduce((s, r) => s + r.findings.filter(f => f.canAutoFix).length, 0);

  return {
    totalRepos: WORKER_REPOS.length,
    scannedRepos: results.filter(r => r.scanned > 0).length,
    totalFindings,
    criticalFindings,
    autoFixable,
    results,
  };
}

// ═══ AUTO-FIX ENGINE ═══

const STRUCTURED_LOG_HELPER = `
// ═══ Structured Logging Helper (injected by diagnostics-agent) ═══
function slog(level: string, msg: string, data?: Record<string, any>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, svc: 'WORKER_NAME', msg, ...data }));
}
`;

async function applyAutoFixes(env: Env, maxFixes = 3): Promise<{ applied: number; failed: number; skipped: number }> {
  let applied = 0, failed = 0, skipped = 0;

  const findings = await env.DB.prepare(
    `SELECT * FROM diagnostic_findings WHERE can_auto_fix = 1 AND status = 'detected' ORDER BY
     CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END
     LIMIT ?`
  ).bind(maxFixes).all();

  for (const row of (findings.results || [])) {
    const f = row as any;
    try {
      const { content: source } = await getFileContent(env, f.repo, f.file);
      if (!source) { skipped++; continue; }

      let fixed = source;
      let fixApplied = false;

      if (f.check_type === 'unstructured_logging') {
        // Add structured log helper at the top (after imports) and replace console.log calls
        const logHelper = STRUCTURED_LOG_HELPER.replace('WORKER_NAME', f.repo);

        // Insert helper after the first block of imports
        const lastImportIdx = fixed.lastIndexOf('import ');
        if (lastImportIdx >= 0) {
          const endOfImport = fixed.indexOf('\n', lastImportIdx);
          fixed = fixed.slice(0, endOfImport + 1) + logHelper + fixed.slice(endOfImport + 1);
        } else {
          fixed = logHelper + fixed;
        }

        // Replace console.log → slog("info", ...)
        fixed = fixed.replace(/console\.log\(([^)]+)\)/g, 'slog("info", $1)');
        fixed = fixed.replace(/console\.warn\(([^)]+)\)/g, 'slog("warn", $1)');
        fixed = fixed.replace(/console\.error\(([^)]+)\)/g, 'slog("error", $1)');
        fixed = fixed.replace(/console\.info\(([^)]+)\)/g, 'slog("info", $1)');
        fixApplied = true;
      }

      if (f.check_type === 'missing_cors') {
        // Add CORS headers constant
        const corsBlock = `
// ═══ CORS Headers (injected by diagnostics-agent) ═══
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://echo-ept.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Echo-API-Key, Authorization',
};
`;
        fixed = corsBlock + fixed;
        fixApplied = true;
      }

      if (f.check_type === 'missing_options_handler') {
        // Add OPTIONS handler after the fetch function opening
        const optionsHandler = `
  // OPTIONS preflight (injected by diagnostics-agent)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
`;
        // Insert after first occurrence of "async fetch"
        const fetchIdx = fixed.indexOf('async fetch');
        if (fetchIdx >= 0) {
          const braceIdx = fixed.indexOf('{', fetchIdx);
          if (braceIdx >= 0) {
            fixed = fixed.slice(0, braceIdx + 1) + optionsHandler + fixed.slice(braceIdx + 1);
            fixApplied = true;
          }
        }
      }

      if (fixApplied && fixed !== source) {
        const pushed = await pushFix(env, f.repo, f.file, fixed, `add ${f.check_type} [diagnostics-agent]`);
        if (pushed) {
          await env.DB.prepare(`UPDATE diagnostic_findings SET status = 'fixed', fixed_at = datetime('now') WHERE id = ?`).bind(f.id).run();
          applied++;
        } else {
          await env.DB.prepare(`UPDATE diagnostic_findings SET status = 'fix_failed' WHERE id = ?`).bind(f.id).run();
          failed++;
        }
      } else {
        skipped++;
      }
    } catch (e: any) {
      await env.DB.prepare(`UPDATE diagnostic_findings SET status = 'fix_failed' WHERE id = ?`).bind(f.id).run();
      failed++;
    }
  }

  return { applied, failed, skipped };
}

// ═══ REPORTING ═══

async function reportToBrain(env: Env, content: string, importance: number, tags: string[]): Promise<void> {
  try {
    await env.SVC_BRAIN.fetch('https://internal/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instance_id: 'diagnostics_agent',
        role: 'assistant',
        content,
        importance,
        tags,
      }),
    });
  } catch {}
}

// ═══ D1 SCHEMA INIT ═══

let dbReady = false;

async function initDB(db: D1Database): Promise<void> {
  if (dbReady) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS diagnostic_findings (id INTEGER PRIMARY KEY AUTOINCREMENT, repo TEXT NOT NULL, file TEXT NOT NULL, check_type TEXT NOT NULL, severity TEXT NOT NULL DEFAULT 'medium', description TEXT, suggestion TEXT, line_number INTEGER, can_auto_fix INTEGER DEFAULT 0, status TEXT DEFAULT 'detected', fixed_at TEXT, created_at TEXT DEFAULT (datetime('now')))`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS scan_history (id INTEGER PRIMARY KEY AUTOINCREMENT, repos_scanned INTEGER, findings_count INTEGER, critical_count INTEGER, auto_fixable INTEGER, fixes_applied INTEGER DEFAULT 0, duration_ms INTEGER, created_at TEXT DEFAULT (datetime('now')))`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_findings_status ON diagnostic_findings(status)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_findings_repo ON diagnostic_findings(repo)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_findings_severity ON diagnostic_findings(severity)`).run();
    dbReady = true;
  } catch (e: any) {
    // Tables likely already exist
    if (e?.message?.includes('already exists')) { dbReady = true; return; }
    throw e;
  }
}

// ═══ CRON HANDLER ═══

async function handleCron(env: Env, ctx: ExecutionContext): Promise<void> {
  await initDB(env.DB);

  const start = Date.now();

  // Phase 1: Scan repos for diagnostics issues
  const scanResult = await runDiagnosticScan(env);

  // Phase 2: Apply auto-fixes for detected issues
  const fixResult = await applyAutoFixes(env, 3);

  const duration = Date.now() - start;

  // Record scan history
  await env.DB.prepare(
    `INSERT INTO scan_history (repos_scanned, findings_count, critical_count, auto_fixable, fixes_applied, duration_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(scanResult.scannedRepos, scanResult.totalFindings, scanResult.criticalFindings, scanResult.autoFixable, fixResult.applied, duration).run();

  // Report to Shared Brain
  if (scanResult.totalFindings > 0 || fixResult.applied > 0) {
    const summary = `DIAGNOSTICS AGENT: Scanned ${scanResult.scannedRepos}/${scanResult.totalRepos} repos. Found ${scanResult.totalFindings} issues (${scanResult.criticalFindings} critical, ${scanResult.autoFixable} auto-fixable). Applied ${fixResult.applied} fixes, ${fixResult.failed} failed, ${fixResult.skipped} skipped.`;
    ctx.waitUntil(reportToBrain(env, summary, 7, ['diagnostics', 'auto-fix', 'logging']));
  }
}

// ═══ HTTP HANDLER ═══

async function handleRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  await initDB(env.DB);

  const url = new URL(request.url);
  const path = url.pathname;

  // Auth check for write endpoints
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    const apiKey = request.headers.get('X-Echo-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!env.ECHO_API_KEY || apiKey !== env.ECHO_API_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS });
    }
  }

  // ─── GET /health ───
  if (path === '/health' || path === '/') {
    const stats = await env.DB.prepare(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status='detected' THEN 1 ELSE 0 END) as detected,
              SUM(CASE WHEN status='fixed' THEN 1 ELSE 0 END) as fixed,
              SUM(CASE WHEN severity='critical' THEN 1 ELSE 0 END) as critical
       FROM diagnostic_findings`
    ).first();

    return new Response(JSON.stringify({
      status: 'ok',
      service: 'echo-diagnostics-agent',
      version: env.WORKER_VERSION,
      timestamp: new Date().toISOString(),
      stats: stats || {},
      reposTracked: WORKER_REPOS.length,
      capabilities: [
        'health_endpoint_detection', 'structured_logging_check',
        'error_handling_audit', 'cors_verification',
        'auth_middleware_check', 'timestamp_audit',
        'auto_fix_logging', 'auto_fix_cors', 'auto_fix_options',
      ],
    }), { headers: CORS_HEADERS });
  }

  // ─── GET /findings ───
  if (path === '/findings') {
    const status = url.searchParams.get('status') || null;
    const severity = url.searchParams.get('severity') || null;
    const repo = url.searchParams.get('repo') || null;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let sql = 'SELECT * FROM diagnostic_findings WHERE 1=1';
    const params: any[] = [];

    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (severity) { sql += ' AND severity = ?'; params.push(severity); }
    if (repo) { sql += ' AND repo = ?'; params.push(repo); }

    sql += ' ORDER BY CASE severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 ELSE 4 END, created_at DESC LIMIT ?';
    params.push(limit);

    const stmt = env.DB.prepare(sql);
    const rows = await stmt.bind(...params).all();

    return new Response(JSON.stringify({ findings: rows.results, total: rows.results?.length || 0 }), { headers: CORS_HEADERS });
  }

  // ─── GET /history ───
  if (path === '/history') {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const rows = await env.DB.prepare(
      `SELECT * FROM scan_history ORDER BY created_at DESC LIMIT ?`
    ).bind(limit).all();
    return new Response(JSON.stringify({ history: rows.results }), { headers: CORS_HEADERS });
  }

  // ─── GET /summary ───
  if (path === '/summary') {
    const byRepo = await env.DB.prepare(
      `SELECT repo, COUNT(*) as total,
              SUM(CASE WHEN severity='critical' THEN 1 ELSE 0 END) as critical,
              SUM(CASE WHEN severity='high' THEN 1 ELSE 0 END) as high,
              SUM(CASE WHEN status='detected' THEN 1 ELSE 0 END) as open,
              SUM(CASE WHEN status='fixed' THEN 1 ELSE 0 END) as fixed
       FROM diagnostic_findings GROUP BY repo ORDER BY critical DESC, total DESC`
    ).all();

    const byCheck = await env.DB.prepare(
      `SELECT check_type, COUNT(*) as total,
              SUM(CASE WHEN status='detected' THEN 1 ELSE 0 END) as open,
              SUM(CASE WHEN status='fixed' THEN 1 ELSE 0 END) as fixed
       FROM diagnostic_findings GROUP BY check_type ORDER BY total DESC`
    ).all();

    return new Response(JSON.stringify({
      byRepo: byRepo.results,
      byCheck: byCheck.results,
      totalRepos: WORKER_REPOS.length,
    }), { headers: CORS_HEADERS });
  }

  // ─── POST /scan ───
  if (path === '/scan' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const repo = body.repo;

    if (repo) {
      const result = await scanRepo(env, repo);
      // Store findings
      for (const f of result.findings) {
        const existing = await env.DB.prepare(
          `SELECT id FROM diagnostic_findings WHERE repo = ? AND file = ? AND check_type = ? AND status != 'resolved'`
        ).bind(f.repo, f.file, f.check).first();
        if (!existing) {
          await env.DB.prepare(
            `INSERT INTO diagnostic_findings (repo, file, check_type, severity, description, suggestion, line_number, can_auto_fix, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'detected', datetime('now'))`
          ).bind(f.repo, f.file, f.check, f.severity, f.description, f.suggestion, f.line || null, f.canAutoFix ? 1 : 0).run();
        }
      }
      return new Response(JSON.stringify(result), { headers: CORS_HEADERS });
    }

    // Full scan
    const result = await runDiagnosticScan(env);
    return new Response(JSON.stringify(result), { headers: CORS_HEADERS });
  }

  // ─── POST /fix ───
  if (path === '/fix' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const maxFixes = body.max || 5;
    const result = await applyAutoFixes(env, maxFixes);
    return new Response(JSON.stringify(result), { headers: CORS_HEADERS });
  }

  // ─── POST /resolve ───
  if (path === '/resolve' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    if (body.id) {
      await env.DB.prepare(`UPDATE diagnostic_findings SET status = 'resolved' WHERE id = ?`).bind(body.id).run();
      return new Response(JSON.stringify({ resolved: body.id }), { headers: CORS_HEADERS });
    }
    return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: CORS_HEADERS });
  }

  // ─── GET /debug ───
  if (path === '/debug') {
    const tokenSet = !!env.GITHUB_TOKEN;
    const tokenLen = env.GITHUB_TOKEN?.length || 0;
    const owner = env.GITHUB_OWNER;
    // Test GitHub API
    const testResult = await githubFetch(env, `/repos/${owner}/echo-analytics-engine`);
    return new Response(JSON.stringify({
      tokenSet,
      tokenLen,
      owner,
      githubTest: { status: testResult.status, repoName: testResult.data?.full_name || null, error: testResult.error?.slice(0, 100) },
    }), { headers: CORS_HEADERS });
  }

  // ─── 404 ───
  return new Response(JSON.stringify({
    error: 'Not found',
    endpoints: [
      'GET /health', 'GET /findings', 'GET /history', 'GET /summary',
      'POST /scan', 'POST /fix', 'POST /resolve',
    ],
  }), { status: 404, headers: CORS_HEADERS });
}

// ═══ MAIN EXPORT ═══


// Security headers
const SEC_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
function withSecHeaders(res: Response): Response {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(SEC_HEADERS)) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await handleRequest(request, env);
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e?.message || 'Unknown error', stack: e?.stack?.split('\n').slice(0, 5) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      await handleCron(env, ctx);
    } catch (e: any) {
      ctx.waitUntil(reportToBrain(env, `DIAGNOSTICS AGENT ERROR: ${e?.message}`, 8, ['error', 'diagnostics']));
    }
  },
};
