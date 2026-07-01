import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvidenceOsApp, type EvidenceOsStorageApi } from "./evidence-os-app";
import type { EvidenceItem } from "@/lib/evidence-os/types";

function createMemoryStorage(initialItems: EvidenceItem[] = []): EvidenceOsStorageApi {
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

describe("EvidenceOsApp", () => {
  it("adds type-first evidence and updates the inbox", async () => {
    render(<EvidenceOsApp storageApi={createMemoryStorage()} />);

    fireEvent.change(screen.getByLabelText("Evidence type"), { target: { value: "GitHub Repo" } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "ProofVault migration" } });
    fireEvent.change(screen.getByLabelText("Evidence date"), { target: { value: "2026-07-01" } });
    fireEvent.change(screen.getByLabelText("Source or reference"), {
      target: { value: "https://github.com/RicoMitra/proofvault" }
    });
    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "nextjs, portfolio" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Frontend Engineering" } });
    fireEvent.change(screen.getByLabelText("Context"), { target: { value: "Converted a proof tracker into Evidence OS." } });
    fireEvent.change(screen.getByLabelText("Impact"), {
      target: { value: "Created reusable README and resume material from career proof." }
    });
    fireEvent.change(screen.getByLabelText("Verification notes"), {
      target: { value: "GitHub and Vercel links are available." }
    });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "ready" } });
    fireEvent.click(screen.getByRole("button", { name: "Save evidence" }));

    expect(await screen.findAllByText("ProofVault migration")).toHaveLength(2);
    expect(screen.getAllByText("GitHub Repo").length).toBeGreaterThan(0);
  });

  it("filters evidence and generates README export text", async () => {
    const initial: EvidenceItem = {
      id: "evidence-1",
      title: "Career evidence launch",
      type: "Achievement",
      date: "2026-07-01",
      source: "https://vercel.com",
      tags: ["launch", "portfolio"],
      category: "Product Engineering",
      context: "Prepared structured career proof.",
      impact: "Made portfolio updates faster and easier to verify.",
      verification: "Deployment and repository are available.",
      status: "ready",
      privateNotes: "",
      createdAt: "2026-07-01T09:00:00.000Z",
      updatedAt: "2026-07-01T09:00:00.000Z"
    };

    render(<EvidenceOsApp storageApi={createMemoryStorage([initial])} />);

    expect(await screen.findAllByText("Career evidence launch")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Search evidence"), { target: { value: "launch" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Career evidence launch for story export" }));
    fireEvent.click(screen.getByRole("button", { name: "GitHub README" }));

    await waitFor(() => {
      expect((screen.getByLabelText("Generated export") as HTMLTextAreaElement).value).toContain("## Career evidence launch");
    });
  });
});
