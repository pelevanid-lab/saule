if (typeof process === 'undefined') {
  (globalThis as any).process = { env: {} };
} else if (!process.env) {
  (process as any).env = {};
}
