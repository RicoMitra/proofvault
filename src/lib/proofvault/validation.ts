import {
  claimStatuses,
  evidenceKeys,
  VAULT_SCHEMA_VERSION,
  type EvidenceChecklist,
  type IssueTimelineEntry,
  type ValidationResult,
  type VaultExport,
  type VaultItem
} from "./types";
import { isValidDateString } from "./date";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceChecklist(value: unknown): value is EvidenceChecklist {
  return isRecord(value) && evidenceKeys.every((key) => typeof value[key] === "boolean");
}

function isTimelineEntry(value: unknown): value is IssueTimelineEntry {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.date === "string" &&
    isValidDateString(value.date) &&
    typeof value.type === "string" &&
    typeof value.description === "string"
  );
}

export function validateVaultItem(value: unknown): ValidationResult<VaultItem> {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { ok: false, errors: ["Item must be an object."] };
  }

  if (typeof value.id !== "string" || !value.id.trim()) {
    errors.push("Item id is required.");
  }

  if (typeof value.name !== "string" || !value.name.trim()) {
    errors.push("Item name is required.");
  }

  if (typeof value.category !== "string") {
    errors.push("Category must be text.");
  }

  if (typeof value.seller !== "string" || !value.seller.trim()) {
    errors.push("Seller is required.");
  }

  if (!isValidDateString(value.purchaseDate) || !String(value.purchaseDate ?? "").trim()) {
    errors.push("Purchase date must be a valid date.");
  }

  if (!isValidDateString(value.returnDeadline)) {
    errors.push("Return deadline must be a valid date when provided.");
  }

  if (!isValidDateString(value.warrantyDeadline)) {
    errors.push("Warranty deadline must be a valid date when provided.");
  }

  if (typeof value.serialNumber !== "string") {
    errors.push("Serial number must be text.");
  }

  if (value.purchasePrice !== null && typeof value.purchasePrice !== "number") {
    errors.push("Purchase price must be a finite number.");
  }

  if (typeof value.purchasePrice === "number" && !Number.isFinite(value.purchasePrice)) {
    errors.push("Purchase price must be a finite number.");
  }

  if (typeof value.notes !== "string") {
    errors.push("Notes must be text.");
  }

  if (typeof value.claimStatus !== "string" || !claimStatuses.includes(value.claimStatus as never)) {
    errors.push("Claim status is not supported.");
  }

  if (!isEvidenceChecklist(value.evidence)) {
    errors.push("Evidence checklist is invalid.");
  }

  if (!Array.isArray(value.issueTimeline) || !value.issueTimeline.every(isTimelineEntry)) {
    errors.push("Issue timeline is invalid.");
  }

  if (!isValidDateString(value.createdAt)) {
    errors.push("Created timestamp must be valid.");
  }

  if (!isValidDateString(value.updatedAt)) {
    errors.push("Updated timestamp must be valid.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: value as VaultItem, errors: [] };
}

export function validateVaultExport(value: unknown): ValidationResult<VaultExport> {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { ok: false, errors: ["Export payload must be an object."] };
  }

  if (value.schemaVersion !== VAULT_SCHEMA_VERSION) {
    errors.push("Unsupported export schema version.");
  }

  if (typeof value.exportedAt !== "string" || !isValidDateString(value.exportedAt)) {
    errors.push("Export timestamp must be a valid date.");
  }

  if (!Array.isArray(value.items)) {
    errors.push("Export items must be an array.");
  } else {
    value.items.forEach((item, index) => {
      const result = validateVaultItem(item);
      if (!result.ok) {
        errors.push(`Item ${index + 1}: ${result.errors.join(" ")}`);
      }
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: value as VaultExport, errors: [] };
}
