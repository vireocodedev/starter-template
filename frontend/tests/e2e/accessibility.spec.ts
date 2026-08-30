import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";
import { authenticateAsDevelopmentAdministrator } from "./support/authentication";

async function expectNoSeriousAccessibilityViolations(page: Page): Promise<void> {
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const engine = (window as typeof window & { axe: typeof axe }).axe;
    const result = await engine.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return result.violations
      .filter(violation => violation.impact === "critical" || violation.impact === "serious")
      .map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map(node => ({
          failureSummary: node.failureSummary,
          html: node.html,
          target: node.target.map(String),
        })),
      }));
  });

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test("login has no serious WCAG 2.2 automated violations", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await expectNoSeriousAccessibilityViolations(page);
});

test("authenticated Item list and create dialog have no serious automated violations", async ({ page }) => {
  await authenticateAsDevelopmentAdministrator(page);

  await page.goto("/items");
  await expect(page.getByRole("button", { name: "Create item" })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByRole("button", { name: "Create item" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});
