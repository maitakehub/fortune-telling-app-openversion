import { WebDriver, WebElement, By, until, Builder } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { getChromeOptions } from '../config/chrome';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_TIMEOUT = 30000; // 30秒
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-screenshots');

// スクリーンショットディレクトリの作成
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export async function waitForElement(driver: WebDriver, selector: string, timeout: number = DEFAULT_TIMEOUT): Promise<WebElement> {
  console.log(`Waiting for element: ${selector}`);
  try {
    const element = await driver.wait(until.elementLocated(By.css(selector)), timeout);
    console.log(`Element found: ${selector}`);
    return element;
  } catch (error) {
    console.error(`Failed to find element: ${selector}`, error);
    await takeScreenshot(driver, `element-not-found-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
}

export async function waitForUrl(driver: WebDriver, url: string, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
  console.log(`Waiting for URL: ${url}`);
  try {
    await driver.wait(until.urlIs(url), timeout);
    console.log(`URL matched: ${url}`);
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    console.error(`Failed to wait for URL: ${url}, current URL: ${currentUrl}`, error);
    await takeScreenshot(driver, `url-wait-error-${url.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
}

export async function waitForUrlContains(driver: WebDriver, urlPart: string, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
  console.log(`Waiting for URL to contain: ${urlPart}`);
  try {
    await driver.wait(until.urlContains(urlPart), timeout);
    console.log(`URL contains: ${urlPart}`);
  } catch (error) {
    const currentUrl = await driver.getCurrentUrl();
    console.error(`Failed to wait for URL to contain: ${urlPart}, current URL: ${currentUrl}`, error);
    await takeScreenshot(driver, `url-contains-error-${urlPart.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
}

export async function clearBrowserData(driver: WebDriver): Promise<void> {
  console.log('Clearing browser data...');
  try {
    await driver.executeScript('window.localStorage.clear();');
    await driver.executeScript('window.sessionStorage.clear();');
    console.log('Browser data cleared successfully');
  } catch (error) {
    console.error('Failed to clear browser data:', error);
  }
}

export async function takeScreenshot(driver: WebDriver, name: string): Promise<void> {
  try {
    const screenshot = await driver.takeScreenshot();
    const filename = `${name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await fs.promises.writeFile(filepath, screenshot, 'base64');
    console.log(`Screenshot saved: ${filename}`);
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

export const isElementPresent = async (
  driver: WebDriver,
  selector: string
): Promise<boolean> => {
  try {
    await driver.findElement(By.css(selector));
    return true;
  } catch (error) {
    return false;
  }
};

export async function initializeDriver(): Promise<WebDriver> {
  const { Builder } = require('selenium-webdriver');
  const options = getChromeOptions();
  
  console.log('Initializing ChromeDriver...');
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // タイムアウトの設定
  await driver.manage().setTimeouts({
    implicit: 5000,
    pageLoad: 30000,
    script: 30000
  });

  console.log('ChromeDriver initialized successfully');
  return driver;
}

export async function waitForElementAndClick(driver: WebDriver, selector: string, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
  const element = await waitForElement(driver, selector, timeout);
  try {
    await element.click();
    console.log(`Clicked element: ${selector}`);
  } catch (error) {
    console.error(`Failed to click element: ${selector}`, error);
    await takeScreenshot(driver, `click-error-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
}

export async function waitForElementAndType(driver: WebDriver, selector: string, text: string, timeout: number = DEFAULT_TIMEOUT): Promise<void> {
  const element = await waitForElement(driver, selector, timeout);
  try {
    await element.sendKeys(text);
    console.log(`Typed text into element: ${selector}`);
  } catch (error) {
    console.error(`Failed to type text into element: ${selector}`, error);
    await takeScreenshot(driver, `type-error-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
} 