# Meet Bot Test

This test is to see if we can make a bot that will join a Google Meet and transmit the audio stream to a local server.
This will be used to test live transcription of the audio stream.

## Approach

We will use Node.js with Puppeteer and the `puppeteer-extra-plugin-stealth` to automate joining a Google Meet. The bot will log in as a real user, join the meeting, and (in future steps) capture the audio stream for live transcription. This approach uses advanced anti-bot detection evasion to allow Google login.

### Inputs

- A Google Meet link (passed as a command-line argument)
- A local server address to send the audio stream to (environment variable)
- Google credentials (username and password, environment variables)
- **NEW**: TOTP 2FA support using MFA secret key

### Outputs

- Regular HTTP requests to the local server containing audio data captured from the Google Meet session

---

## Setup & Usage

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

**Basic Configuration:**
- `GOOGLE_USERNAME` - Your Google account email
- `GOOGLE_PASSWORD` - Your Google account password
- `SERVER_ADDRESS` - The local server address to send audio to

**2FA Configuration (Optional):**
- `MFA_SECRET` - Your base32-encoded TOTP secret key for Google Authenticator

You can set these in your shell or in a `.env` file (if using dotenv).

### 3. Setting up TOTP 2FA

If your Google account has 2FA enabled with Google Authenticator (TOTP), you can automate the 2FA process:

1. **Get your TOTP secret:**
   - When you set up Google Authenticator, Google shows a QR code
   - Use a QR decoder to extract the `otpauth://` URI
   - The secret is the `secret=` parameter in the URI
   
   Example URI: `otpauth://totp/Example:bot@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=Example`
   Secret: `JBSWY3DPEHPK3PXP`

2. **Store the secret securely:**
   - Add it to your `.env` file: `MFA_SECRET=JBSWY3DPEHPK3PXP`
   - Or set it as an environment variable

3. **The bot will automatically:**
   - Detect when 2FA is required
   - Generate the current TOTP code
   - Fill it in automatically
   - Complete the authentication

### 4. Run the bot

**Without 2FA:**
```bash
GOOGLE_USERNAME=your@email.com GOOGLE_PASSWORD=yourpassword SERVER_ADDRESS=http://localhost:5000 node bot.js https://meet.google.com/abc-defg-hij
```

**With TOTP 2FA:**
```bash
GOOGLE_USERNAME=your@email.com GOOGLE_PASSWORD=yourpassword SERVER_ADDRESS=http://localhost:5000 MFA_SECRET=JBSWY3DPEHPK3PXP node bot.js https://meet.google.com/abc-defg-hij
```

---

## Running in Docker

1. **Build and start the service:**
   ```bash
   docker-compose up --build
   ```
   This will build the Docker image and start the bot service.

2. **Code hot-reloading:**
   - The `docker-compose.yml` file mounts your local directory into the container at `/app`, so any code changes you make will be reflected immediately without needing to rebuild the image.

3. **Stopping the service:**
   - Press `Ctrl+C` in your terminal to stop the service.
   - To remove the containers, run:
     ```bash
     docker-compose down
     ```

---

## 2FA Troubleshooting

### Common Issues

1. **"MFA_SECRET not provided"**
   - Set the `MFA_SECRET` environment variable with your base32-encoded secret
   - Make sure the secret is correct (no extra spaces or characters)

2. **"Failed to generate TOTP code"**
   - Verify your MFA secret is valid base32-encoded
   - Check that the secret matches what Google provided

3. **"No 2FA challenge detected"**
   - Google might be using a different 2FA method (SMS, backup codes, etc.)
   - TOTP only works with Google Authenticator-style 2FA

4. **"Navigation timeout"**
   - This is normal when 2FA is required
   - The bot will automatically detect and handle the 2FA challenge

### Security Considerations

- Store your MFA secret securely in environment variables
- Don't commit the secret to version control
- Consider using a dedicated Google account for bot testing
- The TOTP code changes every 30 seconds

---

## Notes

- This project now uses Node.js and Puppeteer with stealth plugin for best compatibility with Google login.
- **NEW**: TOTP 2FA support is now available using the `otplib` library.
- The bot can automatically handle Google Authenticator-style 2FA challenges.
- If you encounter other security challenges (SMS, backup codes, hardware keys, etc.), you may need to handle them manually.
- This approach works with Okta SSO as long as the final authentication step uses TOTP.


