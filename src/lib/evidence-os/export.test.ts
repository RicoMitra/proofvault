import { describe, expect, it } from "vitest";
import {
  createEvidenceExport,
  formatAsCaseStudy,
  formatAsGithubReadme,
  formatAsMarkdown,
  formatAsResumeBullet,
  parseEvidenceExportJson,
  serializeEvidenceExport
} from "./export";
import type { EvidenceItem } from "./types";

const item: EvidenceItem = {
  id: "evidence-1",
  title: "Evidence OS rebuild",
  type: "Project",
  date: "2026-07-01",
  source: "https://github.com/RicoMitra/proofvault",
  tags: ["career", "local-first"],
  category: "Product Engineering",
  context: "Reworked ProofVault into a manual-first career evidence system.",
  impact: "Created export-ready material for README, resume bullets, and portfolio stories.",
  verification: "GitHub repository and Vercel deployment are available.",
  status: "ready",
  privateNotes: "Keep private notes out of public exports.",
  createdAt: "2026-07-01T09:00:00.000Z",
  updatedAt: "2026-07-01T09:00:00.000Z"
};

describe("Evidence OS exports", () => {
  it("creates and parses a versioned local backup", () => {
    const json = serializeEvidenceExport([item], new Date("2026-07-01T10:00:00.000Z"));
    const result = parseEvidenceExportJson(json);

    expect(createEvidenceExport([item], new Date("2026-07-01T10:00:00.000Z")).schemaVersion).toBe(1);
    expect(result.ok).toBe(true);
    expect(result.value?.items).toHaveLength(1);
  });

  it("builds public Markdown without private notes", () => {
    expect(formatAsMarkdown(item)).toContain("# Evidence OS rebuild");
    expect(formatAsMarkdown(item)).not.toContain("Keep private notes");
    expect(formatAsGithubReadme([item])).toContain("## Evidence OS rebuild");
    expect(formatAsResumeBullet(item)).toContain("Reworked ProofVault");
    expect(formatAsCaseStudy([item])).toContain("## Portfolio Case Study");
  });
});
