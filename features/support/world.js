const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs-extra');

class CustomWorld {
  constructor() {
    this.agents = [];
    this.customers = [];
    this.currentAgent = null;
    this.currentCustomer = null;
    this.currentCustomerIndex = 0;
    this.browser = null;
    this.context = null;
    this.page = null;

    // Create screenshots directory
    this.screenshotDir = path.join(__dirname, '..', '..', 'screenshots');
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Create videos directory
    this.videosDir = path.join(__dirname, '..', '..', 'videos/');
    if (!fs.existsSync(this.videosDir)) {
      fs.mkdirSync(this.videosDir, { recursive: true });
    }
  }

  async initBrowser() {
    if (this.browser) return;
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1440,900',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--allow-running-insecure-content',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors'
      ]
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 780 },
      permissions: ['microphone'],
      recordVideo: {
        dir: this.videosDir,
        size: { width: 1920, height: 1280 }
      }
    });
    this.page = await this.context.newPage();
  }

  async takeScreenshot(screenshotName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${screenshotName}_${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      await this.page.screenshot({ path: filepath, fullPage: true });
      console.log(`Screenshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.log('Error taking screenshot:', error.message);
      return null;
    }
  }

  setCurrentAgent(rowIndex) {
    if (rowIndex >= 0 && rowIndex < this.agents.length) {
      this.currentAgent = this.agents[rowIndex];
      console.log(`Set current agent to: ${this.currentAgent.username}`);
    } else {
      throw new Error(`Invalid row index: ${rowIndex}. Available agents: ${this.agents.length}`);
    }
  }

  // Method to get next customer one by one
  getNextCustomer() {
    if (this.currentCustomerIndex < this.customers.length) {
      this.currentCustomer = this.customers[this.currentCustomerIndex];
      console.log(`Using customer ${this.currentCustomerIndex + 1}/${this.customers.length}: ${this.currentCustomer.username} - ${this.currentCustomer.phone_no}`);
      this.currentCustomerIndex++;
      return this.currentCustomer;
    } else {
      console.log('All customers have been used. Resetting to first customer.');
      this.currentCustomerIndex = 0;
      return this.getNextCustomer(); // Start over or return null based on your needs
    }
  }

  async checkReadyState() {
    try {
      const state = await this.page.locator('.userstate').textContent();
      const isReady = state.trim().toLowerCase() === 'ready';
      console.log(`Ready state check result: ${isReady}`);
      return isReady;
    } catch (error) {
      console.log('Error checking ready state:', error.message);
      return false;
    }
  }

  async closeBrowser() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    this.page = null;
    this.context = null;
    this.browser = null;
  }

  async getVideoPath() {
    if (this.page && this.page.video()) {
      const videoPath = await this.page.video().path();
      console.log(`Video saved: ${videoPath}`);
      return videoPath;
    }
    return null;
  }
}

setWorldConstructor(CustomWorld);