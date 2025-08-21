# Manager Service

This service is responsible for managing the overall workflow of the Dailies Notes Assistant (DNA) system. This includes spawning workers, managing the lifecycle of dailies sessions, and storing our dailies artifacts.

## Features
- Django (latest stable)
- uv for fast, modern Python dependency management
- Dockerfile for app containerization
- docker-compose for orchestration
- Ready for local development and production

## Quickstart

Common commands are abstracted into the Makefile.


1. **Build and start services:**
   ```sh
   make up
   ```

2. **Running migrations:**
   ```sh
   make migrate
   ```

3. **Create superuser:**
   ```sh
   make createsuperuser
   ```

4. **Access the app:**
   - Django: http://localhost:8000

## Structure
- `Dockerfile` — App image
- `docker-compose.yml` — Service orchestration
- `docker-compose.local.yml` — Local development configuration
- `pyproject.toml` — Python dependencies (managed by uv)
- `src/` — Django project code
- `.env` - Environment variables: Not in repo, copy the sample and update with your values.

## Notes
- Replace placeholder values as needed.
- For production, update settings and secrets accordingly.
