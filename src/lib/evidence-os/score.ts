import type { CredibilityFactor, CredibilityScore, EvidenceItem } from "./types";

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function hasUsefulText(value: string, minimumWords: number): boolean {
  return value.trim().split(/\s+/).filter(Boolean).length >= minimumWords;
}

function factor(key: CredibilityFactor["key"], label: string, earned: number, max: number, reason: string): CredibilityFactor {
  return { key, label, earned, max, reason };
}

export function calculateCredibilityScore(item: EvidenceItem): CredibilityScore {
  const sourceClarity = hasText(item.source)
    ? factor("sourceClarity", "Source clarity", 20, 20, "A source, link, or reference is recorded.")
    : factor("sourceClarity", "Source clarity", 0, 20, "No source or reference is recorded.");

  const contextReady = hasUsefulText(item.context, 6) && hasText(item.category) && item.tags.length > 0;
  const contextCompleteness = contextReady
    ? factor("contextCompleteness", "Context completeness", 25, 25, "Context, category, and tags explain where this evidence belongs.")
    : factor("contextCompleteness", "Context completeness", 0, 25, "Context needs a category, tags, and a short explanation.");

  const impactSpecificity = hasUsefulText(item.impact, 6)
    ? factor("impactSpecificity", "Impact specificity", 25, 25, "Impact is described in a reusable career statement.")
    : factor("impactSpecificity", "Impact specificity", 0, 25, "No impact statement is recorded.");

  const verificationStrength = hasUsefulText(item.verification, 5)
    ? factor("verificationStrength", "Verification strength", 20, 20, "Verification notes explain why the evidence is credible.")
    : factor("verificationStrength", "Verification strength", 0, 20, "Verification notes are missing or too thin.");

  const exportReadiness = item.status === "ready"
    ? factor("exportReadiness", "Export readiness", 10, 10, "Status is ready for public portfolio material.")
    : factor("exportReadiness", "Export readiness", 0, 10, `Status is ${item.status}, so review is still needed.`);

  const factors = [sourceClarity, contextCompleteness, impactSpecificity, verificationStrength, exportReadiness];
  const total = factors.reduce((sum, current) => sum + current.earned, 0);

  return { total, factors };
}
