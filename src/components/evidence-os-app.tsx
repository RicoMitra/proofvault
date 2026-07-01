"use client";

import {
  Archive,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Filter,
  GitBranch,
  Layers3,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatAsCaseStudy,
  formatAsGithubReadme,
  formatAsMarkdown,
  formatAsResumeBullet,
  parseEvidenceExportJson,
  serializeEvidenceExport
} from "@/lib/evidence-os/export";
import { calculateCredibilityScore } from "@/lib/evidence-os/score";
import {
  clearEvidenceItems,
  deleteEvidenceItem,
  listEvidenceItems,
  replaceAllEvidenceItems,
  saveEvidenceItem
} from "@/lib/evidence-os/storage";
import { evidenceStatuses, evidenceTypes, type EvidenceItem, type EvidenceStatus, type EvidenceType } from "@/lib/evidence-os/types";
import { validateEvidenceItem } from "@/lib/evidence-os/validation";
import { cn } from "@/lib/utils";

export type EvidenceOsStorageApi = {
  list: () => Promise<EvidenceItem[]>;
  save: (item: EvidenceItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  replaceAll: (items: EvidenceItem[]) => Promise<void>;
  clear: () => Promise<void>;
};

type FormState = {
  title: string;
  type: EvidenceType;
  date: string;
  source: string;
  tags: string;
  category: string;
  context: string;
  impact: string;
  verification: string;
  status: EvidenceStatus;
  privateNotes: string;
};

const defaultStorageApi: EvidenceOsStorageApi = {
  list: listEvidenceItems,
  save: saveEvidenceItem,
  remove: deleteEvidenceItem,
  replaceAll: replaceAllEvidenceItems,
  clear: clearEvidenceItems
};

const emptyForm: FormState = {
  title: "",
  type: "Project",
  date: "",
  source: "",
  tags: "",
  category: "",
  context: "",
  impact: "",
  verification: "",
  status: "draft",
  privateNotes: ""
};

const exportModes = ["Markdown", "GitHub README", "Resume bullet", "Portfolio case study"] as const;
type ExportMode = (typeof exportModes)[number];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `evidence-${Date.now()}`;
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function createItemFromForm(form: FormState, existing?: EvidenceItem): EvidenceItem {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    title: form.title.trim(),
    type: form.type,
    date: form.date,
    source: form.source.trim(),
    tags: parseTags(form.tags),
    category: form.category.trim(),
    context: form.context.trim(),
    impact: form.impact.trim(),
    verification: form.verification.trim(),
    status: form.status,
    privateNotes: form.privateNotes.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

function formFromItem(item: EvidenceItem): FormState {
  return {
    title: item.title,
    type: item.type,
    date: item.date,
    source: item.source,
    tags: item.tags.join(", "),
    category: item.category,
    context: item.context,
    impact: item.impact,
    verification: item.verification,
    status: item.status,
    privateNotes: item.privateNotes
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

function buildExport(mode: ExportMode, selected: EvidenceItem[], fallback?: EvidenceItem): string {
  const items = selected.length ? selected : fallback ? [fallback] : [];

  if (items.length === 0) {
    return "Select evidence or add an item before exporting.";
  }

  if (mode === "Markdown") {
    return items.map(formatAsMarkdown).join("\n\n---\n\n");
  }

  if (mode === "GitHub README") {
    return formatAsGithubReadme(items);
  }

  if (mode === "Resume bullet") {
    return items.map(formatAsResumeBullet).join("\n");
  }

  return formatAsCaseStudy(items);
}

export function EvidenceOsApp({ storageApi = defaultStorageApi }: { storageApi?: EvidenceOsStorageApi }) {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EvidenceType | "All">("All");
  const [selectedForStory, setSelectedForStory] = useState<string[]>([]);
  const [exportMode, setExportMode] = useState<ExportMode>("GitHub README");
  const [exportText, setExportText] = useState("");
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
        score: calculateCredibilityScore(item)
      })),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return enrichedItems.filter(({ item }) => {
      const matchesType = typeFilter === "All" || item.type === typeFilter;
      const haystack = [item.title, item.type, item.category, item.context, item.impact, item.source, item.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return matchesType && (!normalized || haystack.includes(normalized));
    });
  }, [enrichedItems, query, typeFilter]);

  const selected = enrichedItems.find(({ item }) => item.id === selectedId) ?? enrichedItems[0];
  const selectedStoryItems = selectedForStory
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is EvidenceItem => Boolean(item));
  const readyCount = items.filter((item) => item.status === "ready").length;
  const averageScore = items.length
    ? Math.round(enrichedItems.reduce((sum, entry) => sum + entry.score.total, 0) / enrichedItems.length)
    : 0;
  const exportReadyCount = enrichedItems.filter((entry) => entry.score.total >= 80).length;

  async function reload(nextSelectedId?: string) {
    const storedItems = await storageApi.list();
    setItems(storedItems);
    setSelectedId(nextSelectedId ?? storedItems[0]?.id ?? "");
  }

  async function handleSave() {
    const existing = items.find((item) => item.id === editingId);
    const item = createItemFromForm(form, existing);
    const validation = validateEvidenceItem(item);

    if (!validation.ok) {
      setMessage(validation.errors.join(" "));
      return;
    }

    await storageApi.save(validation.value);
    setForm(emptyForm);
    setEditingId("");
    setMessage("Evidence saved in this browser.");
    await reload(validation.value.id);
  }

  async function handleDelete(id: string) {
    await storageApi.remove(id);
    setSelectedForStory((current) => current.filter((itemId) => itemId !== id));
    setMessage("Evidence removed from local storage.");
    await reload();
  }

  async function handleReset() {
    await storageApi.clear();
    setItems([]);
    setSelectedId("");
    setEditingId("");
    setSelectedForStory([]);
    setExportText("");
    setForm(emptyForm);
    setMessage("Local Evidence OS data reset.");
  }

  function handleEdit(item: EvidenceItem) {
    setEditingId(item.id);
    setForm(formFromItem(item));
    setSelectedId(item.id);
    setMessage(`Editing ${item.title}.`);
  }

  function handleStoryToggle(id: string) {
    setSelectedForStory((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  }

  function handleGenerateExport(mode: ExportMode = exportMode) {
    setExportMode(mode);
    setExportText(buildExport(mode, selectedStoryItems, selected?.item));
    setMessage(`${mode} export generated locally.`);
  }

  function handleBackupExport() {
    const json = serializeEvidenceExport(items);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `evidence-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("JSON backup exported from local data.");
  }

  async function handleImport(file: File | undefined) {
    if (!file) {
      return;
    }

    const text = await file.text();
    const result = parseEvidenceExportJson(text);
    if (!result.ok) {
      setMessage(result.errors.join(" "));
      return;
    }

    await storageApi.replaceAll(result.value.items);
    setSelectedForStory([]);
    setMessage("JSON backup imported into this browser.");
    await reload(result.value.items[0]?.id);
  }

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-[1440px] overflow-x-hidden px-4 py-6 md:px-10 md:py-10">
      <header className="grid gap-6 border-b border-[var(--border)] pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <div className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 text-sm text-[var(--accent-strong)]">
            <Shield aria-hidden="true" size={16} />
            Local-first career evidence
          </div>
          <h1 className="max-w-[11ch] text-4xl font-semibold tracking-tight md:text-6xl">Evidence OS</h1>
          <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-[var(--muted)]">
            Turn scattered career proof into structured portfolio material. Choose the evidence type first, add context and
            impact manually, then export Markdown for README, resume, or case study use.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Evidence" value={items.length} icon={<Archive aria-hidden="true" size={18} />} />
          <Metric label="Ready" value={readyCount} icon={<CheckCircle2 aria-hidden="true" size={18} />} />
          <Metric label="Avg score" value={averageScore} icon={<BadgeCheck aria-hidden="true" size={18} />} />
          <Metric label="Exportable" value={exportReadyCount} icon={<FileText aria-hidden="true" size={18} />} />
        </div>
      </header>

      <section className="grid gap-6 py-8 xl:grid-cols-[410px_minmax(0,1fr)]">
        <EvidenceForm
          form={form}
          editing={Boolean(editingId)}
          onCancel={() => {
            setEditingId("");
            setForm(emptyForm);
          }}
          onChange={setForm}
          onSave={() => void handleSave()}
        />

        <div className="grid min-w-0 gap-6">
          <section className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Evidence Inbox</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Manual capture, deterministic scoring, no auto-classifier.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="toolbar-button" type="button" onClick={handleBackupExport}>
                  <Download aria-hidden="true" size={16} />
                  Export JSON
                </button>
                <button className="toolbar-button" type="button" onClick={() => importInputRef.current?.click()}>
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
                <button className="toolbar-button danger" type="button" onClick={() => void handleReset()}>
                  <Trash2 aria-hidden="true" size={16} />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="field compact" htmlFor="evidence-search">
                <span>
                  <Search aria-hidden="true" size={15} />
                  Search evidence
                </span>
                <input
                  id="evidence-search"
                  aria-label="Search evidence"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="GitHub, certificate, launch"
                />
              </label>
              <label className="field compact" htmlFor="type-filter">
                <span>
                  <Filter aria-hidden="true" size={15} />
                  Type filter
                </span>
                <select
                  id="type-filter"
                  aria-label="Type filter"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as EvidenceType | "All")}
                >
                  <option value="All">All</option>
                  {evidenceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {message ? (
              <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--muted)]" role="status">
                {message}
              </p>
            ) : null}

            <div className="mt-6 divide-y divide-[var(--border)]">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Layers3 aria-hidden="true" className="mx-auto mb-3 text-[var(--accent-strong)]" size={34} />
                  <h3 className="text-lg font-semibold">No evidence in view</h3>
                  <p className="mx-auto mt-2 max-w-[48ch] text-sm text-[var(--muted)]">
                    Add evidence manually or adjust search filters. Evidence OS does not guess evidence types.
                  </p>
                </div>
              ) : (
                filteredItems.map(({ item, score }) => (
                  <article key={item.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <button className="min-h-11 text-left" type="button" onClick={() => setSelectedId(item.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">{item.title}</h3>
                        <span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--accent-strong)]">{item.type}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {item.category || "Uncategorized"} {item.date ? `- ${item.date}` : ""}
                      </p>
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedForStory.includes(item.id)}
                          aria-label={`Select ${item.title} for story export`}
                          onChange={() => handleStoryToggle(item.id)}
                        />
                        Story
                      </label>
                      <span className={cn("font-mono text-2xl font-semibold tabular-nums", scoreTone(score.total))}>{score.total}</span>
                      <button className="row-button" type="button" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="row-button danger" type="button" onClick={() => void handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
            <EvidenceCard selected={selected} />
            <StoryBuilder
              exportMode={exportMode}
              exportText={exportText}
              selectedCount={selectedStoryItems.length}
              onModeChange={setExportMode}
              onGenerate={handleGenerateExport}
            />
          </section>
        </div>
      </section>
    </main>
  );
}

function EvidenceForm({
  form,
  editing,
  onCancel,
  onChange,
  onSave
}: {
  form: FormState;
  editing: boolean;
  onCancel: () => void;
  onChange: (form: FormState) => void;
  onSave: () => void;
}) {
  return (
    <form
      className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{editing ? "Edit evidence" : "Add evidence"}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Start with the evidence type. The app will not auto-detect it.</p>
        </div>
        {editing ? (
          <button className="row-button" type="button" onClick={onCancel}>
            New
          </button>
        ) : null}
      </div>

      <div className="grid gap-4">
        <label className="field" htmlFor="evidence-type">
          <span>Evidence type</span>
          <select
            id="evidence-type"
            aria-label="Evidence type"
            value={form.type}
            onChange={(event) => onChange({ ...form, type: event.target.value as EvidenceType })}
          >
            {evidenceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Title" value={form.title} onChange={(value) => onChange({ ...form, title: value })} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Evidence date" type="date" value={form.date} onChange={(value) => onChange({ ...form, date: value })} />
          <label className="field" htmlFor="status">
            <span>Status</span>
            <select
              id="status"
              aria-label="Status"
              value={form.status}
              onChange={(event) => onChange({ ...form, status: event.target.value as EvidenceStatus })}
            >
              {evidenceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextField label="Source or reference" value={form.source} onChange={(value) => onChange({ ...form, source: value })} />
        <TextField label="Tags" value={form.tags} onChange={(value) => onChange({ ...form, tags: value })} helper="Comma-separated, for filtering and exports." />
        <TextField label="Category" value={form.category} onChange={(value) => onChange({ ...form, category: value })} />
        <TextareaField label="Context" value={form.context} onChange={(value) => onChange({ ...form, context: value })} />
        <TextareaField label="Impact" value={form.impact} onChange={(value) => onChange({ ...form, impact: value })} />
        <TextareaField label="Verification notes" value={form.verification} onChange={(value) => onChange({ ...form, verification: value })} />
        <TextareaField label="Private notes" value={form.privateNotes} onChange={(value) => onChange({ ...form, privateNotes: value })} />
        <button className="primary-button" type="submit">
          <Plus aria-hidden="true" size={17} />
          Save evidence
        </button>
      </div>
    </form>
  );
}

function EvidenceCard({ selected }: { selected?: { item: EvidenceItem; score: ReturnType<typeof calculateCredibilityScore> } }) {
  if (!selected) {
    return (
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-xl font-semibold tracking-tight">Evidence Card</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">Select or add evidence to inspect score factors and export readiness.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{selected.item.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{selected.item.type}</p>
        </div>
        <span className={cn("font-mono text-5xl font-semibold tabular-nums", scoreTone(selected.score.total))}>{selected.score.total}</span>
      </div>
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <span className="text-[var(--muted)]">Status</span>
        <span>{selected.item.status}</span>
        <span className="text-[var(--muted)]">Category</span>
        <span>{selected.item.category || "Not recorded"}</span>
        <span className="text-[var(--muted)]">Source</span>
        <span className="break-words">{selected.item.source || "Not recorded"}</span>
        <span className="text-[var(--muted)]">Tags</span>
        <span>{selected.item.tags.length ? selected.item.tags.join(", ") : "Not recorded"}</span>
      </div>
      <div className="mt-5 divide-y divide-[var(--border)]">
        {selected.score.factors.map((factor) => (
          <div key={factor.key} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-medium">{factor.label}</p>
              <p className="text-sm text-[var(--muted)]">{factor.reason}</p>
            </div>
            <p className="font-mono text-sm tabular-nums">
              {factor.earned}/{factor.max}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoryBuilder({
  exportMode,
  exportText,
  selectedCount,
  onModeChange,
  onGenerate
}: {
  exportMode: ExportMode;
  exportText: string;
  selectedCount: number;
  onModeChange: (mode: ExportMode) => void;
  onGenerate: (mode?: ExportMode) => void;
}) {
  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Career Story Builder</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {selectedCount ? `${selectedCount} evidence item${selectedCount === 1 ? "" : "s"} selected.` : "Uses the selected card if no story items are checked."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {exportModes.map((mode) => (
            <button
              key={mode}
              className={cn("toolbar-button", exportMode === mode && "active")}
              type="button"
              onClick={() => onGenerate(mode)}
            >
              {mode === "GitHub README" ? <GitBranch aria-hidden="true" size={16} /> : <Clipboard aria-hidden="true" size={16} />}
              {mode}
            </button>
          ))}
        </div>
      </div>

      <label className="field mt-5" htmlFor="export-mode">
        <span>Export format</span>
        <select id="export-mode" aria-label="Export format" value={exportMode} onChange={(event) => onModeChange(event.target.value as ExportMode)}>
          {exportModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
      <button className="primary-button mt-3" type="button" onClick={() => onGenerate()}>
        <BriefcaseBusiness aria-hidden="true" size={17} />
        Generate export
      </button>
      <label className="field mt-5" htmlFor="generated-export">
        <span>Generated export</span>
        <textarea
          id="generated-export"
          aria-label="Generated export"
          className="min-h-72 font-mono text-xs leading-relaxed"
          value={exportText}
          readOnly
        />
      </label>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow)]">
      <div className="mb-3 text-[var(--accent-strong)]">{icon}</div>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="font-mono text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  helper
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  helper?: string;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-").replaceAll("/", "-");

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} aria-label={label} type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
