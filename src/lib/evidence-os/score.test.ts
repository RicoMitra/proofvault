import { describe, expect, it } from "vitest";
import { calculateCredibilityScore } from "./score";
import type { EvidenceItem } from "./types";

const baseItem: EvidenceItem = {
  id: "evidence-1",
  title: "Portfolio case study shipped",
  type: "Project",
  date: "2026-06-24",
  source: "https://github.com/RicoMitra/proofvault",
  tags: ["nextjs", "testing", "deployment"],
  category: "Frontend Engineering",
  context: "Created a browser-first evidence workflow with local persistence and exports.",
  impact: "Turned rough proof into README, resume, and case-study material in one dashboard.",
  verification: "Repository, passing tests, and Vercel deployment are linked.",
  status: "ready",
  privateNotes: "",
  createdAt: "2026-06-24T09:00:00.000Z",
  updatedAt: "2026-06-24T09:00:00.000Z"
};

describe("calculateCredibilityScore", () => {
  it("returns 100 for evidence with source, context, impact, verification, and ready status", () => {
    const score = calculateCredibilityScore(baseItem);

    expect(score.total).toBe(100);
    expect(score.factors).toEqual([
      expect.objectContaining({ key: "sourceClarity", earned: 20, max: 20 }),
      expect.objectContaining({ key: "contextCompleteness", earned: 25, max: 25 }),
      expect.objectContaining({ key: "impactSpecificity", earned: 25, max: 25 }),
      expect.objectContaining({ key: "verificationStrength", earned: 20, max: 20 }),
      expect.objectContaining({ key: "exportReadiness", earned: 10, max: 10 })
    ]);
  });

  it("keeps incomplete evidence deterministic and transparent", () => {
    const score = calculateCredibilityScore({
      ...baseItem,
      source: "",
      tags: [],
      context: "",
      impact: "",
      verification: "",
      status: "draft"
    });

    expect(score.total).toBe(0);
    expect(score.factors.map((factor) => factor.reason).join(" ")).toContain("No source or reference is recorded.");
    expect(score.factors.map((factor) => factor.reason).join(" ")).toContain("No impact statement is recorded.");
  });
});
