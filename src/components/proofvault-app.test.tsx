import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProofVaultApp, type ProofVaultStorageApi } from "./proofvault-app";
import type { VaultItem } from "@/lib/proofvault/types";

function createMemoryStorage(initialItems: VaultItem[] = []): ProofVaultStorageApi {
  let items = [...initialItems];

  return {
    list: async () => items,
    save: async (item) => {
      items = [item, ...items.filter((existing) => existing.id !== item.id)];
    },
    remove: async (id) => {
      items = items.filter((item) => item.id !== id);
    },
    replaceAll: async (nextItems) => {
      items = nextItems;
    },
    clear: async () => {
      items = [];
    }
  };
}

describe("ProofVaultApp", () => {
  it("adds an item and updates the dashboard", async () => {
    render(<ProofVaultApp storageApi={createMemoryStorage()} now={new Date("2026-06-27T00:00:00.000Z")} />);

    fireEvent.change(screen.getByLabelText("Item or service name"), { target: { value: "Bluetooth speaker" } });
    fireEvent.change(screen.getByLabelText("Seller"), { target: { value: "Nada Audio Store" } });
    fireEvent.change(screen.getByLabelText("Purchase date"), { target: { value: "2026-06-20" } });
    fireEvent.change(screen.getByLabelText("Return deadline"), { target: { value: "2026-06-30" } });
    fireEvent.change(screen.getByLabelText("Warranty deadline"), { target: { value: "2027-06-20" } });
    fireEvent.click(screen.getByLabelText("Receipt or invoice"));
    fireEvent.click(screen.getByLabelText("Payment proof"));
    fireEvent.click(screen.getByRole("button", { name: "Save item" }));

    expect(await screen.findAllByText("Bluetooth speaker")).toHaveLength(2);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("updates readiness score when evidence checklist changes", async () => {
    render(<ProofVaultApp storageApi={createMemoryStorage()} now={new Date("2026-06-27T00:00:00.000Z")} />);

    fireEvent.change(screen.getByLabelText("Item or service name"), { target: { value: "Smartwatch" } });
    fireEvent.change(screen.getByLabelText("Seller"), { target: { value: "Tempo Gadget" } });
    fireEvent.change(screen.getByLabelText("Purchase date"), { target: { value: "2026-06-20" } });
    fireEvent.click(screen.getByRole("button", { name: "Save item" }));

    expect(await screen.findAllByText("Smartwatch")).toHaveLength(2);
    expect(screen.getAllByText("25").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByLabelText("Receipt or invoice")[1]);

    await waitFor(() => expect(screen.getAllByText("31").length).toBeGreaterThan(0));
  });

  it("shows deadline warnings and clears local records on reset", async () => {
    render(<ProofVaultApp storageApi={createMemoryStorage()} now={new Date("2026-06-27T00:00:00.000Z")} />);

    fireEvent.change(screen.getByLabelText("Item or service name"), { target: { value: "Vacuum cleaner" } });
    fireEvent.change(screen.getByLabelText("Seller"), { target: { value: "Bersih Home" } });
    fireEvent.change(screen.getByLabelText("Purchase date"), { target: { value: "2026-06-01" } });
    fireEvent.change(screen.getByLabelText("Return deadline"), { target: { value: "2026-06-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Save item" }));

    expect(await screen.findByText("Return window expired")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export JSON" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset vault" }));

    await waitFor(() => expect(screen.queryByText("Vacuum cleaner")).not.toBeInTheDocument());
    expect(screen.getByText("No vault items yet")).toBeInTheDocument();
  });
});
