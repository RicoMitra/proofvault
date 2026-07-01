import { validateEvidenceExport } from "./validation";
import { EVIDENCE_SCHEMA_VERSION, type EvidenceExport, type EvidenceItem, type ValidationResult } from "./types";

export function createEvidenceExport(items: EvidenceItem[], now = new Date()): EvidenceExport {
  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    items
  };
}

export function serializeEvidenceExport(items: EvidenceItem[], now = new Date()): string {
  return JSON.stringify(createEvidenceExport(items, now), null, 2);
}

export function parseEvidenceExportJson(json: string): ValidationResult<EvidenceExport> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, errors: ["Backup file must contain valid JSON."] };
  }

  return validateEvidenceExport(parsed);
}

function publicLines(item: EvidenceItem): string[] {
  return [
    `Type: ${item.type}`,
    item.date ? `Date: ${item.date}` : "",
    item.category ? `Category: ${item.category}` : "",
    item.tags.length ? `Tags: ${item.tags.join(", ")}` : "",
    item.source ? `Source: ${item.source}` : "",
    item.context ? `Context: ${item.context}` : "",
    item.impact ? `Impact: ${item.impact}` : "",
    item.verification ? `Verification: ${item.verification}` : ""
  ].filter(Boolean);
}

export function formatAsMarkdown(item: EvidenceItem): string {
  return [`# ${item.title}`, "", ...publicLines(item)].join("\n");
}

export function formatAsGithubReadme(items: EvidenceItem[]): string {
  const sections = items.map((item) => [`## ${item.title}`, "", ...publicLines(item)].join("\n"));
  return ["# Career Evidence", "", ...sections].join("\n\n");
}

export function formatAsResumeBullet(item: EvidenceItem): string {
  const context = item.context.trim();
  const impact = item.impact.trim();
  return `- ${context || item.title}${impact ? `; ${impact.charAt(0).toLowerCase()}${impact.slice(1)}` : "."}`;
}

export function formatAsCaseStudy(items: EvidenceItem[]): string {
  const selected = items.length ? items : [];
  return [
    "## Portfolio Case Study",
    "",
    "### Evidence Used",
    selected.map((item) => `- ${item.title} (${item.type})`).join("\n") || "- No evidence selected.",
    "",
    "### Context",
    selected.map((item) => item.context).filter(Boolean).join("\n\n") || "Add context before publishing.",
    "",
    "### Impact",
    selected.map((item) => item.impact).filter(Boolean).join("\n\n") || "Add impact before publishing.",
    "",
    "### Verification",
    selected.map((item) => item.verification).filter(Boolean).join("\n\n") || "Add verification notes before publishing."
  ].join("\n");
}
