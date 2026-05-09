# Playwright Functional Regression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Playwright functional regression suite for the current core editor workflows and run it in CI.

**Architecture:** Add Playwright as a root-level test harness that starts the existing Vite dev server and runs one Chromium project against the real app. Keep e2e-only helpers under `tests/e2e/`, use accessible selectors first, and add only testability attributes to React Flow handles where the current UI has no stable accessible target. CI remains thin: install dependencies, install Playwright browsers, then call repository-owned scripts.

**Tech Stack:** Playwright, Vite, React, React Flow, TypeScript, GitHub Actions, pnpm 10.27.0.

---

## File Structure

- Modify `package.json`: add `test:e2e` script and `@playwright/test` dev dependency.
- Modify `pnpm-lock.yaml`: update through `pnpm add -D @playwright/test`.
- Create `playwright.config.ts`: configure Chromium, Vite `webServer`, artifacts, and base URL.
- Modify `.gitignore`: ignore Playwright reports and test result artifacts.
- Modify `src/App.tsx`: add `data-testid` attributes to React Flow handles only, so self-connection validation can be tested without brittle generated class selectors.
- Create `tests/e2e/editor-core.spec.ts`: cover editor load, selection, inspector, parameter editing, connections, invalid connections, panel behavior, deletion, and export/reset/import.
- Modify `.github/workflows/ci.yml`: install Playwright Chromium dependencies and run `pnpm test:e2e` after coverage and before build.
- Modify `docs/roadmap/roadmap-process.md`: replace the old deferred Playwright note with required functional regression check documentation.

## Execution Prerequisite

Issue #55 is confirmed by the product owner, the live issue title/body have been updated, and the Project status is `In Progress`. Work must remain on `codex/55-playwright-functional-regression`.

Run this before implementation:

```bash
git status --short --branch
gh project item-list 5 --owner DoMo-98 --format json --limit 100 --jq '.items[] | select(.content.number == 55) | {status, title}'
```

Expected: branch is `codex/55-playwright-functional-regression`, no unstaged implementation changes, and #55 status is `In Progress`.

### Task 1: Add Playwright Dependency And Config

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `playwright.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Confirm Playwright is not configured yet**

Run:

```bash
pnpm test:e2e
test ! -e playwright.config.ts
```

Expected: `pnpm test:e2e` fails because the script is missing, and `test ! -e playwright.config.ts` passes with no output.

- [ ] **Step 2: Add Playwright**

Run:

```bash
pnpm add -D @playwright/test
```

Expected: `package.json` and `pnpm-lock.yaml` change, and `@playwright/test` appears in `devDependencies`.

- [ ] **Step 3: Add the package script**

Update the `scripts` block in `package.json` to include `test:e2e` immediately after `test:coverage`:

```json
"scripts": {
  "dev": "vite",
  "tauri": "tauri",
  "build": "tsc --noEmit && vite build",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "validate:commit-message": "node scripts/validate-commit-message.mjs",
  "validate:roadmap-issue": "node scripts/validate-roadmap-issue.mjs",
  "lint": "eslint .",
  "format:check": "prettier --check ."
}
```

- [ ] **Step 4: Create Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:1420",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    acceptDownloads: true,
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1",
    url: "http://127.0.0.1:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

Expected: Playwright uses the existing Vite port `1420` and keeps one Chromium project.

- [ ] **Step 5: Ignore Playwright artifacts**

Update `.gitignore` so the artifact block includes:

```gitignore
node_modules/
dist/
coverage/
playwright-report/
test-results/
.pnpm-store/
.playwright-cli/
output/playwright/
```

Expected: Playwright reports and trace/video output are not tracked.

- [ ] **Step 6: Run the empty Playwright suite**

Run:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: browser install succeeds. `pnpm test:e2e` fails with a clear "No tests found" style message because no e2e specs exist yet.

- [ ] **Step 7: Commit Playwright setup**

Run:

```bash
pnpm validate:commit-message -- --message "test: add playwright e2e harness"
git add package.json pnpm-lock.yaml playwright.config.ts .gitignore
git commit -m "test: add playwright e2e harness"
```

Expected: commit succeeds.

### Task 2: Add Stable E2E Testability For React Flow Handles

**Files:**

- Modify: `src/App.tsx`

- [ ] **Step 1: Add handle test ids**

In `PrimitiveNodeCard`, update the target and source handles to include node-specific test ids:

```tsx
<Handle
  type="target"
  position={Position.Left}
  className="architecture-node-handle"
  data-testid={`node-${data.id}-target-handle`}
