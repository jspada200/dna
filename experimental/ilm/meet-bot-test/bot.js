import dotenv from 'dotenv';
dotenv.config();
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import {
  loginToGoogle,
  joinGoogleMeet,
  leaveGoogleMeet,
} from './call-joiner.js';
import {
  setupAudioCapture,
  stopAudioCapture,
  setupPeriodicChecks,
} from './audio-handler.js';

const stealthPlugin = stealth();
stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
stealthPlugin.enabledEvasions.delete('media.codecs');
chromium.use(stealthPlugin);

const GOOGLE_USERNAME = process.env.GOOGLE_USERNAME;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS;
const MFA_SECRET = process.env.MFA_SECRET;
const MEET_LINK = process.argv[2];

// Global variables to track browser and page instances
let browser = null;
let page = null;
let isCleaningUp = false; // Flag to prevent multiple cleanup calls
let mediaRecorder = null; // MediaRecorder instance
let audioChunks = []; // Array to store audio chunks

if (!GOOGLE_USERNAME || !GOOGLE_PASSWORD || !SERVER_ADDRESS || !MEET_LINK) {
  console.error('[ERROR] Missing required inputs.');
  console.error(
    'Usage: GOOGLE_USERNAME=... GOOGLE_PASSWORD=... SERVER_ADDRESS=... node bot.js <MEET_LINK>'
  );
  process.exit(1);
}





async function cleanup() {
  if (isCleaningUp) {
    console.log('[INFO] Cleanup already in progress, skipping...');
    return;
  }

  isCleaningUp = true;
  console.log('[INFO] Cleaning up...');

  try {
    if (page) {
      await stopAudioCapture(page);
      await leaveGoogleMeet(page);
    }
  } catch (error) {
    console.error('[ERROR] Error during cleanup:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('[INFO] Browser closed.');
    }
    process.exit(0);
  }
}

// Handle process termination signals
process.on('SIGINT', async () => {
  console.log('\n[INFO] Received SIGINT, cleaning up...');
  await cleanup();
});

process.on('SIGTERM', async () => {
  console.log('\n[INFO] Received SIGTERM, cleaning up...');
  await cleanup();
});

process.on('SIGQUIT', async () => {
  console.log('\n[INFO] Received SIGQUIT, cleaning up...');
  await cleanup();
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('[ERROR] Uncaught exception:', error);
  await cleanup();
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('[ERROR] Unhandled rejection at:', promise, 'reason:', reason);
  await cleanup();
});

(async () => {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  page = await context.newPage();

  // Forward browser console messages to Node.js console
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    // Map browser console types to Node.js console methods
    switch (type) {
      case 'error':
        console.error('[BROWSER]', text);
        break;
      case 'warning':
        console.warn('[BROWSER]', text);
        break;
      default:
        console.log('[BROWSER]', text);
        break;
    }
  });

    try {
      await loginToGoogle(page, GOOGLE_USERNAME, GOOGLE_PASSWORD, MFA_SECRET);
      await joinGoogleMeet(page, MEET_LINK);
      console.log('[INFO] Page title:', await page.title());

      // Setup audio capture after joining the meeting
      await setupAudioCapture(page, SERVER_ADDRESS);

      // Wait a bit more to ensure everything is set up
      await page.waitForTimeout(2000);

      // Set up periodic checks
      setupPeriodicChecks(page);

      console.log('[INFO] Bot is running. Press Ctrl+C to exit.');
      await new Promise(() => {}); // Keep the process alive
    } catch (err) {
      console.error('[ERROR]', err);
      await page.screenshot({ path: 'error.png' });
      await cleanup();
    }
})();
