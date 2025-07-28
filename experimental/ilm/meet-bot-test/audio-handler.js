export async function setupAudioCapture(page, serverAddress) {
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

          let audioStream = null;

          // Try to capture from existing media elements (Google Meet audio/video)
          const audioElements = document.querySelectorAll('audio, video');
          console.log(
            '[BROWSER] Found',
            audioElements.length,
            'media elements'
          );

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

          if (audioStream && audioStream.getAudioTracks().length > 0) {
            console.log(
              '[BROWSER] Creating MediaRecorder with audio stream...'
            );
            // Create MediaRecorder (using same format as successful popup.js)
            window.mediaRecorder = new MediaRecorder(audioStream, {
              mimeType: 'audio/webm',
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
              }
            };

            // Handle recording stop
            window.mediaRecorder.onstop = async () => {
              console.log('[BROWSER] Audio recording stopped');
              window.isRecording = false;

              // Combine all recorded chunks into a single Blob (like popup.js)
              if (window.audioChunks.length > 0) {
                const audioBlob = new Blob(window.audioChunks, {
                  type: 'audio/webm',
                });
                console.log(
                  '[BROWSER] Combined audio chunks into blob, size:',
                  audioBlob.size
                );

                // Send the combined audio blob to server
                await window.sendAudioChunkToServer(audioBlob);

                // Clear chunks for next recording
                window.audioChunks = [];
              }
            };

            // Start recording
            window.mediaRecorder.start(1000); // Collect data every 1 second
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

      // Function to restart recording cycle
      window.restartRecording = () => {
        if (window.isRecording) {
          console.log('[BROWSER] Stopping current recording to restart...');
          window.stopAudioCapture();
        }
        setTimeout(() => {
          console.log('[BROWSER] Starting new recording cycle...');
          window.startAudioCapture();
        }, 1000);
      };

      // Function to send audio chunk to server
      window.sendAudioChunkToServer = async (audioChunk) => {
        try {
          console.log('[BROWSER] Sending audio chunk to server...');

          // Create FormData with the audio blob (same format as popup.js)
          const formData = new FormData();
          formData.append('audio', audioChunk, 'chunk.wav');

          try {
            // Send to server via fetch using FormData
            const response = await fetch(`${serverAddress}/transcribe`, {
              method: 'POST',
              body: formData,
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
            console.log('[BROWSER] Failed to send audio chunk:', error.message);
          }
        } catch (error) {
          console.error('[BROWSER] Error sending audio chunk:', error);
        }
      };
    }, serverAddress);

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

export async function stopAudioCapture(page) {
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

export function setupPeriodicChecks(page) {
  // Set up periodic restart of recording (every 5 seconds like popup.js)
  setInterval(async () => {
    try {
      await page.evaluate(() => {
        if (
          window.restartRecording &&
          typeof window.restartRecording === 'function'
        ) {
          window.restartRecording();
        }
      });
    } catch (error) {
      console.log('[INFO] Error restarting recording:', error.message);
    }
  }, 10000); // Restart every 10 seconds

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
}