/>
```

```tsx
<Handle
  type="source"
  position={Position.Right}
  className="architecture-node-handle"
  data-testid={`node-${data.id}-source-handle`}
/>
```

Expected: only testability attributes change; no user-facing behavior changes.

- [ ] **Step 2: Run unit tests**

Run:

```bash
pnpm test
```

Expected: PASS. Existing React Flow and component tests still pass.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build
```

Expected: PASS. TypeScript accepts the added `data-testid` props on `Handle`.

- [ ] **Step 4: Commit handle testability**

Run:

```bash
pnpm validate:commit-message -- --message "test: expose stable graph handle selectors"
git add src/App.tsx
git commit -m "test: expose stable graph handle selectors"
```

Expected: commit succeeds.

### Task 3: Add Core Editor Playwright Helpers And Load/Selection Tests

**Files:**

- Create: `tests/e2e/editor-core.spec.ts`

- [ ] **Step 1: Create the e2e spec with helpers and first tests**

Create `tests/e2e/editor-core.spec.ts`:

```ts
import { expect, type Locator, type Page, test } from "@playwright/test";

async function selectNode(page: Page, name: RegExp) {
  const node = page.getByRole("button", { name });
  await node.click();
  await expect(node).toHaveAttribute("aria-pressed", "true");
  return node;
}

async function startConnection(page: Page, sourceLabel: string) {
  await page
    .getByRole("button", {
      name: new RegExp(`start connection from ${sourceLabel}`, "i"),
    })
    .click();
}

async function completeConnection(
  page: Page,
  sourceLabel: string,
  targetLabel: string,
) {
  await page
    .getByRole("button", {
      name: new RegExp(`connect ${sourceLabel} to ${targetLabel}`, "i"),
    })
    .click();
}

async function expectToast(page: Page, message: RegExp) {
  await expect(
    page.getByRole("alert").or(page.getByRole("status")),
  ).toContainText(message);
}

async function dragHandleToHandle(
  source: Locator,
  target: Locator,
  page: Page,
) {
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  expect(sourceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();

  if (!sourceBox || !targetBox) {
    throw new Error("Graph handles must be visible before dragging.");
  }

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    {
      steps: 8,
    },
  );
  await page.mouse.up();
}

test.describe("editor core functional regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the editor workspace and default graph", async ({ page }) => {
    await expect(page.getByText("dl-graph-studio")).toBeVisible();
    await expect(page.getByRole("main", { name: /workspace/i })).toBeVisible();
    await expect(
      page.getByRole("region", { name: /graph canvas/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: /node inspector/i }),
    ).toBeVisible();
    await expect(page.getByText("No node selected")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /tensor primitive node/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /neuron primitive node/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /activation primitive node/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /dense \/ linear primitive node/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /dense block composite node/i }),
    ).toBeVisible();
  });

  test("selects primitive and composite nodes and updates the inspector", async ({
    page,
  }) => {
    await selectNode(page, /neuron primitive node/i);

    const inspector = page.getByRole("complementary", {
      name: /node inspector/i,
    });
    await expect(
      inspector.getByRole("heading", { name: "Neuron" }),
    ).toBeVisible();
    await expect(inspector.getByText("Foundation")).toBeVisible();
    await expect(
      inspector.getByRole("spinbutton", { name: /units/i }),
    ).toHaveValue("1");
    await expect(
      inspector.getByRole("checkbox", { name: /bias/i }),
    ).toBeChecked();

    await selectNode(page, /dense block composite node/i);

    await expect(
      inspector.getByRole("heading", { name: "Dense Block" }),
    ).toBeVisible();
    await expect(inspector.getByText("Composite")).toBeVisible();
    await expect(
      inspector.getByText("Members: Neuron, Activation, Dense / Linear"),
    ).toBeVisible();
  });
});
```

Expected: helpers are local to the spec and the first two tests cover load and selection/inspector.

- [ ] **Step 2: Run Playwright tests**

