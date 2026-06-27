import { describe, expect, it } from "vitest";
import { calculateReadinessScore } from "./scoring";
import type { VaultItem } from "./types";

const baseItem: VaultItem = {
  id: "item-1",
  name: "ThinkPad repair",
  category: "Laptop service",
  seller: "Central Notebook Care",
  purchaseDate: "2026-06-01",
  returnDeadline: "2026-07-10",
  warrantyDeadline: "2026-12-31",
  serialNumber: "PF-48291-ID",
  purchasePrice: 2450000,
  notes: "Keyboard replacement and fan cleaning.",
  claimStatus: "preparing",
  evidence: {
    receipt: true,
    warrantyTerms: true,
    serialNumberPhoto: true,
    paymentProof: true,
    sellerChat: true,
    productPhotos: true,
    issuePhotosOrVideos: true,
    serviceReport: true
  },
  issueTimeline: [
    {
      id: "event-1",
      date: "2026-06-19",
      type: "issue-found",
      description: "Fan noise returned after service."
    }
  ],
  createdAt: "2026-06-20T09:00:00.000Z",
  updatedAt: "2026-06-20T09:00:00.000Z"
};

describe("calculateReadinessScore", () => {
  it("returns a high score with a complete evidence set and safe deadlines", () => {
    const score = calculateReadinessScore(baseItem, new Date("2026-06-27T00:00:00.000Z"));

    expect(score.total).toBe(100);
    expect(score.factors).toEqual([
      expect.objectContaining({ key: "evidence", earned: 45, max: 45 }),
      expect.objectContaining({ key: "deadlines", earned: 25, max: 25 }),
      expect.objectContaining({ key: "identity", earned: 15, max: 15 }),
      expect.objectContaining({ key: "issueDocumentation", earned: 10, max: 10 }),
      expect.objectContaining({ key: "claimStatus", earned: 5, max: 5 })
    ]);
  });

  it("returns a low score for an incomplete item and explains the missing factors", () => {
    const item: VaultItem = {
      ...baseItem,
      serialNumber: "",
      returnDeadline: "2026-06-20",
      warrantyDeadline: "2026-06-26",
      claimStatus: "not-started",
      evidence: {
        receipt: false,
        warrantyTerms: false,
        serialNumberPhoto: false,
        paymentProof: false,
        sellerChat: false,
        productPhotos: false,
        issuePhotosOrVideos: false,
        serviceReport: false
      },
      issueTimeline: []
    };

    const score = calculateReadinessScore(item, new Date("2026-06-27T00:00:00.000Z"));

    expect(score.total).toBe(0);
    expect(score.factors.map((factor) => factor.reason).join(" ")).toContain("0 of 8 evidence items");
    expect(score.factors.map((factor) => factor.reason).join(" ")).toContain("expired");
  });

  it("missing receipt lowers only the evidence factor", () => {
    const withReceipt = calculateReadinessScore(baseItem, new Date("2026-06-27T00:00:00.000Z"));
    const withoutReceipt = calculateReadinessScore(
      {
        ...baseItem,
        evidence: {
          ...baseItem.evidence,
          receipt: false
        }
      },
      new Date("2026-06-27T00:00:00.000Z")
    );

    expect(withReceipt.total - withoutReceipt.total).toBe(6);
    expect(withoutReceipt.factors.find((factor) => factor.key === "evidence")?.earned).toBe(39);
  });

  it("claim status contributes only the 5 point claim status factor", () => {
    const preparing = calculateReadinessScore(baseItem, new Date("2026-06-27T00:00:00.000Z"));
    const notStarted = calculateReadinessScore(
      {
        ...baseItem,
        claimStatus: "not-started"
      },
      new Date("2026-06-27T00:00:00.000Z")
    );

    expect(preparing.total - notStarted.total).toBe(5);
    expect(notStarted.factors.find((factor) => factor.key === "claimStatus")?.earned).toBe(0);
  });
});
