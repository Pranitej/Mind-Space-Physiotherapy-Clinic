import "server-only";

type Level = "debug" | "info" | "warn" | "error";
type Context = Record<string, unknown>;

/**
 * Minimal structured logger. Emits one JSON object per line so logs are
 * searchable in Vercel's log viewer.
 *
 * Privacy rule: never pass personal data (names, emails, phone numbers,
 * messages, raw IPs) in `context`. Log identifiers such as an enquiry
 * reference instead. Keys that look sensitive are redacted defensively.
 */
const SENSITIVE_KEYS = /pass(word)?|secret|token|authorization|cookie|email|phone|name|message|ip$/i;

function redact(context: Context): Context {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, SENSITIVE_KEYS.test(key) ? "[redacted]" : value]),
  );
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

function write(level: Level, event: string, context: Context = {}) {
  const { error, ...rest } = context;
  const entry = {
    level,
    event,
    time: new Date().toISOString(),
    ...redact(rest),
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (event: string, context?: Context) => {
    if (process.env.NODE_ENV !== "production") write("debug", event, context);
  },
  info: (event: string, context?: Context) => write("info", event, context),
  warn: (event: string, context?: Context) => write("warn", event, context),
  error: (event: string, context?: Context) => write("error", event, context),
};
