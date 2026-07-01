export const EVIDENCE_SCHEMA_VERSION = 1;

export type EvidenceType =
  | "Project"
  | "GitHub Repo"
  | "Certificate"
  | "Screenshot Progress"
  | "Achievement"
  | "Work Result"
  | "Testimonial"
  | "Document"
  | "Receipt/Transaction Proof"
  | "Other";

export type EvidenceStatus = "draft" | "reviewing" | "ready" | "archived";

export type EvidenceItem = {
  id: string;
  title: string;
  type: EvidenceType;
  date: string;
  source: string;
  tags: string[];
  category: string;
  context: string;
  impact: string;
  verification: string;
  status: EvidenceStatus;
  privateNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type CredibilityFactorKey =
  | "sourceClarity"
  | "contextCompleteness"
  | "impactSpecificity"
  | "verificationStrength"
  | "exportReadiness";

export type CredibilityFactor = {
  key: CredibilityFactorKey;
  label: string;
  earned: number;
  max: number;
  reason: string;
};

export type CredibilityScore = {
  total: number;
  factors: CredibilityFactor[];
};

export type EvidenceExport = {
  schemaVersion: typeof EVIDENCE_SCHEMA_VERSION;
  exportedAt: string;
  items: EvidenceItem[];
};

export type ValidationResult<T> =
  | {
      ok: true;
      value: T;
      errors: [];
    }
  | {
      ok: false;
      value?: undefined;
      errors: string[];
    };

export const evidenceTypes: EvidenceType[] = [
  "Project",
  "GitHub Repo",
  "Certificate",
  "Screenshot Progress",
  "Achievement",
  "Work Result",
  "Testimonial",
  "Document",
  "Receipt/Transaction Proof",
  "Other"
];

export const evidenceStatuses: EvidenceStatus[] = ["draft", "reviewing", "ready", "archived"];
