import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "..", "logs");

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const RETENTION_DAYS = 30;

const mkdir = () => {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
};

const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ── Rotation ──────────────────────────────────────────────────
// When today's .log exceeds 50 MB, shift .log → .log.1 → .log.2 … keeping
// at most 3 rotated copies (oldest is deleted).
const rotateIfNeeded = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_FILE_BYTES) return;

    // Delete the oldest rotated file if we already have MAX_ROTATIONS
    const MAX_ROTATIONS = 3;
    const oldest = `${filePath}.${MAX_ROTATIONS}`;
    if (fs.existsSync(oldest)) {
      try { fs.unlinkSync(oldest); } catch {}
    }

    // Shift: .log.2 ← .log.1 ← .log.0 ← .log
    for (let i = MAX_ROTATIONS - 1; i >= 0; i--) {
      const from = i === 0 ? filePath : `${filePath}.${i}`;
      const to = `${filePath}.${i + 1}`;
      if (fs.existsSync(from)) {
        try { fs.renameSync(from, to); } catch {}
      }
    }
  } catch {
    // Rotation failure should not crash the app
  }
};

// ── Age-based cleanup ─────────────────────────────────────────
// Deletes log files (including rotated .log.N) older than RETENTION_DAYS.
// Called once at startup and daily via cron.
export const pruneOldLogs = () => {
  mkdir();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  try {
    const files = fs.readdirSync(LOG_DIR);
    for (const file of files) {
      // Match: YYYY-MM-DD.log or YYYY-MM-DD.log.1 … .log.3
      if (!/^\d{4}-\d{2}-\d{2}\.log(\.\d+)?$/.test(file)) continue;
      const filePath = path.join(LOG_DIR, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch {}
    }
  } catch {}

  return deleted;
};

// ── Write ─────────────────────────────────────────────────────
const write = (level, message, data) => {
  const line = `[${new Date().toISOString()}] [${level}] ${message}${
    data && Object.keys(data).length ? " " + JSON.stringify(data) : ""
  }\n`;

  try {
    if (level === "ERROR") {
      console.error(line.trimEnd());
    } else if (level === "WARN") {
      console.warn(line.trimEnd());
    } else {
      console.log(line.trimEnd());
    }
  } catch (err) {
    // Ignore console write errors to avoid infinite uncaughtException loops
  }

  try {
    mkdir();
    const logFile = path.join(LOG_DIR, `${today()}.log`);
    rotateIfNeeded(logFile);
    fs.appendFileSync(logFile, line);
  } catch (err) {
    console.error("Logger write failed:", err.message);
  }
};

export const logger = {
  info: (message, data = {}) => write("INFO", message, data),
  warn: (message, data = {}) => write("WARN", message, data),
  error: (message, data = {}) => write("ERROR", message, data),
};

// Express request-logging middleware. Use AFTER session/body parsers so
// req.path is final, BEFORE routes. Skipped for /health to keep checks clean.
export const requestLogger = (req, res, next) => {
  if (req.path === "/health") return next();
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const entry = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
    };
    if (res.statusCode >= 500) logger.error("request failed", entry);
    else if (res.statusCode >= 400) logger.warn("request", entry);
    else logger.info("request", entry);
  });
  next();
};

// Capture unexpected process-level errors into the error log
export const registerGlobalErrorHandlers = () => {
  process.on("uncaughtException", (err) => {
    logger.error("uncaughtException", { name: err.name, message: err.message, stack: err.stack });
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    logger.error("unhandledRejection", {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
};
