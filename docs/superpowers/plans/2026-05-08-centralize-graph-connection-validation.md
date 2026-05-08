# Centralize Graph Connection Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize existing graph connection validation so editor-created connections and imported project files use one shared rule source without changing behavior.

**Architecture:** Keep graph model types in `src/projectFile.ts` and add one exported validation helper there because both project import parsing and `App.tsx` already depend on that module. The helper should return a small rule result without UI wording; `App.tsx` maps rule failures to the existing toast messages, while import parsing keeps its existing generic invalid-connections rejection.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, pnpm.

---

### Task 1: Shared Connection Validation Helper

**Files:**

- Modify: `src/projectFile.ts`
- Test: `src/projectFile.test.ts`

- [ ] **Step 1: Write the failing tests**

Add exported helper coverage in `src/projectFile.test.ts` before implementation. The tests should prove the same rule helper can validate missing endpoints, self-connections, duplicate source-target pairs, `Data` targets, and valid connections.

```ts
import {
  parseProjectFileContent,
  updateGraphNodePositions,
  validateGraphConnectionRules,
} from "./projectFile";

describe("validateGraphConnectionRules", () => {
  it("rejects missing endpoint nodes", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "input", target: "missing" },
        project.nodes,
        [],
      ),
    ).toEqual({ isValid: false, reason: "missing-node" });
  });

  it("rejects self-connections", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "dense", target: "dense" },
        project.nodes,
        [],
      ),
    ).toEqual({
      isValid: false,
      reason: "self-connection",
      sourceNode: project.nodes[1],
    });
  });

  it("rejects duplicate source-target connection pairs", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "input", target: "dense" },
        project.nodes,
        project.connections,
      ),
    ).toEqual({ isValid: false, reason: "duplicate-connection" });
  });

  it("rejects connections into Data nodes", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "dense", target: "input" },
        project.nodes,
        [],
      ),
    ).toEqual({
      isValid: false,
      reason: "data-target",
      targetNode: project.nodes[0],
    });
  });

  it("accepts valid connections", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "dense", target: "block" },
        project.nodes,
        project.connections,
      ),
    ).toEqual({
      isValid: true,
      sourceNode: project.nodes[1],
      targetNode: project.nodes[2],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/projectFile.test.ts`

Expected: FAIL because `validateGraphConnectionRules` is not exported.

- [ ] **Step 3: Implement the helper**

Add exported types and `validateGraphConnectionRules` to `src/projectFile.ts`. Keep reasons narrow and behavior-only.

```ts
export type GraphConnectionRuleInput = Pick<
  GraphConnection,
  "source" | "target"
>;

export type GraphConnectionValidationResult =
  | { isValid: true; sourceNode: GraphNode; targetNode: GraphNode }
  | { isValid: false; reason: "missing-node" }
  | { isValid: false; reason: "self-connection"; sourceNode: GraphNode }
  | { isValid: false; reason: "duplicate-connection" }
  | { isValid: false; reason: "data-target"; targetNode: GraphNode };

export function validateGraphConnectionRules(
  connection: GraphConnectionRuleInput,
  nodes: GraphNode[],
  existingConnections: GraphConnection[],
): GraphConnectionValidationResult {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!sourceNode || !targetNode) {
    return { isValid: false, reason: "missing-node" };
  }

  if (connection.source === connection.target) {
    return { isValid: false, reason: "self-connection", sourceNode };
  }

  if (
    existingConnections.some(
      (existingConnection) =>
        existingConnection.source === connection.source &&
        existingConnection.target === connection.target,
    )
  ) {
    return { isValid: false, reason: "duplicate-connection" };
  }

  if (targetNode.kind === "Data") {
    return { isValid: false, reason: "data-target", targetNode };
  }

  return { isValid: true, sourceNode, targetNode };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/projectFile.test.ts`

Expected: PASS.

### Task 2: Reuse Helper In Editor And Import Flows

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/projectFile.ts`
- Test: `src/App.test.tsx`
- Test: `src/projectFile.test.ts`

- [ ] **Step 1: Write a focused failing consistency test**

Add an app-level regression test if missing for the self-connection UI message. Existing tests already cover duplicate and `Data` target messages.

```ts
it("rejects self-connections with clear feedback", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/cancel connection from tensor/i));

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
```

If this test proves the current UI intentionally prevents button-driven self-connections before validation, replace it with a targeted import/helper assertion instead. Do not change UI behavior.

- [ ] **Step 2: Run targeted tests**

Run: `pnpm test src/App.test.tsx src/projectFile.test.ts`

Expected before implementation: existing tests pass; any new helper import test from Task 1 should still drive the production change.

- [ ] **Step 3: Update `App.tsx`**

Import `validateGraphConnectionRules` from `src/projectFile.ts`, remove the duplicated endpoint/duplicate/`Data` rule checks from local `validateGraphConnection`, and keep current toast strings exactly:

```ts
function validateGraphConnection(
  sourceId: string,
  targetId: string,
  nodes: GraphNode[],
  connections: GraphConnection[],
): ConnectionValidationResult {
  const validation = validateGraphConnectionRules(
    { source: sourceId, target: targetId },
    nodes,
    connections,
  );

  if (validation.isValid) {
    return { isValid: true };
  }

  switch (validation.reason) {
    case "missing-node":
      return {
        isValid: false,
        message: "Choose two existing nodes before creating a connection.",
      };
    case "self-connection":
      return {
        isValid: false,
        message: `${validation.sourceNode.label} cannot connect to itself.`,
      };
    case "duplicate-connection":
      return { isValid: false, message: "That connection already exists." };
    case "data-target":
      return {
        isValid: false,
        message: `${validation.targetNode.label} is an input node and cannot receive connections.`,
      };
  }
}
```

- [ ] **Step 4: Update import parsing**

In `parseConnections`, keep duplicate ID checking local, but call `validateGraphConnectionRules(connection, nodes, connections)` after parsing each structurally valid connection. Remove the separate `targetsBySourceId` map and endpoint/kind checks from `parseConnection`.

- [ ] **Step 5: Run targeted tests**

Run: `pnpm test src/App.test.tsx src/projectFile.test.ts`

Expected: PASS with existing toast messages and import rejection behavior unchanged.

- [ ] **Step 6: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all pass.