Run:

```bash
pnpm test:e2e
```

Expected: PASS. If role lookup for React Flow nodes fails, inspect the trace and use existing `data-testid` only for the affected node card lookup while preserving user-visible assertions.

- [ ] **Step 3: Commit load and selection coverage**

Run:

```bash
pnpm validate:commit-message -- --message "test: cover editor load and selection e2e"
git add tests/e2e/editor-core.spec.ts
git commit -m "test: cover editor load and selection e2e"
```

Expected: commit succeeds.

### Task 4: Add Parameter Editing And Connection Flow Tests

**Files:**

- Modify: `tests/e2e/editor-core.spec.ts`

- [ ] **Step 1: Add parameter editing test**

Append this test inside the existing `test.describe` block:

```ts
test("edits primitive parameters and keeps values tied to the selected node", async ({
  page,
}) => {
  await selectNode(page, /dense \/ linear primitive node/i);

  const inspector = page.getByRole("complementary", {
    name: /node inspector/i,
  });
  await inspector.getByRole("spinbutton", { name: /units/i }).fill("384");
  await expect(
    inspector.getByRole("spinbutton", { name: /units/i }),
  ).toHaveValue("384");

  await selectNode(page, /neuron primitive node/i);
  await expect(
    inspector.getByRole("spinbutton", { name: /units/i }),
  ).toHaveValue("1");

  await selectNode(page, /dense \/ linear primitive node/i);
  await expect(
    inspector.getByRole("spinbutton", { name: /units/i }),
  ).toHaveValue("384");
});
```

- [ ] **Step 2: Add valid connection and panel behavior test**

Append this test inside the existing `test.describe` block:

```ts
test("creates a valid connection and toggles the connections panel", async ({
  page,
}) => {
  await startConnection(page, "Tensor");
  await completeConnection(page, "Tensor", "Neuron");

  const connectionsPanel = page.getByRole("region", {
    name: /graph connections/i,
  });
  await expect(connectionsPanel.getByText("Tensor -> Neuron")).toBeVisible();
  await expect(connectionsPanel.getByText("1")).toBeVisible();

  await page
    .getByRole("button", { name: /collapse connections panel/i })
    .click();
  await expect(connectionsPanel.getByText("Tensor -> Neuron")).toBeHidden();

  await page.getByRole("button", { name: /expand connections panel/i }).click();
  await expect(connectionsPanel.getByText("Tensor -> Neuron")).toBeVisible();
});
```

- [ ] **Step 3: Add connection deletion test**

Append this test inside the existing `test.describe` block:

```ts
test("deletes one connection without clearing the remaining editor state", async ({
  page,
}) => {
  await startConnection(page, "Tensor");
  await completeConnection(page, "Tensor", "Neuron");
  await startConnection(page, "Neuron");
  await completeConnection(page, "Neuron", "Activation");

  const connectionsPanel = page.getByRole("region", {
    name: /graph connections/i,
  });
  await expect(connectionsPanel.getByText("Tensor -> Neuron")).toBeVisible();
  await expect(
    connectionsPanel.getByText("Neuron -> Activation"),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /delete connection tensor to neuron/i })
    .click();

  await expect(page.getByRole("status")).toContainText(
    /tensor -> neuron deleted/i,
  );
  await expect(connectionsPanel.getByText("Tensor -> Neuron")).toBeHidden();
  await expect(
    connectionsPanel.getByText("Neuron -> Activation"),
  ).toBeVisible();

  await selectNode(page, /activation primitive node/i);
  await expect(
    page
      .getByRole("complementary", { name: /node inspector/i })
      .getByRole("heading", { name: "Activation" }),
  ).toBeVisible();
});
```

- [ ] **Step 4: Run Playwright tests**

Run:

```bash
pnpm test:e2e
```

Expected: PASS. The suite now covers parameter editing, valid connection creation, panel toggle, and deletion.

- [ ] **Step 5: Commit editor interaction coverage**

Run:

```bash
pnpm validate:commit-message -- --message "test: cover editor interactions e2e"
git add tests/e2e/editor-core.spec.ts
git commit -m "test: cover editor interactions e2e"
```

Expected: commit succeeds.

### Task 5: Add Invalid Connection And Project File Workflow Tests

