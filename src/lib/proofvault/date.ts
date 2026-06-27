const DAY_MS = 24 * 60 * 60 * 1000;

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (value.trim() === "") {
    return true;
  }

  const parsed = value.includes("T") ? Date.parse(value) : Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed);
}

export function daysUntil(dateString: string, now: Date): number | null {
  if (!dateString.trim()) {
    return null;
  }

  const target = Date.parse(`${dateString}T00:00:00.000Z`);
  if (!Number.isFinite(target)) {
    return null;
  }

  const current = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.ceil((target - current) / DAY_MS);
}
