FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright and browsers
RUN pip install --no-cache-dir playwright && playwright install --with-deps

# Set workdir
WORKDIR /app

# Copy requirements and source
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Default command
CMD ["python", "bot.py"] 