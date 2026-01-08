# DNA Backend

The DNA backend is a FastAPI application that provides the core functionality for the DNA application. It is responsible for:

- Handling the API requests from the frontend
- Interacting with the database
- Interacting with the LLM providers
- Interacting with the transcription providers
- Interacting with the production Tracking APIs (ShotGrid, etc.)

## Stack

- FastAPI
- Python
- Pydantic
- Docker/Docker-compose


## Providers

Providers are the services that populate abstractions or interfaces with other services.

### Production Tracking

Production Tracking providers are the services that provide data to the backend from the production tracking systems and allow for updates to the production tracking systems.

### LLM

LLM providers are the services that provide the LLM functionality to the backend.

### Transcription

Transcription providers are the services that provide the transcription functionality to the backend and connect the transcript with versions being reviewed.

## Setup

To setup the backend, you need to have the following:

- A production tracking system (ShotGrid, etc.)
- An LLM provider (OpenAI, Anthropic, Google, etc.)
- A transcription provider (Vexa, etc.)

### Running the Backend

To run the backend, you need to have the following:

- Docker/Docker-compose

#### Quick Start

1. Build and start the application:
   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:8000`

3. To run in detached mode:
   ```bash
   docker-compose up -d
   ```

4. To stop the application:
   ```bash
   docker-compose down
   ```

5. To view logs:
   ```bash
   docker-compose logs -f
   ```

## Style

- Black formatting
- isort for sorting imports
- pytest/pytest-cov for testing

## Testing

- pytest/pytest-cov for testing

## Documentation

- pydoc for documentation