**Files:**

- Modify: `tests/e2e/editor-core.spec.ts`

- [ ] **Step 1: Add invalid connection tests**

Append these tests inside the existing `test.describe` block:

```ts
test("rejects duplicate and input-target connections with feedback", async ({
  page,
}) => {
  await startConnection(page, "Tensor");
  await completeConnection(page, "Tensor", "Neuron");
  await startConnection(page, "Tensor");
  await completeConnection(page, "Tensor", "Neuron");

  await expectToast(page, /that connection already exists/i);

  await startConnection(page, "Neuron");
  await completeConnection(page, "Neuron", "Tensor");

  await expectToast(
    page,
    /tensor is an input node and cannot receive connections/i,
  );
});

test("rejects self-connections created through graph handles", async ({
  page,
}) => {
  await dragHandleToHandle(
    page.getByTestId("node-neuron-source-handle"),
    page.getByTestId("node-neuron-target-handle"),
    page,
  );

  await expectToast(page, /neuron cannot connect to itself/i);
});
```

Expected: duplicate and input-target checks use accessible connection buttons. Self-connection uses explicit handle test ids because the current visible button workflow intentionally turns the source node button into a cancel action.

- [ ] **Step 2: Add export/reset/import test**

Append this test inside the existing `test.describe` block:

```ts
test("exports, resets, and imports the current project", async ({
  page,
}, testInfo) => {
  await selectNode(page, /tensor primitive node/i);
  await page.getByRole("textbox", { name: /shape/i }).fill("batch, features");
  await selectNode(page, /neuron primitive node/i);
  await page.getByRole("checkbox", { name: /bias/i }).uncheck();
  await startConnection(page, "Tensor");
  await completeConnection(page, "Tensor", "Neuron");

  await page.getByRole("button", { name: /project actions/i }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: /export project/i }).click();
  const download = await downloadPromise;
  const exportedPath = testInfo.outputPath("exported-project.json");
  await download.saveAs(exportedPath);
  await expect(page.getByRole("status")).toContainText(/project exported/i);

  await page.getByRole("button", { name: /project actions/i }).click();
  await page.getByRole("menuitem", { name: /reset project/i }).click();
  await expect(page.getByRole("status")).toContainText(/project reset/i);
  await expect(
    page.getByRole("region", { name: /graph connections/i }),
  ).toBeHidden();

  await selectNode(page, /dense \/ linear primitive node/i);
  await expect(page.getByRole("spinbutton", { name: /units/i })).toHaveValue(
    "128",
  );

  await page.getByLabel("Import project file").setInputFiles(exportedPath);

  await expect(page.getByRole("status")).toContainText(/project imported/i);
  await selectNode(page, /tensor primitive node/i);
  await expect(page.getByRole("textbox", { name: /shape/i })).toHaveValue(
    "batch, features",
  );
  await selectNode(page, /neuron primitive node/i);
  await expect(page.getByRole("checkbox", { name: /bias/i })).not.toBeChecked();
  await expect(
    page
      .getByRole("region", { name: /graph connections/i })
      .getByText("Tensor -> Neuron"),
  ).toBeVisible();
});
```

Expected: export/reset/import is included in the required suite if this test passes locally and in CI.

- [ ] **Step 3: Run Playwright tests**

Run:

```bash
pnpm test:e2e
```

Expected: PASS.

If only the export/reset/import test fails because Playwright cannot reliably use download or hidden file input behavior in this app, remove that test from the mandatory suite and add this note to the documentation task:

```markdown
Project export/reset/import remains covered by Vitest in `src/App.test.tsx` and `src/useProjectFileWorkflow.test.tsx`. A Playwright browser-level flow was attempted in #55 but was not kept as a required CI assertion because the Playwright download or file-upload path could not be made deterministic in local and CI verification without brittle browser workarounds. The PR notes include the failing command and observed error.
```

Do not remove the invalid connection tests unless the user approves a scope change.

- [ ] **Step 4: Commit invalid and project workflow coverage**

Run:

```bash
pnpm validate:commit-message -- --message "test: cover editor regression flows e2e"
git add tests/e2e/editor-core.spec.ts
git commit -m "test: cover editor regression flows e2e"
```

