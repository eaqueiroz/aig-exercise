export function logInfo(message: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level: 'info', message, ...extra }));
}

export function logError(message: string, extra: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ level: 'error', message, ...extra }));
}