# Meet Bot Test

This test is to see if we can make a bot that will join a Google Meet and transmit the audio stream to a local server.
This will be used to test live transcription of the audio stream.

## Approach

We will use Playwright to automate joining a Google Meet. Once joined, we will inject JavaScript into the page to access the media elements (such as the video or audio elements) and use the MediaRecorder API to capture the audio stream. The recorded audio chunks will be sent to a local server for live transcription (e.g., using Whisper) and storage in a database for later use. This approach is inspired by the open-source Vexa project, which uses similar techniques to access and process media streams directly from the browser DOM, without requiring a browser extension.

### Inputs

- A Google Meet link
- A local server address to send the audio stream to
- Credentials to join the Google Meet

### Outputs

- Regular HTTP requests to the local server containing audio data captured from the Google Meet session

---

## Running the Service Locally

You can run the bot locally for development and debugging. This allows you to see the browser window and interact with it if needed.

1. **Create and activate a Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers:**
   ```bash
   playwright install
   ```

4. **Run the bot with a visible browser:**
   ```bash
   HEADLESS=false python bot.py
   ```
   This will launch the browser in non-headless mode so you can see what the bot is doing.

5. **To exit:**
   - Press Enter in the terminal when prompted to close the browser and end the script.

---

## Running in Docker

You can run the bot in a containerized environment using Docker Compose. This setup is useful for consistent deployments and for running the bot in headless mode.

1. **Build and start the service:**
   ```bash
   docker-compose up --build
   ```
   This will build the Docker image (if needed) and start the bot service.

2. **Code hot-reloading:**
   - The `docker-compose.yml` file mounts your local directory into the container at `/app`, so any code changes you make will be reflected immediately without needing to rebuild the image.

3. **Stopping the service:**
   - Press `Ctrl+C` in your terminal to stop the service.
   - To remove the containers, run:
     ```bash
     docker-compose down
     ```

4. **Headless mode:**
   - By default, the bot runs in headless mode inside Docker. If you want to run with a visible browser, you would need to set up X11 forwarding or a VNC server, which is advanced and not required for most use cases.

---


