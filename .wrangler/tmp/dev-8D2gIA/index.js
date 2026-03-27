var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/index.ts
var GITHUB_API = "https://api.github.com";
var CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Echo-API-Key"
};
var WORKER_REPOS = [
  "echo-autonomous-daemon",
  "echo-shared-brain",
  "echo-engine-runtime",
  "echo-doctrine-forge",
  "echo-knowledge-forge",
  "echo-chat",
  "echo-speak-cloud",
  "echo-analytics-engine",
  "echo-crm",
  "echo-helpdesk",
  "echo-booking",
  "echo-invoice",
  "echo-inventory",
  "echo-forms",
  "echo-hr",
  "echo-contracts",
  "echo-lms",
  "echo-email-marketing",
  "echo-surveys",
  "echo-knowledge-base",
  "echo-workflow-automation",
  "echo-social-media",
  "echo-document-manager",
  "echo-live-chat",
  "echo-link-shortener",
  "echo-feedback-board",
  "echo-newsletter",
  "echo-web-analytics",
  "echo-waitlist",
  "echo-reviews",
  "echo-signatures",
  "echo-affiliate",
  "echo-proposals",
  "echo-gamer-companion",
  "echo-qr-menu",
  "echo-podcast",
  "echo-payroll",
  "echo-calendar",
  "echo-compliance",
  "echo-recruiting",
  "echo-timesheet",
  "echo-finance-ai",
  "echo-home-ai",
  "echo-shepherd-ai",
  "echo-intel-hub",
  "echo-call-center",
  "echo-project-manager",
  "echo-expense",
  "echo-okr",
  "echo-x-bot",
  "echo-linkedin",
  "echo-telegram",
  "echo-reddit-bot",
  "echo-instagram",
  "echo-slack",
  "echo-qa-tester",
  "echo-autonomous-builder",
  "echo-feature-flags",
  "echo-vault-api",
  "echo-config-manager",
  "echo-alert-router",
  "echo-rate-limiter",
  "echo-cron-orchestrator",
  "echo-notification-hub",
  "echo-service-registry",
  "echo-health-dashboard",
  "echo-cost-optimizer"
];
async function githubFetch(env2, path) {
  const token = env2.GITHUB_TOKEN;
  if (!token) return null;
  const resp = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "echo-diagnostics-agent/1.0"
    }
  });
  if (!resp.ok) return null;
  return resp.json();
}
__name(githubFetch, "githubFetch");
async function getFileContent(env2, repo, filePath) {
  const data = await githubFetch(env2, `/repos/${env2.GITHUB_OWNER}/${repo}/contents/${filePath}`);
  if (!data?.content) return null;
  try {
    return atob(data.content.replace(/\n/g, ""));
  } catch {
    return null;
  }
}
__name(getFileContent, "getFileContent");
async function pushFix(env2, repo, filePath, content, message) {
  const token = env2.GITHUB_TOKEN;
  if (!token) return false;
  const existing = await githubFetch(env2, `/repos/${env2.GITHUB_OWNER}/${repo}/contents/${filePath}`);
  const sha = existing?.sha;
  const resp = await fetch(`${GITHUB_API}/repos/${env2.GITHUB_OWNER}/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "echo-diagnostics-agent/1.0",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `fix(diagnostics): ${message}`,
      content: btoa(content),
      ...sha ? { sha } : {}
    })
  });
  return resp.ok;
}
__name(pushFix, "pushFix");
function checkHealthEndpoint(source, repo, file) {
  const findings = [];
  const hasHealth = /['"\/]health['"]/.test(source) || /path\s*===?\s*['"]\/health['"]/.test(source);
  if (!hasHealth && source.includes("fetch(") && source.includes("Request")) {
    findings.push({
      repo,
      file,
      check: "missing_health_endpoint",
      severity: "critical",
      description: "Worker has no /health endpoint. Fleet monitoring cannot detect if this Worker is alive.",
      suggestion: 'Add a GET /health route returning { status: "ok", service, version, timestamp }',
      canAutoFix: true
    });
  }
  return findings;
}
__name(checkHealthEndpoint, "checkHealthEndpoint");
function checkStructuredLogging(source, repo, file) {
  const findings = [];
  const lines = source.split("\n");
  let consoleLogCount = 0;
  const consoleLogLines = [];
  lines.forEach((line, i) => {
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) return;
    if (/console\.(log|warn|info|debug)\(/.test(line)) {
      consoleLogCount++;
      if (consoleLogLines.length < 5) consoleLogLines.push(i + 1);
    }
  });
  if (consoleLogCount > 3) {
    findings.push({
      repo,
      file,
      check: "unstructured_logging",
      severity: "high",
      description: `${consoleLogCount} console.log/warn/info/debug calls found. Should use structured JSON logging.`,
      suggestion: "Replace console.log with structured log helper: function slog(level, msg, data) { console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...data })); }",
      line: consoleLogLines[0],
      canAutoFix: true
    });
  }
  return findings;
}
__name(checkStructuredLogging, "checkStructuredLogging");
function checkErrorHandling(source, repo, file) {
  const findings = [];
  const bareMatches = source.match(/catch\s*\([^)]*\)\s*\{[\s\n]*\}/g);
  if (bareMatches && bareMatches.length > 0) {
    findings.push({
      repo,
      file,
      check: "bare_catch_blocks",
      severity: "high",
      description: `${bareMatches.length} empty catch blocks found \u2014 errors are silently swallowed.`,
      suggestion: 'Add error logging inside catch blocks: catch(e) { slog("error", "operation failed", { error: e.message }); }',
      canAutoFix: false
    });
  }
  const d1Calls = (source.match(/env\.DB\.prepare\(/g) || []).length;
  const tryCatchBlocks = (source.match(/try\s*\{/g) || []).length;
  if (d1Calls > 5 && tryCatchBlocks < d1Calls / 3) {
    findings.push({
      repo,
      file,
      check: "unprotected_d1_queries",
      severity: "medium",
      description: `${d1Calls} D1 queries but only ${tryCatchBlocks} try-catch blocks. Many queries may crash without error handling.`,
      suggestion: "Wrap D1 queries in try-catch blocks with structured error logging.",
      canAutoFix: false
    });
  }
  return findings;
}
__name(checkErrorHandling, "checkErrorHandling");
function checkCorsHeaders(source, repo, file) {
  const findings = [];
  const hasCors = /Access-Control-Allow-Origin/.test(source);
  const hasOptions = /OPTIONS/.test(source);
  const hasFetch = /async\s+fetch/.test(source) || /export\s+default/.test(source);
  if (hasFetch && !hasCors) {
    findings.push({
      repo,
      file,
      check: "missing_cors",
      severity: "medium",
      description: "No CORS headers found. API calls from browser-based dashboards will fail.",
      suggestion: "Add CORS headers constant and OPTIONS preflight handler.",
      canAutoFix: true
    });
  }
  if (hasFetch && hasCors && !hasOptions) {
    findings.push({
      repo,
      file,
      check: "missing_options_handler",
      severity: "low",
      description: "CORS headers present but no OPTIONS preflight handler found.",
      suggestion: 'Add: if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });',
      canAutoFix: true
    });
  }
  return findings;
}
__name(checkCorsHeaders, "checkCorsHeaders");
function checkVersionTracking(source, repo, file) {
  const findings = [];
  const hasVersion = /version/i.test(source) && (/WORKER_VERSION/.test(source) || /env\.WORKER_VERSION/.test(source));
  if (!hasVersion) {
    findings.push({
      repo,
      file,
      check: "no_version_tracking",
      severity: "low",
      description: "No version tracking found. Health endpoint should report the deployed version.",
      suggestion: "Add WORKER_VERSION to wrangler.toml [vars] and include it in /health response.",
      canAutoFix: false
    });
  }
  return findings;
}
__name(checkVersionTracking, "checkVersionTracking");
function checkRequestValidation(source, repo, file) {
  const findings = [];
  const hasAuth = /X-Echo-API-Key/i.test(source) || /authorization/i.test(source) || /auth/i.test(source);
  const hasPOST = /POST/.test(source);
  const hasPUT = /PUT/.test(source);
  const hasDELETE = /DELETE/.test(source);
  if ((hasPOST || hasPUT || hasDELETE) && !hasAuth) {
    findings.push({
      repo,
      file,
      check: "no_auth_middleware",
      severity: "critical",
      description: "Worker accepts POST/PUT/DELETE requests but has no authentication check.",
      suggestion: "Add X-Echo-API-Key header validation for write endpoints.",
      canAutoFix: false
    });
  }
  return findings;
}
__name(checkRequestValidation, "checkRequestValidation");
function checkTimestamps(source, repo, file) {
  const findings = [];
  const hasD1 = /env\.DB/.test(source);
  const hasCreatedAt = /created_at/.test(source);
  const hasUpdatedAt = /updated_at/.test(source);
  if (hasD1 && !hasCreatedAt) {
    findings.push({
      repo,
      file,
      check: "missing_timestamps",
      severity: "low",
      description: "D1 database used but no created_at timestamps found. Audit trail is incomplete.",
      suggestion: "Add created_at DATETIME DEFAULT CURRENT_TIMESTAMP to all tables.",
      canAutoFix: false
    });
  }
  return findings;
}
__name(checkTimestamps, "checkTimestamps");
async function scanRepo(env2, repo) {
  const start = Date.now();
  const findings = [];
  const source = await getFileContent(env2, repo, "src/index.ts");
  if (!source) {
    return { repo, scanned: 0, findings: [], duration_ms: Date.now() - start };
  }
  findings.push(...checkHealthEndpoint(source, repo, "src/index.ts"));
  findings.push(...checkStructuredLogging(source, repo, "src/index.ts"));
  findings.push(...checkErrorHandling(source, repo, "src/index.ts"));
  findings.push(...checkCorsHeaders(source, repo, "src/index.ts"));
  findings.push(...checkVersionTracking(source, repo, "src/index.ts"));
  findings.push(...checkRequestValidation(source, repo, "src/index.ts"));
  findings.push(...checkTimestamps(source, repo, "src/index.ts"));
  return { repo, scanned: 1, findings, duration_ms: Date.now() - start };
}
__name(scanRepo, "scanRepo");
async function runDiagnosticScan(env2) {
  const cycleKey = "diag_scan_offset";
  const cached = await env2.CACHE.get(cycleKey);
  const offset = cached ? parseInt(cached) : 0;
  const batch = WORKER_REPOS.slice(offset, offset + 5);
  const nextOffset = offset + 5 >= WORKER_REPOS.length ? 0 : offset + 5;
  await env2.CACHE.put(cycleKey, String(nextOffset));
  const results = [];
  for (const repo of batch) {
    try {
      const result = await scanRepo(env2, repo);
      results.push(result);
      for (const f of result.findings) {
        const existing = await env2.DB.prepare(
          `SELECT id FROM diagnostic_findings WHERE repo = ? AND file = ? AND check_type = ? AND status != 'resolved'`
        ).bind(f.repo, f.file, f.check).first();
        if (!existing) {
          await env2.DB.prepare(
            `INSERT INTO diagnostic_findings (repo, file, check_type, severity, description, suggestion, line_number, can_auto_fix, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'detected', datetime('now'))`
          ).bind(f.repo, f.file, f.check, f.severity, f.description, f.suggestion, f.line || null, f.canAutoFix ? 1 : 0).run();
        }
      }
    } catch (e) {
      results.push({ repo, scanned: 0, findings: [], duration_ms: 0 });
    }
  }
  const totalFindings = results.reduce((s, r) => s + r.findings.length, 0);
  const criticalFindings = results.reduce((s, r) => s + r.findings.filter((f) => f.severity === "critical").length, 0);
  const autoFixable = results.reduce((s, r) => s + r.findings.filter((f) => f.canAutoFix).length, 0);
  return {
    totalRepos: WORKER_REPOS.length,
    scannedRepos: results.filter((r) => r.scanned > 0).length,
    totalFindings,
    criticalFindings,
    autoFixable,
    results
  };
}
__name(runDiagnosticScan, "runDiagnosticScan");
var STRUCTURED_LOG_HELPER = `
// \u2550\u2550\u2550 Structured Logging Helper (injected by diagnostics-agent) \u2550\u2550\u2550
function slog(level: string, msg: string, data?: Record<string, any>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, svc: 'WORKER_NAME', msg, ...data }));
}
`;
async function applyAutoFixes(env2, maxFixes = 3) {
  let applied = 0, failed = 0, skipped = 0;
  const findings = await env2.DB.prepare(
    `SELECT * FROM diagnostic_findings WHERE can_auto_fix = 1 AND status = 'detected' ORDER BY
     CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END
     LIMIT ?`
  ).bind(maxFixes).all();
  for (const row of findings.results || []) {
    const f = row;
    try {
      const source = await getFileContent(env2, f.repo, f.file);
      if (!source) {
        skipped++;
        continue;
      }
      let fixed = source;
      let fixApplied = false;
      if (f.check_type === "unstructured_logging") {
        const logHelper = STRUCTURED_LOG_HELPER.replace("WORKER_NAME", f.repo);
        const lastImportIdx = fixed.lastIndexOf("import ");
        if (lastImportIdx >= 0) {
          const endOfImport = fixed.indexOf("\n", lastImportIdx);
          fixed = fixed.slice(0, endOfImport + 1) + logHelper + fixed.slice(endOfImport + 1);
        } else {
          fixed = logHelper + fixed;
        }
        fixed = fixed.replace(/console\.log\(([^)]+)\)/g, 'slog("info", $1)');
        fixed = fixed.replace(/console\.warn\(([^)]+)\)/g, 'slog("warn", $1)');
        fixed = fixed.replace(/console\.error\(([^)]+)\)/g, 'slog("error", $1)');
        fixed = fixed.replace(/console\.info\(([^)]+)\)/g, 'slog("info", $1)');
        fixApplied = true;
      }
      if (f.check_type === "missing_cors") {
        const corsBlock = `
