import { MAX_TOP_TOKENS } from '../shared/constants.js';

export function processText(content: string) {
  const normalized = content.toLowerCase();
  const tokens = normalized.match(/\b[\w']+\b/g) ?? [];

  const frequencies = new Map<string, number>();

  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }

  const topTokens = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TOP_TOKENS)
    .map(([token, count]) => ({ token, count }));

  return {
    wordCount: tokens.length,
    uniqueWordCount: frequencies.size,
    topTokens
  };
}