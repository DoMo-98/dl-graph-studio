import { expect, type Page, test } from "@playwright/test";

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

    await page
      .getByRole("button", { name: /expand connections panel/i })
      .click();
    await expect(connectionsPanel.getByText("Tensor -> Neuron")).toBeVisible();
  });

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
});
