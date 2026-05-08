import { expect, type Page, test } from "@playwright/test";

async function selectNode(page: Page, name: RegExp) {
  const node = page.getByRole("button", { name });
  await node.click();
  await expect(node).toHaveAttribute("aria-pressed", "true");
  return node;
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
