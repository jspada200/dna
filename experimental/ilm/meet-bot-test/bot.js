import dotenv from 'dotenv';
dotenv.config();
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { authenticator } from 'otplib';

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

if (!GOOGLE_USERNAME || !GOOGLE_PASSWORD || !SERVER_ADDRESS || !MEET_LINK) {
  console.error('[ERROR] Missing required inputs.');
  console.error(
    'Usage: GOOGLE_USERNAME=... GOOGLE_PASSWORD=... SERVER_ADDRESS=... node bot.js <MEET_LINK>'
  );
  process.exit(1);
}

function generateTOTPCode() {
  if (!MFA_SECRET) {
    console.warn('[WARN] MFA_SECRET not provided, skipping TOTP generation');
    return null;
  }

  try {
    const code = authenticator.generate(MFA_SECRET);
    console.log('[INFO] Generated TOTP code:', code);
    return code;
  } catch (error) {
    console.error('[ERROR] Failed to generate TOTP code:', error.message);
    return null;
  }
}

async function handle2FAChallenge(page) {
  console.log('[INFO] Detecting 2FA challenge...');

  // Wait for 2FA input field to appear
  try {
    await page.waitForSelector('input[name="credentials.passcode"]', {
      state: 'visible',
      timeout: 2000,
    });

    console.log('[INFO] 2FA challenge detected, generating TOTP code...');
    const totpCode = generateTOTPCode();

    if (totpCode) {
      // Fill in the TOTP code
      await page.fill('input[name="credentials.passcode"]', totpCode);

      // Click submit button
      await page.click('button[type="submit"], input[type="submit"]');

      // Wait for navigation or success
      await page.waitForNavigation({
        waitUntil: 'networkidle',
        timeout: 20000,
      });
      console.log('[INFO] 2FA challenge completed successfully.');
      return true;
    }
  } catch (error) {
    console.log('[INFO] No 2FA challenge detected or TOTP not configured.');
    return false;
  }

  return false;
}

async function loginToGoogle(page, username, password) {
  console.log('[INFO] Navigating to Google login...');
  await page.goto('https://accounts.google.com/signin', {
    waitUntil: 'networkidle',
  });

  // We first fill in the email on google. Once this is done we are
  // redirected to okta where we need to fill in the username
  await page.fill('input[type="email"]', username);
  await page.click('#identifierNext');

  await page.waitForSelector('input[type="text"][name="identifier"]', {
    state: 'visible',
    timeout: 15000,
  });
  await page.fill('input[type="text"][name="identifier"]', username);
  await page.click('input[type="submit"]');

  await page.waitForSelector('input[type="password"]', {
    state: 'visible',
    timeout: 15000,
  });
  await page.fill('input[type="password"]', password);
  await page.click('input[type="submit"]');

  // Wait for navigation or 2FA challenge
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 });
  } catch (error) {
    // If navigation times out, check for 2FA challenge
    console.log('[INFO] Navigation timeout, checking for 2FA challenge...');
  }

  // Handle 2FA if MFA_SECRET is provided
  if (MFA_SECRET) {
    await handle2FAChallenge(page);
  }

  console.log('[INFO] Google login successful.');
}

async function joinGoogleMeet(page, meetLink) {
  console.log(`[INFO] Navigating to Google Meet: ${meetLink}`);
  await page.goto(meetLink, { waitUntil: 'networkidle' });
  // Wait for the join button and click it

  // Look for and click "Continue without microphone and camera" button
  try {
    await page.waitForSelector(
      'span:has-text("Continue without microphone and camera")',
      { state: 'visible', timeout: 10000 }
    );
    await page.click('span:has-text("Continue without microphone and camera")');
    console.log(
      '[INFO] Clicked "Continue without microphone and camera" button.'
    );
  } catch (e) {
    console.log(
      '[INFO] "Continue without microphone and camera" button not found or already handled.'
    );
  }

  // Wait for the join button and click it
  try {
    await page.waitForSelector('span:has-text("Join now")', {
      state: 'visible',
      timeout: 20000,
    });
    await page.click('span:has-text("Join now")');
    console.log('[INFO] Joined the Google Meet.');
  } catch (e) {
    console.warn(
      '[WARN] Could not find or click the Join button automatically. Will move on to "Join now".'
    );
  }
}

async function leaveGoogleMeet(page) {
  try {
    console.log('[INFO] Attempting to leave Google Meet...');

    // Try multiple selectors for the leave call button
    const leaveSelectors = [
      '',
      'span:has-text("Leave call")',
      'span:has-text("Leave meeting")',
      'button[aria-label*="Leave call"]',
      'button[aria-label*="Leave meeting"]',
      '[data-mdc-dialog-action="leave"]',
      'button:has-text("Leave")',
    ];

    for (const selector of leaveSelectors) {
      try {
        await page.waitForSelector(selector, {
          state: 'visible',
          timeout: 2000,
        });
        await page.click(selector);
        console.log(
          `[INFO] Successfully clicked leave button with selector: ${selector}`
        );

        // Wait a moment for the action to complete
        await page.waitForTimeout(2000);
        return true;
      } catch (e) {
        // Continue to next selector
        continue;
      }
    }

    // If no leave button found, try to close the tab/browser
    console.log('[INFO] No leave button found, closing browser...');
    return false;
  } catch (error) {
    console.error('[ERROR] Failed to leave Google Meet:', error.message);
    return false;
  }
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

  try {
    await loginToGoogle(page, GOOGLE_USERNAME, GOOGLE_PASSWORD);
    await joinGoogleMeet(page, MEET_LINK);
    console.log('[INFO] Page title:', await page.title());
    // TODO: Implement audio streaming to SERVER_ADDRESS
    console.log('[INFO] Bot is running. Press Ctrl+C to exit.');
    await new Promise(() => {}); // Keep the process alive
  } catch (err) {
    console.error('[ERROR]', err);
    await page.screenshot({ path: 'error.png' });
    await cleanup();
  }
})();
