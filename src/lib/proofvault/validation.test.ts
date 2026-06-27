import { describe, expect, it } from "vitest";
import { validateVaultExport, validateVaultItem } from "./validation";
import type { VaultItem } from "./types";

const validItem: VaultItem = {
  id: "item-1",
  name: "Coffee grinder",
  category: "Kitchen",
  seller: "Pasar Baru Tools",
  purchaseDate: "2026-06-10",
  returnDeadline: "2026-06-25",
  warrantyDeadline: "2027-06-10",
  serialNumber: "CG-77821",
  purchasePrice: 640000,
  notes: "Box stored in cabinet.",
  claimStatus: "preparing",
  evidence: {
    receipt: true,
    warrantyTerms: true,
    serialNumberPhoto: true,
    paymentProof: true,
    sellerChat: false,
    productPhotos: true,
    issuePhotosOrVideos: false,
    serviceReport: false
  },
  issueTimeline: [],
  createdAt: "2026-06-20T09:00:00.000Z",
  updatedAt: "2026-06-20T09:00:00.000Z"
};

describe("validateVaultItem", () => {
  it("accepts a valid item", () => {
    expect(validateVaultItem(validItem).ok).toBe(true);
  });

  it("rejects missing required text and invalid dates", () => {
    const result = validateVaultItem({
      ...validItem,
      name: "",
      purchaseDate: "not-a-date",
      returnDeadline: "also-not-a-date"
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(["Item name is required.", "Purchase date must be a valid date."])
    );
  });

  it("rejects non-finite purchase prices", () => {
    const result = validateVaultItem({
      ...validItem,
      purchasePrice: Number.NaN
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Purchase price must be a finite number.");
  });
});

describe("validateVaultExport", () => {
  it("accepts a valid versioned export", () => {
    const result = validateVaultExport({
      schemaVersion: 1,
      exportedAt: "2026-06-27T00:00:00.000Z",
      items: [validItem]
    });

    expect(result.ok).toBe(true);
  });

  it("rejects unsupported schema versions", () => {
    const result = validateVaultExport({
      schemaVersion: 99,
      exportedAt: "2026-06-27T00:00:00.000Z",
      items: [validItem]
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Unsupported export schema version.");
  });
});
