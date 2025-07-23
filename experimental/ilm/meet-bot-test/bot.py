import os
from playwright.sync_api import sync_playwright


def main():
    # Read headless mode from environment variable (default: True)
    headless_env = os.getenv("HEADLESS", "true").lower()
    headless = headless_env in ("1", "true", "yes")
    print(f"[INFO] Launching browser with headless={headless}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        page = browser.new_page()
        page.goto("https://www.google.com")
        print(page.content())  # Output the HTML content to the shell
        if not headless:
            input("Press Enter to exit...")
        browser.close()

# To run with a visible browser locally:
#   HEADLESS=false python bot.py
#
# To see the browser in Docker, you need to set up X11 forwarding or use a VNC server in the container.
# This is advanced and not needed for most automation tasks.

if __name__ == "__main__":
    main() 