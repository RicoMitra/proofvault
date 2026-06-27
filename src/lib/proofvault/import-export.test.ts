import { describe, expect, it } from "vitest";
import { createVaultExport, parseVaultExportJson, serializeVaultExport } from "./import-export";
import type { VaultItem } from "./types";

const item: VaultItem = {
  id: "item-1",
  name: "Desk chair",
  category: "Furniture",
  seller: "Ruang Kerja Supply",
  purchaseDate: "2026-06-10",
  returnDeadline: "2026-06-24",
  warrantyDeadline: "2027-06-10",
  serialNumber: "DC-1827",
  purchasePrice: 1325000,
  notes: "Gas lift warranty card stored in folder.",
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

describe("import-export", () => {
  it("creates a versioned export payload", () => {
    const payload = createVaultExport([item], new Date("2026-06-27T10:30:00.000Z"));

    expect(payload).toEqual({
      schemaVersion: 1,
      exportedAt: "2026-06-27T10:30:00.000Z",
      items: [item]
    });
  });

  it("serializes and parses a valid export", () => {
    const json = serializeVaultExport([item], new Date("2026-06-27T10:30:00.000Z"));
    const result = parseVaultExportJson(json);

    expect(result.ok).toBe(true);
    expect(result.value?.items).toHaveLength(1);
    expect(result.value?.items[0]?.name).toBe("Desk chair");
  });

  it("rejects malformed JSON", () => {
    const result = parseVaultExportJson("{not json");

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Backup file must contain valid JSON.");
  });

  it("rejects unsupported schema versions", () => {
    const result = parseVaultExportJson(
      JSON.stringify({
        schemaVersion: 2,
        exportedAt: "2026-06-27T10:30:00.000Z",
        items: [item]
      })
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Unsupported export schema version.");
  });
});
