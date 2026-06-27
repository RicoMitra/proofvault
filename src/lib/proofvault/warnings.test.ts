import { describe, expect, it } from "vitest";
import { generateReadinessWarnings } from "./warnings";
import type { VaultItem } from "./types";

const item: VaultItem = {
  id: "item-1",
  name: "Air purifier",
  category: "Home appliance",
  seller: "Kirana Home Supply",
  purchaseDate: "2026-06-01",
  returnDeadline: "2026-06-30",
  warrantyDeadline: "2026-07-20",
  serialNumber: "",
  purchasePrice: 980000,
  notes: "",
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
  issueTimeline: [],
  createdAt: "2026-06-20T09:00:00.000Z",
  updatedAt: "2026-06-20T09:00:00.000Z"
};

describe("generateReadinessWarnings", () => {
  it("flags missing receipt, missing serial identity, weak evidence, and closing deadlines", () => {
    const warnings = generateReadinessWarnings(item, new Date("2026-06-27T00:00:00.000Z"));

    expect(warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        "missing-receipt",
        "missing-serial-identity",
        "weak-evidence-trail",
        "return-window-closing",
        "warranty-window-closing"
      ])
    );
    expect(warnings.find((warning) => warning.code === "return-window-closing")?.message).toContain("within 7 days");
    expect(warnings.find((warning) => warning.code === "warranty-window-closing")?.message).toContain("within 30 days");
  });

  it("flags expired return and warranty deadlines", () => {
    const warnings = generateReadinessWarnings(
      {
        ...item,
        returnDeadline: "2026-06-01",
        warrantyDeadline: "2026-06-02"
      },
      new Date("2026-06-27T00:00:00.000Z")
    );

    expect(warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining(["return-window-expired", "warranty-expired"])
    );
  });
});
