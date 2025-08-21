FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv


# Copy dependency file and install dependencies
COPY pyproject.toml ./
RUN uv pip compile pyproject.toml --no-emit-index-url -o requirements.txt
RUN uv pip install -r requirements.txt --system

# Copy project files
COPY . .


# Collect static files (for production)
RUN python src/manage.py collectstatic --noinput || true

CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]
