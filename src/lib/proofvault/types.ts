export const VAULT_SCHEMA_VERSION = 1;

export type ClaimStatus =
  | "not-started"
  | "preparing"
  | "contacted-seller"
  | "submitted"
  | "in-review"
  | "resolved"
  | "rejected"
  | "abandoned";

export type EvidenceChecklist = {
  receipt: boolean;
  warrantyTerms: boolean;
  serialNumberPhoto: boolean;
  paymentProof: boolean;
  sellerChat: boolean;
  productPhotos: boolean;
  issuePhotosOrVideos: boolean;
  serviceReport: boolean;
};

export type IssueTimelineEntry = {
  id: string;
  date: string;
  type: "issue-found" | "seller-contacted" | "claim-submitted" | "status-update" | "resolution" | "note";
  description: string;
};

export type VaultItem = {
  id: string;
  name: string;
  category: string;
  seller: string;
  purchaseDate: string;
  returnDeadline: string;
  warrantyDeadline: string;
  serialNumber: string;
  purchasePrice: number | null;
  notes: string;
  claimStatus: ClaimStatus;
  evidence: EvidenceChecklist;
  issueTimeline: IssueTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ReadinessFactorKey =
  | "evidence"
  | "deadlines"
  | "identity"
  | "issueDocumentation"
  | "claimStatus";

export type ReadinessFactor = {
  key: ReadinessFactorKey;
  label: string;
  earned: number;
  max: number;
  reason: string;
};

export type ReadinessScore = {
  total: number;
  factors: ReadinessFactor[];
};

export type ReadinessWarning = {
  code:
    | "missing-receipt"
    | "missing-serial-identity"
    | "weak-evidence-trail"
    | "return-window-expired"
    | "return-window-closing"
    | "warranty-expired"
    | "warranty-window-closing";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
};

export type VaultExport = {
  schemaVersion: typeof VAULT_SCHEMA_VERSION;
  exportedAt: string;
  items: VaultItem[];
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

export const evidenceKeys: Array<keyof EvidenceChecklist> = [
  "receipt",
  "warrantyTerms",
  "serialNumberPhoto",
  "paymentProof",
  "sellerChat",
  "productPhotos",
  "issuePhotosOrVideos",
  "serviceReport"
];

export const claimStatuses: ClaimStatus[] = [
  "not-started",
  "preparing",
  "contacted-seller",
  "submitted",
  "in-review",
  "resolved",
  "rejected",
  "abandoned"
];
