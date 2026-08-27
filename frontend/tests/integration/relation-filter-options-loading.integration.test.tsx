import { AppStorybookProvider } from "@/app/storybook/AppStorybookProvider";
import { QueryFilterValueEditor } from "@/features/entity-query-filters/components/QueryFilterValueEditor";
import type {
  QueryFilterCandidate,
  QueryFilterRuleDraft,
} from "@/features/entity-query-filters/models/EntityQueryFilters";
import { useQuery } from "@tanstack/react-query";
import type { QueryEngineRelationOption } from "@vireocodedev/query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", async importOriginal => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: vi.fn(),
}));

const candidate: QueryFilterCandidate = {
  id: "relation:owner",
  path: "owner",
  label: "Owner",
  type: "RELATION",
  operators: [],
  enumValues: [],
  enumLabels: {},
  relation: true,
  multiple: true,
};
const selected: QueryEngineRelationOption = { label: "Maya Chen", value: "user-7" };
const rule: QueryFilterRuleDraft = {
  id: "rule-1",
  candidateId: candidate.id,
  operator: null,
  value: { kind: "relation", options: [selected] },
};
const refetch = vi.fn(async () => undefined);

function optionState(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch,
    ...overrides,
  };
}

function renderEditor() {
  return render(
    <AppStorybookProvider>
      <QueryFilterValueEditor entityKey="ITEM" candidate={candidate} rule={rule} onChange={vi.fn()} />
    </AppStorybookProvider>,
  );
}

describe("Relation filter option loading-state contract", () => {
  beforeEach(() => refetch.mockClear());

  it("retains the selected value behind one local busy boundary while options load", async () => {
    vi.mocked(useQuery).mockReturnValue(optionState({ isFetching: true, isPending: true }) as never);
    renderEditor();

    expect(screen.getByText("Maya Chen")).toBeVisible();
    expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(1);
    expect(await screen.findByRole("status")).toHaveTextContent("Loading options");
  });

  it("keeps the control and selected value usable after an initial option failure", () => {
    vi.mocked(useQuery).mockReturnValue(optionState({ isError: true }) as never);
    renderEditor();

    expect(screen.getByPlaceholderText("Search options")).toBeEnabled();
    expect(screen.getByText("Maya Chen")).toBeVisible();
    expect(screen.getByText("Options could not be loaded.")).toBeVisible();
    expect(document.querySelector('[data-relation-options-state="error"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("retains cached options and distinguishes a refresh failure", () => {
    vi.mocked(useQuery).mockReturnValue(optionState({ data: [selected], isError: true }) as never);
    renderEditor();

    expect(screen.getByText("Maya Chen")).toBeVisible();
    expect(screen.getByText("Options could not be refreshed. Showing the most recent saved results.")).toBeVisible();
    expect(document.querySelector('[data-relation-options-state="stale-error"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("distinguishes a resolved empty option set from a request failure", async () => {
    vi.mocked(useQuery).mockReturnValue(optionState({ data: [] }) as never);
    renderEditor();

    const input = screen.getByPlaceholderText("Search options");
    fireEvent.mouseDown(input);
    expect(await screen.findByText("No matching options")).toBeVisible();
    expect(screen.queryByText("Options could not be loaded.")).not.toBeInTheDocument();
  });
});
