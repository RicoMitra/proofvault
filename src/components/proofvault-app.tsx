"use client";

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileJson,
  ShieldCheck,
  Trash2,
  Upload
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { serializeVaultExport, parseVaultExportJson } from "@/lib/proofvault/import-export";
import { calculateReadinessScore } from "@/lib/proofvault/scoring";
import {
  clearVault,
  deleteVaultItem,
  listVaultItems,
  replaceAllVaultItems,
  saveVaultItem
} from "@/lib/proofvault/storage";
import { evidenceKeys, type ClaimStatus, type EvidenceChecklist, type VaultItem } from "@/lib/proofvault/types";
import { validateVaultItem } from "@/lib/proofvault/validation";
import { generateReadinessWarnings } from "@/lib/proofvault/warnings";
import { cn } from "@/lib/utils";

export type ProofVaultStorageApi = {
  list: () => Promise<VaultItem[]>;
  save: (item: VaultItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  replaceAll: (items: VaultItem[]) => Promise<void>;
  clear: () => Promise<void>;
};

type ProofVaultAppProps = {
  storageApi?: ProofVaultStorageApi;
  now?: Date;
};

type FormState = {
  name: string;
  category: string;
  seller: string;
  purchaseDate: string;
  returnDeadline: string;
  warrantyDeadline: string;
  serialNumber: string;
  purchasePrice: string;
  notes: string;
  claimStatus: ClaimStatus;
  issueDate: string;
  issueDescription: string;
  evidence: EvidenceChecklist;
};

const defaultStorageApi: ProofVaultStorageApi = {
  list: listVaultItems,
  save: saveVaultItem,
  remove: deleteVaultItem,
  replaceAll: replaceAllVaultItems,
  clear: clearVault
};

const evidenceLabels: Record<keyof EvidenceChecklist, string> = {
  receipt: "Receipt or invoice",
  warrantyTerms: "Warranty terms or card",
  serialNumberPhoto: "Serial number or product identity photo recorded",
  paymentProof: "Payment proof",
  sellerChat: "Seller chat",
  productPhotos: "Product photos",
  issuePhotosOrVideos: "Issue photos or videos",
  serviceReport: "Service report"
};

const emptyEvidence: EvidenceChecklist = {
  receipt: false,
  warrantyTerms: false,
  serialNumberPhoto: false,
  paymentProof: false,
  sellerChat: false,
  productPhotos: false,
  issuePhotosOrVideos: false,
  serviceReport: false
};

const emptyForm: FormState = {
  name: "",
  category: "",
  seller: "",
  purchaseDate: "",
  returnDeadline: "",
  warrantyDeadline: "",
  serialNumber: "",
  purchasePrice: "",
  notes: "",
  claimStatus: "not-started",
  issueDate: "",
  issueDescription: "",
  evidence: emptyEvidence
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}`;
}

function createItemFromForm(form: FormState, existing?: VaultItem): VaultItem {
  const now = new Date().toISOString();
  const issueTimeline =
    form.issueDescription.trim() && form.issueDate.trim()
      ? [
          {
            id: existing?.issueTimeline[0]?.id ?? createId(),
            date: form.issueDate,
            type: "issue-found" as const,
            description: form.issueDescription.trim()
          }
        ]
      : [];

  return {
    id: existing?.id ?? createId(),
    name: form.name.trim(),
    category: form.category.trim(),
    seller: form.seller.trim(),
    purchaseDate: form.purchaseDate,
    returnDeadline: form.returnDeadline,
    warrantyDeadline: form.warrantyDeadline,
    serialNumber: form.serialNumber.trim(),
    purchasePrice: form.purchasePrice.trim() ? Number(form.purchasePrice) : null,
    notes: form.notes.trim(),
    claimStatus: form.claimStatus,
    evidence: form.evidence,
    issueTimeline,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

function formFromItem(item: VaultItem): FormState {
  return {
    name: item.name,
    category: item.category,
    seller: item.seller,
    purchaseDate: item.purchaseDate,
    returnDeadline: item.returnDeadline,
    warrantyDeadline: item.warrantyDeadline,
    serialNumber: item.serialNumber,
    purchasePrice: item.purchasePrice === null ? "" : String(item.purchasePrice),
    notes: item.notes,
    claimStatus: item.claimStatus,
    issueDate: item.issueTimeline[0]?.date ?? "",
    issueDescription: item.issueTimeline[0]?.description ?? "",
    evidence: item.evidence
  };
}

function scoreTone(score: number) {
  if (score >= 80) {
    return "text-[var(--success)]";
  }

  if (score >= 50) {
    return "text-[var(--warning)]";
  }

  return "text-[var(--danger)]";
}

export function ProofVaultApp({ storageApi = defaultStorageApi, now = new Date() }: ProofVaultAppProps) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedId, setSelectedId] = useState<string>("");
  const [editingId, setEditingId] = useState<string>("");
  const [message, setMessage] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    storageApi.list().then((storedItems) => {
      if (mounted) {
        setItems(storedItems);
        setSelectedId(storedItems[0]?.id ?? "");
      }
    });

    return () => {
      mounted = false;
    };
  }, [storageApi]);

  const enrichedItems = useMemo(
    () =>
      items.map((item) => ({
        item,
        score: calculateReadinessScore(item, now),
        warnings: generateReadinessWarnings(item, now)
      })),
    [items, now]
  );

  const selected = enrichedItems.find(({ item }) => item.id === selectedId) ?? enrichedItems[0];
  const averageScore =
    enrichedItems.length === 0
      ? 0
      : Math.round(enrichedItems.reduce((sum, entry) => sum + entry.score.total, 0) / enrichedItems.length);
  const attentionCount = enrichedItems.filter((entry) => entry.warnings.length > 0 || entry.score.total < 70).length;
  const upcomingDeadlineCount = enrichedItems.filter((entry) =>
    entry.warnings.some((warning) => warning.code === "return-window-closing" || warning.code === "warranty-window-closing")
  ).length;

  async function reload(nextSelectedId?: string) {
    const storedItems = await storageApi.list();
    setItems(storedItems);
    setSelectedId(nextSelectedId ?? storedItems[0]?.id ?? "");
  }

  async function handleSave() {
    const existing = items.find((item) => item.id === editingId);
    const item = createItemFromForm(form, existing);
    const validation = validateVaultItem(item);

    if (!validation.ok) {
      setMessage(validation.errors.join(" "));
      return;
    }

    await storageApi.save(validation.value);
    setForm(emptyForm);
    setEditingId("");
    setMessage("Item saved locally.");
    await reload(validation.value.id);
  }

  async function handleEvidenceToggle(item: VaultItem, key: keyof EvidenceChecklist) {
    const updated = {
      ...item,
      evidence: {
        ...item.evidence,
        [key]: !item.evidence[key]
      },
      updatedAt: new Date().toISOString()
    };
    await storageApi.save(updated);
    await reload(updated.id);
  }

  async function handleDelete(id: string) {
    await storageApi.remove(id);
    setMessage("Item removed from this browser.");
    await reload();
  }

  async function handleReset() {
    await storageApi.clear();
    setItems([]);
    setSelectedId("");
    setEditingId("");
    setForm(emptyForm);
    setMessage("Local vault reset.");
  }

  function handleEdit(item: VaultItem) {
    setEditingId(item.id);
    setForm(formFromItem(item));
    setMessage(`Editing ${item.name}.`);
  }

  function handleExport() {
    const json = serializeVaultExport(items);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `proofvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("JSON backup exported from local data.");
  }

  async function handleImport(file: File | undefined) {
    if (!file) {
      return;
    }

    const text = await file.text();
    const result = parseVaultExportJson(text);
    if (!result.ok) {
      setMessage(result.errors.join(" "));
      return;
    }

    await storageApi.replaceAll(result.value.items);
    setMessage("JSON backup imported into this browser.");
    await reload(result.value.items[0]?.id);
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
      <header className="grid gap-6 border-b border-[var(--border)] pb-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-sm text-[var(--accent-strong)]">
            <ShieldCheck aria-hidden="true" size={16} />
            Local-first evidence readiness
          </div>
          <h1 className="max-w-[12ch] text-4xl font-semibold tracking-tight md:text-6xl">ProofVault</h1>
          <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-[var(--muted)]">
            Track the proof behind purchases and services before a return, warranty claim, repair request, or seller
            complaint becomes urgent. This tool stores data in your browser and gives descriptive readiness signals only.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
          <Metric label="Items" value={items.length} icon={<Archive aria-hidden="true" size={18} />} />
          <Metric label="Avg score" value={averageScore} icon={<ClipboardCheck aria-hidden="true" size={18} />} />
          <Metric label="Needs attention" value={attentionCount} icon={<AlertTriangle aria-hidden="true" size={18} />} />
          <Metric label="Upcoming" value={upcomingDeadlineCount} icon={<CheckCircle2 aria-hidden="true" size={18} />} />
        </div>
      </header>

      <section className="grid gap-6 py-8 lg:grid-cols-[390px_minmax(0,1fr)]">
        <form
          className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{editingId ? "Edit vault item" : "Add vault item"}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Checklist evidence first. Files are out of MVP scope.</p>
            </div>
            {editingId ? (
              <button
                className="rounded-md border border-[var(--border)] px-3 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
                type="button"
                onClick={() => {
                  setEditingId("");
                  setForm(emptyForm);
                }}
              >
                New
              </button>
            ) : null}
          </div>

          <div className="grid gap-4">
            <TextField label="Item or service name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <TextField label="Seller" value={form.seller} onChange={(value) => setForm({ ...form, seller: value })} required />
            <TextField label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Purchase date" type="date" value={form.purchaseDate} onChange={(value) => setForm({ ...form, purchaseDate: value })} required />
              <TextField label="Purchase price" type="number" value={form.purchasePrice} onChange={(value) => setForm({ ...form, purchasePrice: value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Return deadline" type="date" value={form.returnDeadline} onChange={(value) => setForm({ ...form, returnDeadline: value })} />
              <TextField label="Warranty deadline" type="date" value={form.warrantyDeadline} onChange={(value) => setForm({ ...form, warrantyDeadline: value })} />
            </div>
            <TextField label="Serial number" value={form.serialNumber} onChange={(value) => setForm({ ...form, serialNumber: value })} />
            <label className="grid gap-2 text-sm font-medium text-[var(--fg)]">
              Claim status
              <select
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[var(--fg)]"
                value={form.claimStatus}
                onChange={(event) => setForm({ ...form, claimStatus: event.target.value as ClaimStatus })}
              >
                <option value="not-started">Not started</option>
                <option value="preparing">Preparing</option>
                <option value="contacted-seller">Contacted seller</option>
                <option value="submitted">Submitted</option>
                <option value="in-review">In review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </label>
            <fieldset className="grid gap-3 rounded-md border border-[var(--border)] p-4" data-testid="form-evidence">
              <legend className="px-1 text-sm font-semibold text-[var(--accent-strong)]">Evidence checklist</legend>
              {evidenceKeys.map((key) => (
                <label key={key} className="flex min-h-11 items-center gap-3 text-sm text-[var(--fg)]">
                  <input
                    className="size-4 accent-[var(--accent)]"
                    type="checkbox"
                    checked={form.evidence[key]}
                    onChange={() =>
                      setForm({
                        ...form,
                        evidence: { ...form.evidence, [key]: !form.evidence[key] }
                      })
                    }
                  />
                  {evidenceLabels[key]}
                </label>
              ))}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <TextField label="Issue date" type="date" value={form.issueDate} onChange={(value) => setForm({ ...form, issueDate: value })} />
              <TextField
                label="Issue timeline note"
                value={form.issueDescription}
                onChange={(value) => setForm({ ...form, issueDescription: value })}
              />
            </div>
            <label className="grid gap-2 text-sm font-medium text-[var(--fg)]">
              Notes
              <textarea
                className="min-h-24 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-[var(--fg)]"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </label>
            <button className="rounded-md bg-[var(--accent)] px-4 font-semibold text-slate-950 transition hover:bg-[var(--accent-strong)]" type="submit">
              Save item
            </button>
          </div>
        </form>

        <div className="grid gap-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Claim readiness dashboard</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Scores are deterministic and describe evidence readiness only.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm text-[var(--fg)] transition hover:border-[var(--accent)]"
                  type="button"
                  onClick={handleExport}
                >
                  <Download aria-hidden="true" size={16} />
                  Export JSON
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm text-[var(--fg)] transition hover:border-[var(--accent)]"
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload aria-hidden="true" size={16} />
                  Import JSON
                </button>
                <input
                  ref={importInputRef}
                  className="sr-only"
                  type="file"
                  accept="application/json"
                  onChange={(event) => void handleImport(event.target.files?.[0])}
                />
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--danger)] px-3 text-sm text-[var(--fg)] transition hover:bg-[var(--danger)]/15"
                  type="button"
                  onClick={() => void handleReset()}
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Reset vault
                </button>
              </div>
            </div>
            {message ? (
              <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--muted)]" role="status">
                {message}
              </p>
            ) : null}

            <div className="mt-6 divide-y divide-[var(--border)]">
              {enrichedItems.length === 0 ? (
                <div className="py-10 text-center">
                  <FileJson aria-hidden="true" className="mx-auto mb-3 text-[var(--accent-strong)]" size={32} />
                  <h3 className="text-lg font-semibold">No vault items yet</h3>
                  <p className="mx-auto mt-2 max-w-[48ch] text-sm text-[var(--muted)]">
                    Add a purchase or service record to start tracking readiness, deadlines, and missing evidence.
                  </p>
                </div>
              ) : (
                enrichedItems.map(({ item, score, warnings }) => (
                  <article key={item.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                    <button
                      className="min-h-0 text-left"
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                    >
                      <h3 className="text-base font-semibold">{item.name}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.seller} · {item.purchaseDate || "No purchase date"}
                      </p>
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn("font-mono text-2xl font-semibold tabular-nums", scoreTone(score.total))}>{score.total}</span>
                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                        {warnings.length} warning{warnings.length === 1 ? "" : "s"}
                      </span>
                      <button className="rounded-md border border-[var(--border)] px-3 text-sm" type="button" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="rounded-md border border-[var(--danger)] px-3 text-sm" type="button" onClick={() => void handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {selected ? (
            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
                <h2 className="text-xl font-semibold tracking-tight">{selected.item.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{selected.item.seller}</p>
                <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <span className="text-[var(--muted)]">Category</span>
                  <span>{selected.item.category || "Not recorded"}</span>
                  <span className="text-[var(--muted)]">Return</span>
                  <span>{selected.item.returnDeadline || "Not recorded"}</span>
                  <span className="text-[var(--muted)]">Warranty</span>
                  <span>{selected.item.warrantyDeadline || "Not recorded"}</span>
                  <span className="text-[var(--muted)]">Serial</span>
                  <span>{selected.item.serialNumber || "Not recorded"}</span>
                  <span className="text-[var(--muted)]">Status</span>
                  <span>{selected.item.claimStatus}</span>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Evidence checklist</h3>
                  <div className="mt-3 grid gap-2" data-testid="detail-evidence">
                    {evidenceKeys.map((key) => (
                      <label key={key} className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm">
                        <input
                          className="size-4 accent-[var(--accent)]"
                          type="checkbox"
                          checked={selected.item.evidence[key]}
                          onChange={() => void handleEvidenceToggle(selected.item, key)}
                        />
                        {evidenceLabels[key]}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Readiness score</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">Transparent factor breakdown, not advice.</p>
                  </div>
                  <span className={cn("font-mono text-5xl font-semibold tabular-nums", scoreTone(selected.score.total))}>{selected.score.total}</span>
                </div>
                <div className="mt-5 divide-y divide-[var(--border)]">
                  {selected.score.factors.map((factor) => (
                    <div key={factor.key} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="font-medium">{factor.label}</p>
                        <p className="text-sm text-[var(--muted)]">{factor.reason}</p>
                      </div>
                      <p className="font-mono text-sm tabular-nums text-[var(--fg)]">
                        {factor.earned}/{factor.max}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Warnings</h3>
                  {selected.warnings.length === 0 ? (
                    <p className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]">
                      No deterministic warnings from the current evidence and deadline state.
                    </p>
                  ) : (
                    selected.warnings.map((warning) => (
                      <div
                        key={warning.code}
                        className={cn(
                          "rounded-md border px-3 py-3 text-sm",
                          warning.severity === "critical"
                            ? "border-[var(--danger)] bg-[var(--danger)]/10"
                            : "border-[var(--warning)] bg-[var(--warning)]/10"
                        )}
                      >
                        <p className="font-semibold">{warning.title}</p>
                        <p className="mt-1 text-[var(--muted)]">{warning.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 text-[var(--accent-strong)]">{icon}</div>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="font-mono text-3xl font-semibold tabular-nums text-[var(--fg)]">{value}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--fg)]" htmlFor={id}>
      {label}
      <input
        id={id}
        className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] px-3 text-[var(--fg)]"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
