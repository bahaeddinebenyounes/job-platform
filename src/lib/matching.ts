function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * PLACEHOLDER scorer: share of the candidate's skills found in the job text.
 * Returns a value between 0 and 1.
 * Replace this function with the ML model later.
 */
export function computeMatchScore(skillNames: string[], jobText: string): number {
  if (skillNames.length === 0) return 0;

  const text = jobText.toLowerCase();
  let matched = 0;

  for (const name of skillNames) {
    // Boundary check that also works for names like "C++" or "Node.js"
    const pattern = new RegExp(
      `(?<![a-z0-9])${escapeRegex(name.toLowerCase())}(?![a-z0-9])`
    );
    if (pattern.test(text)) matched++;
  }

  return matched / skillNames.length;
}