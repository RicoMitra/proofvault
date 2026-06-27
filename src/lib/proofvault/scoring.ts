import { daysUntil } from "./date";
import { evidenceKeys, type ReadinessFactor, type ReadinessScore, type VaultItem } from "./types";

const SCORE_MAX = 100;

function clampScore(value: number): number {
  return Math.max(0, Math.min(SCORE_MAX, Math.round(value)));
}

function calculateEvidenceFactor(item: VaultItem): ReadinessFactor {
  const completed = evidenceKeys.filter((key) => item.evidence[key]).length;
  const earned = Math.round((completed / evidenceKeys.length) * 45);

  return {
    key: "evidence",
    label: "Evidence completeness",
    earned,
    max: 45,
    reason: `${completed} of ${evidenceKeys.length} evidence items are checked.`
  };
}

function deadlinePart(days: number | null, closingSoonDays: number, points: number): number {
  if (days === null) {
    return points;
  }

  if (days < 0) {
    return 0;
  }

  if (days <= closingSoonDays) {
    return Math.floor(points / 2);
  }

  return points;
}

function calculateDeadlineFactor(item: VaultItem, now: Date): ReadinessFactor {
  const returnDays = daysUntil(item.returnDeadline, now);
  const warrantyDays = daysUntil(item.warrantyDeadline, now);
  const returnPoints = deadlinePart(returnDays, 7, 12);
  const warrantyPoints = deadlinePart(warrantyDays, 30, 13);
  const reasons: string[] = [];

  if (returnDays !== null) {
    reasons.push(returnDays < 0 ? "return deadline is expired" : `return deadline is ${returnDays} days away`);
  } else {
    reasons.push("no return deadline is recorded");
  }

  if (warrantyDays !== null) {
    reasons.push(warrantyDays < 0 ? "warranty deadline is expired" : `warranty deadline is ${warrantyDays} days away`);
  } else {
    reasons.push("no warranty deadline is recorded");
  }

  return {
    key: "deadlines",
    label: "Deadline safety",
    earned: returnPoints + warrantyPoints,
    max: 25,
    reason: reasons.join("; ") + "."
  };
}

function calculateIdentityFactor(item: VaultItem): ReadinessFactor {
  const hasIdentity = item.serialNumber.trim().length > 0 || item.evidence.serialNumberPhoto;

  return {
    key: "identity",
    label: "Identity traceability",
    earned: hasIdentity ? 15 : 0,
    max: 15,
    reason: hasIdentity
      ? "Serial number or product identity evidence is recorded."
      : "No serial number or product identity evidence is recorded."
  };
}

function calculateIssueDocumentationFactor(item: VaultItem): ReadinessFactor {
  const hasIssueEvidence =
    item.issueTimeline.length > 0 || item.evidence.issuePhotosOrVideos || item.evidence.serviceReport;

  return {
    key: "issueDocumentation",
    label: "Issue documentation",
    earned: hasIssueEvidence ? 10 : 0,
    max: 10,
    reason: hasIssueEvidence
      ? "Issue history or issue evidence is recorded."
      : "No issue timeline, issue media, or service report is recorded."
  };
}

function calculateClaimStatusFactor(item: VaultItem): ReadinessFactor {
  const hasClaimStatus = item.claimStatus !== "not-started";

  return {
    key: "claimStatus",
    label: "Claim status clarity",
    earned: hasClaimStatus ? 5 : 0,
    max: 5,
    reason: hasClaimStatus ? `Claim status is set to ${item.claimStatus}.` : "Claim status is not started."
  };
}

export function calculateReadinessScore(item: VaultItem, now = new Date()): ReadinessScore {
  const factors = [
    calculateEvidenceFactor(item),
    calculateDeadlineFactor(item, now),
    calculateIdentityFactor(item),
    calculateIssueDocumentationFactor(item),
    calculateClaimStatusFactor(item)
  ];

  return {
    total: clampScore(factors.reduce((sum, factor) => sum + factor.earned, 0)),
    factors
  };
}