// \u2550\u2550\u2550 CORS Headers (injected by diagnostics-agent) \u2550\u2550\u2550
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Echo-API-Key, Authorization',
};
`;
        fixed = corsBlock + fixed;
        fixApplied = true;
      }
      if (f.check_type === "missing_options_handler") {
        const optionsHandler = `
  // OPTIONS preflight (injected by diagnostics-agent)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
`;
        const fetchIdx = fixed.indexOf("async fetch");
        if (fetchIdx >= 0) {
          const braceIdx = fixed.indexOf("{", fetchIdx);
          if (braceIdx >= 0) {
            fixed = fixed.slice(0, braceIdx + 1) + optionsHandler + fixed.slice(braceIdx + 1);
            fixApplied = true;
          }
        }
      }
      if (fixApplied && fixed !== source) {
        const pushed = await pushFix(env2, f.repo, f.file, fixed, `add ${f.check_type} [diagnostics-agent]`);
        if (pushed) {
          await env2.DB.prepare(`UPDATE diagnostic_findings SET status = 'fixed', fixed_at = datetime('now') WHERE id = ?`).bind(f.id).run();
          applied++;
        } else {
          await env2.DB.prepare(`UPDATE diagnostic_findings SET status = 'fix_failed' WHERE id = ?`).bind(f.id).run();
          failed++;
        }
      } else {
        skipped++;
      }
    } catch (e) {
      await env2.DB.prepare(`UPDATE diagnostic_findings SET status = 'fix_failed' WHERE id = ?`).bind(f.id).run();
      failed++;
    }
  }
  return { applied, failed, skipped };
}
__name(applyAutoFixes, "applyAutoFixes");
async function reportToBrain(env2, content, importance, tags) {
  try {
    await env2.SVC_BRAIN.fetch("https://internal/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instance_id: "diagnostics_agent",
        role: "assistant",
        content,
        importance,
        tags
      })
    });
  } catch {
  }
}
__name(reportToBrain, "reportToBrain");
var dbReady = false;
async function initDB(db) {
  if (dbReady) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS diagnostic_findings (id INTEGER PRIMARY KEY AUTOINCREMENT, repo TEXT NOT NULL, file TEXT NOT NULL, check_type TEXT NOT NULL, severity TEXT NOT NULL DEFAULT 'medium', description TEXT, suggestion TEXT, line_number INTEGER, can_auto_fix INTEGER DEFAULT 0, status TEXT DEFAULT 'detected', fixed_at TEXT, created_at TEXT DEFAULT (datetime('now')))`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS scan_history (id INTEGER PRIMARY KEY AUTOINCREMENT, repos_scanned INTEGER, findings_count INTEGER, critical_count INTEGER, auto_fixable INTEGER, fixes_applied INTEGER DEFAULT 0, duration_ms INTEGER, created_at TEXT DEFAULT (datetime('now')))`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_findings_status ON diagnostic_findings(status)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_findings_repo ON diagnostic_findings(repo)`).run();
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_findings_severity ON diagnostic_findings(severity)`).run();
    dbReady = true;
  } catch (e) {
    if (e?.message?.includes("already exists")) {
      dbReady = true;
      return;
    }
    throw e;
  }
}
__name(initDB, "initDB");
async function handleCron(env2, ctx) {
  await initDB(env2.DB);
  const start = Date.now();
  const scanResult = await runDiagnosticScan(env2);
  const fixResult = await applyAutoFixes(env2, 3);
  const duration = Date.now() - start;
  await env2.DB.prepare(
    `INSERT INTO scan_history (repos_scanned, findings_count, critical_count, auto_fixable, fixes_applied, duration_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(scanResult.scannedRepos, scanResult.totalFindings, scanResult.criticalFindings, scanResult.autoFixable, fixResult.applied, duration).run();
  if (scanResult.totalFindings > 0 || fixResult.applied > 0) {
    const summary = `DIAGNOSTICS AGENT: Scanned ${scanResult.scannedRepos}/${scanResult.totalRepos} repos. Found ${scanResult.totalFindings} issues (${scanResult.criticalFindings} critical, ${scanResult.autoFixable} auto-fixable). Applied ${fixResult.applied} fixes, ${fixResult.failed} failed, ${fixResult.skipped} skipped.`;
    ctx.waitUntil(reportToBrain(env2, summary, 7, ["diagnostics", "auto-fix", "logging"]));
  }
}
__name(handleCron, "handleCron");
async function handleRequest(request, env2) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  await initDB(env2.DB);
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/health" || path === "/") {
    const stats = await env2.DB.prepare(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status='detected' THEN 1 ELSE 0 END) as detected,
              SUM(CASE WHEN status='fixed' THEN 1 ELSE 0 END) as fixed,
              SUM(CASE WHEN severity='critical' THEN 1 ELSE 0 END) as critical
       FROM diagnostic_findings`
    ).first();
    return new Response(JSON.stringify({
      status: "ok",
      service: "echo-diagnostics-agent",
      version: env2.WORKER_VERSION,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      stats: stats || {},
      reposTracked: WORKER_REPOS.length,
      capabilities: [
        "health_endpoint_detection",
        "structured_logging_check",
        "error_handling_audit",
        "cors_verification",
        "auth_middleware_check",
        "timestamp_audit",
        "auto_fix_logging",
        "auto_fix_cors",
        "auto_fix_options"
      ]
    }), { headers: CORS_HEADERS });
  }
  if (path === "/findings") {
    const status = url.searchParams.get("status") || null;
    const severity = url.searchParams.get("severity") || null;
    const repo = url.searchParams.get("repo") || null;
    const limit = parseInt(url.searchParams.get("limit") || "50");
    let sql = "SELECT * FROM diagnostic_findings WHERE 1=1";
    const params = [];
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (severity) {
      sql += " AND severity = ?";
      params.push(severity);
    }
    if (repo) {
      sql += " AND repo = ?";
      params.push(repo);
    }
    sql += " ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, created_at DESC LIMIT ?";
    params.push(limit);
    const stmt = env2.DB.prepare(sql);
    const rows = await stmt.bind(...params).all();
    return new Response(JSON.stringify({ findings: rows.results, total: rows.results?.length || 0 }), { headers: CORS_HEADERS });
  }
  if (path === "/history") {
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const rows = await env2.DB.prepare(
      `SELECT * FROM scan_history ORDER BY created_at DESC LIMIT ?`
    ).bind(limit).all();
    return new Response(JSON.stringify({ history: rows.results }), { headers: CORS_HEADERS });
  }
  if (path === "/summary") {
    const byRepo = await env2.DB.prepare(
      `SELECT repo, COUNT(*) as total,
              SUM(CASE WHEN severity='critical' THEN 1 ELSE 0 END) as critical,
              SUM(CASE WHEN severity='high' THEN 1 ELSE 0 END) as high,
              SUM(CASE WHEN status='detected' THEN 1 ELSE 0 END) as open,
              SUM(CASE WHEN status='fixed' THEN 1 ELSE 0 END) as fixed
       FROM diagnostic_findings GROUP BY repo ORDER BY critical DESC, total DESC`
    ).all();
    const byCheck = await env2.DB.prepare(
      `SELECT check_type, COUNT(*) as total,
              SUM(CASE WHEN status='detected' THEN 1 ELSE 0 END) as open,
              SUM(CASE WHEN status='fixed' THEN 1 ELSE 0 END) as fixed
       FROM diagnostic_findings GROUP BY check_type ORDER BY total DESC`
    ).all();
    return new Response(JSON.stringify({
      byRepo: byRepo.results,
      byCheck: byCheck.results,
      totalRepos: WORKER_REPOS.length
    }), { headers: CORS_HEADERS });
  }
  if (path === "/scan" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const repo = body.repo;
    if (repo) {
      const result2 = await scanRepo(env2, repo);
      for (const f of result2.findings) {
        const existing = await env2.DB.prepare(
          `SELECT id FROM diagnostic_findings WHERE repo = ? AND file = ? AND check_type = ? AND status != 'resolved'`
        ).bind(f.repo, f.file, f.check).first();
        if (!existing) {
          await env2.DB.prepare(
            `INSERT INTO diagnostic_findings (repo, file, check_type, severity, description, suggestion, line_number, can_auto_fix, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'detected', datetime('now'))`
          ).bind(f.repo, f.file, f.check, f.severity, f.description, f.suggestion, f.line || null, f.canAutoFix ? 1 : 0).run();
        }
      }
      return new Response(JSON.stringify(result2), { headers: CORS_HEADERS });
    }
    const result = await runDiagnosticScan(env2);
    return new Response(JSON.stringify(result), { headers: CORS_HEADERS });
  }
  if (path === "/fix" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const maxFixes = body.max || 5;
    const result = await applyAutoFixes(env2, maxFixes);
    return new Response(JSON.stringify(result), { headers: CORS_HEADERS });
  }
  if (path === "/resolve" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (body.id) {
      await env2.DB.prepare(`UPDATE diagnostic_findings SET status = 'resolved' WHERE id = ?`).bind(body.id).run();
      return new Response(JSON.stringify({ resolved: body.id }), { headers: CORS_HEADERS });
    }
    return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: CORS_HEADERS });
  }
  return new Response(JSON.stringify({
    error: "Not found",
    endpoints: [
      "GET /health",
      "GET /findings",
      "GET /history",
      "GET /summary",
      "POST /scan",
      "POST /fix",
      "POST /resolve"
    ]
  }), { status: 404, headers: CORS_HEADERS });
}
__name(handleRequest, "handleRequest");
var src_default = {
  async fetch(request, env2, ctx) {
    try {
      return await handleRequest(request, env2);
    } catch (e) {
      return new Response(JSON.stringify({ error: e?.message || "Unknown error", stack: e?.stack?.split("\n").slice(0, 5) }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  },
  async scheduled(event, env2, ctx) {
    try {
      await handleCron(env2, ctx);
    } catch (e) {
      ctx.waitUntil(reportToBrain(env2, `DIAGNOSTICS AGENT ERROR: ${e?.message}`, 8, ["error", "diagnostics"]));
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oUp13s/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oUp13s/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
