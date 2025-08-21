# Django Docker + uv + Docker Compose Project

This project is a production-ready Django application using Docker, uv for Python package management, and docker-compose for orchestration.

## Features
- Django (latest stable)
- uv for fast, modern Python dependency management
- Dockerfile for app containerization
- docker-compose for orchestration
- Ready for local development and production

## Quickstart

1. **Build and start services:**
   ```sh
   docker-compose up --build
   ```

2. **Create Django superuser:**
   ```sh
   docker-compose exec web python manage.py createsuperuser
   ```

3. **Access the app:**
   - Django: http://localhost:8000

## Structure
- `Dockerfile` — App image
- `docker-compose.yml` — Service orchestration
- `pyproject.toml` — Python dependencies (managed by uv)
- `src/` — Django project code

## Notes
- Replace placeholder values as needed.
- For production, update settings and secrets accordingly.
