import {
  EVIDENCE_SCHEMA_VERSION,
  evidenceStatuses,
  evidenceTypes,
  type EvidenceExport,
  type EvidenceItem,
  type ValidationResult
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (!value.trim()) {
    return true;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function validateEvidenceItem(value: unknown): ValidationResult<EvidenceItem> {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { ok: false, errors: ["Evidence item must be an object."] };
  }

  if (typeof value.id !== "string" || !value.id.trim()) {
    errors.push("Evidence id is required.");
  }

  if (typeof value.title !== "string" || !value.title.trim()) {
    errors.push("Title is required.");
  }

  if (typeof value.type !== "string" || !evidenceTypes.includes(value.type as never)) {
    errors.push("Evidence type is not supported.");
  }

  if (!isValidDateString(value.date)) {
    errors.push("Evidence date must be a valid date when provided.");
  }

  if (typeof value.source !== "string") {
    errors.push("Source or reference must be text.");
  }

  if (!isStringArray(value.tags)) {
    errors.push("Tags must be text values.");
  }

  if (typeof value.category !== "string") {
    errors.push("Category must be text.");
  }

  if (typeof value.context !== "string") {
    errors.push("Context must be text.");
  }

  if (typeof value.impact !== "string") {
    errors.push("Impact must be text.");
  }

  if (typeof value.verification !== "string") {
    errors.push("Verification notes must be text.");
  }

  if (typeof value.status !== "string" || !evidenceStatuses.includes(value.status as never)) {
    errors.push("Evidence status is not supported.");
  }

  if (typeof value.privateNotes !== "string") {
    errors.push("Private notes must be text.");
  }

  if (!isValidDateString(value.createdAt) || !String(value.createdAt ?? "").trim()) {
    errors.push("Created timestamp must be valid.");
  }

  if (!isValidDateString(value.updatedAt) || !String(value.updatedAt ?? "").trim()) {
    errors.push("Updated timestamp must be valid.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: value as EvidenceItem, errors: [] };
}

export function validateEvidenceExport(value: unknown): ValidationResult<EvidenceExport> {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { ok: false, errors: ["Export payload must be an object."] };
  }

  if (value.schemaVersion !== EVIDENCE_SCHEMA_VERSION) {
    errors.push("Unsupported export schema version.");
  }

  if (!isValidDateString(value.exportedAt) || !String(value.exportedAt ?? "").trim()) {
    errors.push("Export timestamp must be a valid date.");
  }

  if (!Array.isArray(value.items)) {
    errors.push("Export items must be an array.");
  } else {
    value.items.forEach((item, index) => {
      const result = validateEvidenceItem(item);
      if (!result.ok) {
        errors.push(`Item ${index + 1}: ${result.errors.join(" ")}`);
      }
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: value as EvidenceExport, errors: [] };
}
