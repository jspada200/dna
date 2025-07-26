import { authenticator } from 'otplib';

export function generateTOTPCode(mfaSecret) {
  if (!mfaSecret) {
    console.warn('[WARN] MFA_SECRET not provided, skipping TOTP generation');
    return null;
  }

  try {
    const code = authenticator.generate(mfaSecret);
    console.log('[INFO] Generated TOTP code');
    return code;
  } catch (error) {
    console.error('[ERROR] Failed to generate TOTP code:', error.message);
    return null;
  }
}

export async function handle2FAChallenge(page, mfaSecret) {
  console.log('[INFO] Detecting 2FA challenge...');

  // Wait for 2FA input field to appear
  try {
    await page.waitForSelector('input[name="credentials.passcode"]', {
      state: 'visible',
      timeout: 2000,
    });

    console.log('[INFO] 2FA challenge detected, generating TOTP code...');
    const totpCode = generateTOTPCode(mfaSecret);

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

export async function loginToGoogle(page, username, password, mfaSecret) {
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
  if (mfaSecret) {
    await handle2FAChallenge(page, mfaSecret);
  }

  console.log('[INFO] Google login successful.');
}

export async function joinGoogleMeet(page, meetLink) {
  console.log(`[INFO] Navigating to Google Meet: ${meetLink}`);
  await page.goto(meetLink, { waitUntil: 'networkidle' });

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

export async function leaveGoogleMeet(page) {
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
