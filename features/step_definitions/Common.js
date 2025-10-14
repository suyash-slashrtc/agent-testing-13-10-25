const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { expect } = require("chai");
const WebSocket = require("ws");

Given(
  "I am on the login page for agent from row {int}",
  async function (rowIndex) {
    await this.initBrowser();
    this.setCurrentAgent(rowIndex);

    await this.page.goto("https://tracelog14.slashrtc.in/index.php/login");
    await this.page.waitForSelector("#loginForm", { timeout: 40000 });
    await this.takeScreenshot(`login_page_${this.currentAgent.username}`);

    // for (let j = 0; j < this.agents.length; j++) {
    //   console.log(this.agents[j].username);
    // }
  }
);

Given(
  "I am logged in and on dashboard for agent from row {int}",
  async function (rowIndex) {
    console.log(`Agents loaded: ${this.agents.length}`);
    console.log(`Agents : ${this.agents}`);

    // Initialize browser and navigate to login page
    await this.initBrowser();
    this.setCurrentAgent(rowIndex);

    await this.page.goto("https://tracelog14.slashrtc.in/index.php/login");
    await this.page.waitForSelector("#loginForm", { timeout: 40000 });
    await this.takeScreenshot(`login_page_${this.currentAgent.username}`);

    const { username, password } = this.currentAgent;

    console.log(`Logging in with user: ${username}`);

    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.takeScreenshot(`login_form_filled_${username}`);

    await this.page.click("#loginProcess");
    await this.page.waitForNavigation({ timeout: 15000 });
    await this.takeScreenshot(`after_login_${username}`);

    const url = this.page.url();
    expect(url).not.to.contain("/login");
    expect(url).to.contain("/dialScreen");

    await this.page.waitForTimeout(2000);
    await this.takeScreenshot(`dashboard_redirect_${username}`);
    console.log(
      `Successfully logged in and redirected to dashboard for ${username}`
    );
  }
);

// // Keep the original single-agent method for backward compatibility
// Given("I am logged in and on dashboard", async function () {
//   // Default to first agent (row 0) for backward compatibility
//   await this.given("I am logged in and on dashboard for agent from row 0");
// });

When("I login with credentials from CSV row {int}", async function (rowIndex) {
  this.setCurrentAgent(rowIndex);
  const { username, password } = this.currentAgent;

  console.log(`Logging in with user: ${username}`);
  await this.takeScreenshot(`before_login_${username}`);

  // Fill login form
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', password);

  await this.takeScreenshot(`login_form_filled_${username}`);

  // Click login button
  await this.page.click("#loginProcess");

  // Wait for navigation
  await this.page.waitForNavigation({ timeout: 15000 });
  await this.takeScreenshot(`after_login_${username}`);
});

Then("I should be redirected to the dashboard", async function () {
  const url = this.page.url();
  expect(url).not.to.contain("/login");
  expect(url).to.contain("/dialScreen");
  await this.page.waitForTimeout(2000);
  await this.takeScreenshot("dashboard_redirect");
  console.log("Successfully redirected to dashboard");
});

Then("I am logging out", async function () {
  await this.page.waitForTimeout(2500);
  try {
    await this.page.click("span.menuTitle");
    await this.page.waitForTimeout(2000);
    await this.page.click(".fa-stack .fa-power-off");
    await this.page.waitForTimeout(1000);
    await this.takeScreenshot("after_logout");
    expect(url).to.contain("/login");
  } catch (error) {
    console.log("Could not logout : " + error);
  }
});
