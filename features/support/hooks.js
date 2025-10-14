const { AfterAll, Before, After, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs-extra');
const csv = require('csv-parser');
const path = require('path');

let globalAgents = [];
let globalCustomers = []


setDefaultTimeout(60 * 60 * 1000);

BeforeAll(async function () {

  this.dialedLeads = new Set();
  console.log('Loading agents and customers from CSV files...');

  // Load agents
  const agentsCsvPath = path.join(__dirname, '..', '..', 'data', 'agents.csv');
  if (fs.existsSync(agentsCsvPath)) {
    globalAgents = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(agentsCsvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`Loaded ${results.length} agents from CSV`);
          resolve(results);
        })
        .on('error', reject);
    });
  } else {
    console.warn(`Agents CSV file not found at: ${agentsCsvPath}`);
  }

  // Load customers
  const customersCsvPath = path.join(__dirname, '..', '..', 'data', 'customers.csv');
  if (fs.existsSync(customersCsvPath)) {
    globalCustomers = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(customersCsvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`Loaded ${results.length} customers from CSV`);
          resolve(results);
        })
        .on('error', reject);
    });
    
  } else {
    console.warn(`Customers CSV file not found at: ${customersCsvPath}`);
  }
});

Before(async function () {
  this.agents = [...globalAgents];
  this.customers = [...globalCustomers];

  // this.agents = [...globalAgents];
  // this.customers = [...globalCustomers];
  // console.log('Starting scenario...');
  // console.log(``);

  // Assign pre-loaded agents and customers to scenario context
  
  
  // this.agents.forEach(element => {
    // console.log(`Agents: ${element.username}`);
    // console.log(``);
    // });

  // console.log(`Assigned ${this.agents.length} agents to scenario`);
  // console.log(`Assigned ${this.customers.length} customers to scenario`);
});



After(async function () {
  // Take screenshot only at the end of the scenario (final screen)
  if (this.page) {
    try {
      const scenarioName = this.scenario?.name || 'unknown-scenario';
      const sanitizedName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(__dirname, '..', '..', 'screenshots', `${sanitizedName}_${timestamp}.png`);

      // Ensure screenshots directory exists
      await fs.ensureDir(path.dirname(screenshotPath));

      // Take screenshot
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error.message);
    }
  }

  // Clean up browser instance
  if (this.browser) {
    await this.browser.close();
    console.log('Browser closed');
  }

  console.log('Scenario completed');
});

AfterAll(async function () {
  console.log('All tests completed');

  
  const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    const files = await fs.readdir(screenshotsDir);
    console.log(`Screenshots available: ${files.length} files in ${screenshotsDir}`);
  }
});