import { daysUntil } from "./date";
import { evidenceKeys, type ReadinessWarning, type VaultItem } from "./types";

function countEvidence(item: VaultItem): number {
  return evidenceKeys.filter((key) => item.evidence[key]).length;
}

export function generateReadinessWarnings(item: VaultItem, now = new Date()): ReadinessWarning[] {
  const warnings: ReadinessWarning[] = [];
  const returnDays = daysUntil(item.returnDeadline, now);
  const warrantyDays = daysUntil(item.warrantyDeadline, now);
  const evidenceCount = countEvidence(item);

  if (!item.evidence.receipt) {
    warnings.push({
      code: "missing-receipt",
      severity: "critical",
      title: "Missing receipt or invoice",
      message: "The receipt or invoice checklist item is not marked as available."
    });
  }

  if (!item.serialNumber.trim() && !item.evidence.serialNumberPhoto) {
    warnings.push({
      code: "missing-serial-identity",
      severity: "warning",
      title: "Missing product identity proof",
      message: "No serial number or product identity photo is recorded for this item."
    });
  }

  if (returnDays !== null && returnDays < 0) {
    warnings.push({
      code: "return-window-expired",
      severity: "critical",
      title: "Return window expired",
      message: "The recorded return deadline is earlier than today."
    });
  } else if (returnDays !== null && returnDays <= 7) {
    warnings.push({
      code: "return-window-closing",
      severity: "warning",
      title: "Return window closing soon",
      message: `The recorded return deadline is within 7 days (${returnDays} day${returnDays === 1 ? "" : "s"} remaining).`
    });
  }

  if (warrantyDays !== null && warrantyDays < 0) {
    warnings.push({
      code: "warranty-expired",
      severity: "critical",
      title: "Warranty expired",
      message: "The recorded warranty deadline is earlier than today."
    });
  } else if (warrantyDays !== null && warrantyDays <= 30) {
    warnings.push({
      code: "warranty-window-closing",
      severity: "warning",
      title: "Warranty closing soon",
      message: `The recorded warranty deadline is within 30 days (${warrantyDays} day${warrantyDays === 1 ? "" : "s"} remaining).`
    });
  }

  if (evidenceCount < 3) {
    warnings.push({
      code: "weak-evidence-trail",
      severity: "warning",
      title: "Weak evidence trail",
      message: `${evidenceCount} of ${evidenceKeys.length} evidence checklist items are marked as available.`
    });
  }

  return warnings;
}
