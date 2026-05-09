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
    await expect(connectionsPanel.getByText(/^1$/)).toBeVisible();

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
    await expect(
      page.getByRole("checkbox", { name: /bias/i }),
    ).not.toBeChecked();
    await expect(
      page
        .getByRole("region", { name: /graph connections/i })
        .getByText("Tensor -> Neuron"),
    ).toBeVisible();
  });
});
