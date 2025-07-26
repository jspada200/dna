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
let mediaRecorder = null; // MediaRecorder instance
let audioChunks = []; // Array to store audio chunks

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
    console.log('[INFO] Generated TOTP code');
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

async function setupAudioCapture(page) {
  console.log('[INFO] Setting up audio capture...');

  try {
    // Inject JavaScript to capture audio from the page
    await page.evaluate((serverAddress) => {
      // Store MediaRecorder globally so we can access it from Node.js
      window.mediaRecorder = null;
      window.audioChunks = [];
      window.isRecording = false;

      // Function to start audio capture
      window.startAudioCapture = async () => {
        try {
          console.log('[BROWSER] Starting audio capture...');

          // Get all audio elements and media streams from the page
          const audioElements = document.querySelectorAll('audio, video');
          console.log(
            '[BROWSER] Found',
            audioElements.length,
            'media elements'
          );
          let audioStream = null;

          // Try to get audio stream from existing media elements
          for (const element of audioElements) {
            console.log(
              '[BROWSER] Checking element:',
              element.tagName,
              'srcObject:',
              !!element.srcObject
            );
            if (
              element.srcObject &&
              element.srcObject.getAudioTracks().length > 0
            ) {
              audioStream = element.srcObject;
              console.log(
                '[BROWSER] Found audio stream from media element with',
                element.srcObject.getAudioTracks().length,
                'audio tracks'
              );
              break;
            }
          }

          // If no audio stream found, try to capture system audio
          if (!audioStream) {
            try {
              // Request system audio capture (this may require user permission)
              audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  echoCancellation: false,
                  noiseSuppression: false,
                  autoGainControl: false,
                },
              });
              console.log('[BROWSER] Captured system audio stream');
            } catch (error) {
              console.log(
                '[BROWSER] Could not capture system audio:',
                error.message
              );
            }
          }

          // Method 3: Try to capture tab audio using getDisplayMedia
          if (!audioStream) {
            try {
              const displayStream =
                await navigator.mediaDevices.getDisplayMedia({
                  audio: true,
                  video: false,
                });
              audioStream = displayStream;
              console.log('[BROWSER] Captured tab audio via getDisplayMedia');
            } catch (error) {
              console.log(
                '[BROWSER] Could not capture tab audio:',
                error.message
              );
            }
          }

          // Method 4: Try to capture from audio context as fallback
          if (!audioStream) {
            try {
              const audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
              const destination = audioContext.createMediaStreamDestination();

              // This is a fallback - may not work for all scenarios
              console.log('[BROWSER] Attempting to capture from audio context');
              audioStream = destination.stream;
            } catch (error) {
              console.log(
                '[BROWSER] Could not create audio context:',
                error.message
              );
            }
          }

          if (audioStream && audioStream.getAudioTracks().length > 0) {
            console.log(
              '[BROWSER] Creating MediaRecorder with audio stream...'
            );
            // Create MediaRecorder
            window.mediaRecorder = new MediaRecorder(audioStream, {
              mimeType: 'audio/webm;codecs=opus',
              audioBitsPerSecond: 16000,
            });

            window.audioChunks = [];
            window.isRecording = true;

            // Handle data available event
            window.mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                window.audioChunks.push(event.data);
                console.log(
                  '[BROWSER] Audio chunk received, size:',
                  event.data.size
                );

                // Send chunk to server
                window.sendAudioChunkToServer(event.data);
              }
            };

            // Handle recording stop
            window.mediaRecorder.onstop = () => {
              console.log('[BROWSER] Audio recording stopped');
              window.isRecording = false;
            };

            // Start recording
            window.mediaRecorder.start(5000); // Collect data every 5 seconds
            console.log('[BROWSER] Audio recording started');

            return true;
          } else {
            console.log(
              '[BROWSER] No audio stream available - audioStream:',
              !!audioStream,
              'tracks:',
              audioStream ? audioStream.getAudioTracks().length : 0
            );
            return false;
          }
        } catch (error) {
          console.error('[BROWSER] Error starting audio capture:', error);
          return false;
        }
      };

      // Function to stop audio capture
      window.stopAudioCapture = () => {
        if (window.mediaRecorder && window.isRecording) {
          window.mediaRecorder.stop();
          window.isRecording = false;
          console.log('[BROWSER] Audio recording stopped');
        }
      };

      // Function to check for new audio streams periodically
      window.checkForNewAudioStreams = () => {
        if (window.isRecording) {
          return; // Already recording
        }

        const audioElements = document.querySelectorAll('audio, video');
        console.log(
          '[BROWSER] Checking for audio streams, found',
          audioElements.length,
          'media elements'
        );

        for (const element of audioElements) {
          if (
            element.srcObject &&
            element.srcObject.getAudioTracks().length > 0
          ) {
            console.log(
              '[BROWSER] Found new audio stream, attempting to capture...'
            );
            window.startAudioCapture();
            break;
          }
        }
      };

      // Function to log current audio capture status
      window.logAudioStatus = () => {
        console.log('[BROWSER] Audio capture status:', {
          isRecording: window.isRecording,
          mediaRecorder: !!window.mediaRecorder,
          audioChunks: window.audioChunks.length,
          mediaElements: document.querySelectorAll('audio, video').length,
        });
      };

      // Function to manually retry audio capture
      window.retryAudioCapture = () => {
        console.log('[BROWSER] Manually retrying audio capture...');
        if (window.isRecording) {
          window.stopAudioCapture();
        }
        setTimeout(() => {
          window.startAudioCapture();
        }, 1000);
      };

      // Function to send audio chunk to server
      window.sendAudioChunkToServer = async (audioChunk) => {
        try {
          console.log('[BROWSER] Sending audio chunk to server...');

          // Convert blob to base64
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = reader.result.split(',')[1]; // Remove data URL prefix

            try {
              // Send to server via fetch
              const response = await fetch(`${serverAddress}/transcribe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  audio: base64Data,
                  timestamp: Date.now(),
                }),
              });

              if (response.ok) {
                const result = await response.json();
                console.log('[BROWSER] Whisper response:', result);
              } else {
                console.log(
                  '[BROWSER] Server error:',
                  response.status,
                  response.statusText
                );
              }
            } catch (error) {
              console.log(
                '[BROWSER] Failed to send audio chunk:',
                error.message
              );
            }
          };
          reader.readAsDataURL(audioChunk);
        } catch (error) {
          console.error('[BROWSER] Error sending audio chunk:', error);
        }
      };
    }, SERVER_ADDRESS);

    // Verify that functions were injected properly
    const functionsAvailable = await page.evaluate(() => {
      return {
        startAudioCapture: typeof window.startAudioCapture === 'function',
        checkForNewAudioStreams:
          typeof window.checkForNewAudioStreams === 'function',
        logAudioStatus: typeof window.logAudioStatus === 'function',
      };
    });

    console.log('[INFO] Functions available:', functionsAvailable);

    // Wait a bit for the page to load and then start audio capture
    await page.waitForTimeout(3000);

    // Start audio capture
    const captureStarted = await page.evaluate(() => {
      if (
        window.startAudioCapture &&
        typeof window.startAudioCapture === 'function'
      ) {
        return window.startAudioCapture();
      } else {
        console.log('[BROWSER] startAudioCapture function not available');
        return false;
      }
    });

    if (captureStarted) {
      console.log('[INFO] Audio capture started successfully');
    } else {
      console.log('[WARN] Failed to start audio capture');
    }
  } catch (error) {
    console.error('[ERROR] Failed to setup audio capture:', error.message);
  }
}

async function stopAudioCapture(page) {
  console.log('[INFO] Stopping audio capture...');

  try {
    await page.evaluate(() => {
      window.stopAudioCapture();
    });
    console.log('[INFO] Audio capture stopped');
  } catch (error) {
    console.error('[ERROR] Failed to stop audio capture:', error.message);
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
    await loginToGoogle(page, GOOGLE_USERNAME, GOOGLE_PASSWORD);
    await joinGoogleMeet(page, MEET_LINK);
    console.log('[INFO] Page title:', await page.title());

    // Setup audio capture after joining the meeting
    await setupAudioCapture(page);

    // Wait a bit more to ensure everything is set up
    await page.waitForTimeout(2000);

    // Set up periodic check for new audio streams
    setInterval(async () => {
      try {
        await page.evaluate(() => {
          if (
            window.checkForNewAudioStreams &&
            typeof window.checkForNewAudioStreams === 'function'
          ) {
            window.checkForNewAudioStreams();
          }
        });
      } catch (error) {
        console.log('[INFO] Error checking for audio streams:', error.message);
      }
    }, 5000); // Check every 5 seconds

    // Set up periodic retry if not recording
    setInterval(async () => {
      try {
        await page.evaluate(() => {
          if (
            window.logAudioStatus &&
            typeof window.logAudioStatus === 'function'
          ) {
            window.logAudioStatus();
          }
          // If not recording, try to start again
          if (
            !window.isRecording &&
            window.retryAudioCapture &&
            typeof window.retryAudioCapture === 'function'
          ) {
            console.log('[BROWSER] Not recording, attempting retry...');
            window.retryAudioCapture();
          }
        });
      } catch (error) {
        console.log('[INFO] Error in retry check:', error.message);
      }
    }, 10000); // Check every 10 seconds

    // Set up periodic status logging
    setInterval(async () => {
      try {
        await page.evaluate(() => {
          if (
            window.logAudioStatus &&
            typeof window.logAudioStatus === 'function'
          ) {
            window.logAudioStatus();
          }
        });
      } catch (error) {
        console.log('[INFO] Error logging audio status:', error.message);
      }
    }, 10000); // Log status every 10 seconds

    console.log('[INFO] Bot is running. Press Ctrl+C to exit.');
    await new Promise(() => {}); // Keep the process alive
  } catch (err) {
    console.error('[ERROR]', err);
    await page.screenshot({ path: 'error.png' });
    await cleanup();
  }
})();
