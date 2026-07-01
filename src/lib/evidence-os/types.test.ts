import { describe, expect, it } from "vitest";
import { validateEvidenceItem } from "./validation";
import type { EvidenceItem } from "./types";

const item: EvidenceItem = {
  id: "evidence-1",
  title: "Codex dashboard launch",
  type: "Project",
  date: "2026-06-24",
  source: "https://github.com/RicoMitra/proofvault",
  tags: ["nextjs", "portfolio"],
  category: "Frontend Engineering",
  context: "Built a local-first dashboard for career evidence review.",
  impact: "Reduced portfolio write-up time from scattered notes to one exportable case study.",
  verification: "GitHub repository, tests, and Vercel deployment are available.",
  status: "ready",
  privateNotes: "Use for README refresh.",
  createdAt: "2026-06-24T09:00:00.000Z",
  updatedAt: "2026-06-24T09:00:00.000Z"
};

describe("Evidence OS validation", () => {
  it("accepts a complete manual-first evidence item", () => {
    expect(validateEvidenceItem(item)).toEqual({ ok: true, value: item, errors: [] });
  });

  it("rejects unsupported evidence types and malformed tags", () => {
    const result = validateEvidenceItem({
      ...item,
      type: "Auto Detected",
      tags: ["valid", 12]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Evidence type is not supported.");
    expect(result.errors).toContain("Tags must be text values.");
  });
});