Expected: commit succeeds.

### Task 6: Add Playwright To CI

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Update the workflow**

In `.github/workflows/ci.yml`, insert these steps after `Check coverage` and before `Build`:

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run Playwright functional regression
  run: pnpm test:e2e
```

Expected: CI installs only Chromium and runs the repository-owned `test:e2e` script.

- [ ] **Step 2: Run local workflow commands in issue order**

Run:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 3: Commit CI integration**

Run:

```bash
pnpm validate:commit-message -- --message "test: run playwright regression in ci"
git add .github/workflows/ci.yml
git commit -m "test: run playwright regression in ci"
```

Expected: commit succeeds.

### Task 7: Document The Functional Regression Gate

**Files:**

- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Update required CI check documentation**

Replace the `## Required CI Checks` section with:

````markdown
## Required CI Checks

Pull requests and pushes to `main` run the repository CI workflow. The workflow is limited to repository-owned commands so required checks stay auditable and reproducible within this repository:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```
````

Agents should run the same commands locally before opening pull requests when the issue touches code, build configuration, tests, or documentation.

Coverage thresholds are a modest initial regression floor, not the final quality target for the product.

`pnpm test:e2e` runs the Playwright functional regression suite for the current core editor surface. It covers editor load, node selection, inspector updates, primitive parameter editing, valid and invalid connection behavior, connection panel behavior, connection deletion, and stable project file export/reset/import behavior when browser automation supports it. It is not visual snapshot testing, cross-browser coverage, Tauri desktop automation, or exhaustive future Phase 2 workflow coverage.

Custom pull request metadata validation and GitHub Project automation are separate roadmap issues and must not be hidden in the Playwright regression pull request.

````

Expected: docs no longer describe Playwright as only a deferred smoke check.

- [ ] **Step 2: Run documentation format check**

Run:

```bash
pnpm format:check
````

Expected: PASS. If Prettier reports Markdown formatting, run:

```bash
pnpm exec prettier --write docs/roadmap/roadmap-process.md docs/superpowers/plans/2026-05-09-playwright-functional-regression.md
pnpm format:check
```

- [ ] **Step 3: Commit documentation**

Run:

```bash
pnpm validate:commit-message -- --message "docs: document playwright regression gate"
git add docs/roadmap/roadmap-process.md docs/superpowers/plans/2026-05-09-playwright-functional-regression.md
git commit -m "docs: document playwright regression gate"
```

Expected: commit succeeds.

### Task 8: Final Verification And PR Preparation

**Files:**

- Verify all changed files.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 2: Review diff**

Run:

```bash
git status --short
git diff --stat origin/main..HEAD
git log --oneline origin/main..HEAD
```

Expected: only #55 design, Playwright setup, e2e tests, CI, and roadmap docs changed.

- [ ] **Step 3: Prepare manual verification instructions**

Use these manual verification steps in the final update and PR:

```markdown
Manual verification:

1. Run `pnpm test:e2e`.
2. Confirm Playwright opens the Vite app and passes the editor functional regression suite.
3. Confirm the suite covers editor load, node selection, inspector updates, parameter editing, valid connections, invalid/duplicate connection feedback, connection panel behavior, deletion, and export/reset/import if retained.
4. Open the GitHub Actions run for the PR and confirm the Playwright functional regression step is visible and passes.
5. If a Playwright run fails, open the uploaded trace or screenshot artifact and confirm it identifies the broken editor flow.
```

- [ ] **Step 4: Validate commit messages**

Run:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

Expected: PASS. Every commit on the branch uses the allowed Conventional Commit subset.

## Self-Review

- Spec coverage: Tasks cover Playwright installation, `test:e2e`, Vite `webServer`, Chromium CI, editor load, node selection, inspector updates, parameter editing, valid connections, self/duplicate/data-target invalid feedback, panel toggle, deletion, export/reset/import with a documented fallback, artifacts, documentation, and issue-required verification.
- Placeholder scan: No `TBD`, `TODO`, "implement later", or undefined follow-up instructions remain. The only conditional path is export/reset/import instability, with a concrete required note.
- Type and selector consistency: Test helpers use Playwright `Page` and `Locator`, existing accessible names from `src/App.tsx`, and new handle test ids added in Task 2.
