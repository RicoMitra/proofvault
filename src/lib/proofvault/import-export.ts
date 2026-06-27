import { validateVaultExport } from "./validation";
import { VAULT_SCHEMA_VERSION, type ValidationResult, type VaultExport, type VaultItem } from "./types";

export function createVaultExport(items: VaultItem[], now = new Date()): VaultExport {
  return {
    schemaVersion: VAULT_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    items
  };
}

export function serializeVaultExport(items: VaultItem[], now = new Date()): string {
  return JSON.stringify(createVaultExport(items, now), null, 2);
}

export function parseVaultExportJson(json: string): ValidationResult<VaultExport> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, errors: ["Backup file must contain valid JSON."] };
  }

  return validateVaultExport(parsed);
}
