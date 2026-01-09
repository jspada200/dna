"""FastAPI application entry point."""

from functools import lru_cache
from typing import Annotated, cast

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from dna.models import Asset, Note, Playlist, Shot, Task, Version
from dna.prodtrack_providers.shotgrid import ShotgridProvider

# API metadata for Swagger documentation
API_TITLE = "DNA Backend"
API_DESCRIPTION = """
## DNA Backend API

Backend API for the DNA (Dailies Notes Assistant) application.

### Features
- 🎬 Production tracking integration (ShotGrid)
- 🎤 Transcription services
- 🤖 LLM-powered note generation
- 📋 Playlist and version management

### Documentation
- **Swagger UI**: Available at `/docs`
- **ReDoc**: Available at `/redoc`
- **OpenAPI JSON**: Available at `/openapi.json`
"""

API_VERSION = "0.1.0"

# Define API tags for organizing endpoints
tags_metadata = [
    {
        "name": "Health",
        "description": "Health check and status endpoints",
    },
    {
        "name": "Entities",
        "description": "Operations for managing production entities",
    },
    {
        "name": "Playlists",
        "description": "Operations for managing playlists",
    },
    {
        "name": "Versions",
        "description": "Operations for managing versions",
    },
    {
        "name": "Shots",
        "description": "Operations for managing shots",
    },
    {
        "name": "Assets",
        "description": "Operations for managing assets",
    },
    {
        "name": "Tasks",
        "description": "Operations for managing tasks",
    },
    {
        "name": "Notes",
        "description": "Operations for managing notes",
    },
    {
        "name": "Transcription",
        "description": "Audio transcription services",
    },
    {
        "name": "LLM",
        "description": "LLM-powered note generation",
    },
]

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    openapi_tags=tags_metadata,
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
    openapi_url="/openapi.json",  # OpenAPI schema
    contact={
        "name": "DNA Project",
        "url": "https://github.com/AcademySoftwareFoundation/dna",
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Dependencies
# -----------------------------------------------------------------------------


@lru_cache
def get_shotgrid_provider() -> ShotgridProvider:
    """Get or create the ShotGrid provider singleton."""
    return ShotgridProvider()


ShotGridDep = Annotated[ShotgridProvider, Depends(get_shotgrid_provider)]


# -----------------------------------------------------------------------------
# Health endpoints
# -----------------------------------------------------------------------------


@app.get(
    "/",
    tags=["Health"],
    summary="Root endpoint",
    description="Returns basic API information and version.",
    response_description="API information with name and version",
)
async def root():
    """Root endpoint returning API information."""
    return {"message": "DNA Backend API", "version": API_VERSION}


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check if the API is running and healthy.",
    response_description="Health status of the API",
)
async def health():
    """Health check endpoint for monitoring and load balancers."""
    return {"status": "healthy"}


# -----------------------------------------------------------------------------
# Entity endpoints
# -----------------------------------------------------------------------------


@app.get(
    "/version/{version_id}",
    tags=["Versions"],
    summary="Get a version by ID",
    description="Retrieve version information from the production tracking system.",
    response_model=Version,
)
async def get_version(version_id: int, provider: ShotGridDep) -> Version:
    """Get a version entity by its ID."""
    try:
        return cast(Version, provider.get_entity("version", version_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/playlist/{playlist_id}",
    tags=["Playlists"],
    summary="Get a playlist by ID",
    description="Retrieve playlist information including linked versions.",
    response_model=Playlist,
)
async def get_playlist(playlist_id: int, provider: ShotGridDep) -> Playlist:
    """Get a playlist entity by its ID."""
    try:
        return cast(Playlist, provider.get_entity("playlist", playlist_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/shot/{shot_id}",
    tags=["Shots"],
    summary="Get a shot by ID",
    description="Retrieve shot information from the production tracking system.",
    response_model=Shot,
)
async def get_shot(shot_id: int, provider: ShotGridDep) -> Shot:
    """Get a shot entity by its ID."""
    try:
        return cast(Shot, provider.get_entity("shot", shot_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/asset/{asset_id}",
    tags=["Assets"],
    summary="Get an asset by ID",
    description="Retrieve asset information from the production tracking system.",
    response_model=Asset,
)
async def get_asset(asset_id: int, provider: ShotGridDep) -> Asset:
    """Get an asset entity by its ID."""
    try:
        return cast(Asset, provider.get_entity("asset", asset_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/task/{task_id}",
    tags=["Tasks"],
    summary="Get a task by ID",
    description="Retrieve task information from the production tracking system.",
    response_model=Task,
)
async def get_task(task_id: int, provider: ShotGridDep) -> Task:
    """Get a task entity by its ID."""
    try:
        return cast(Task, provider.get_entity("task", task_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/note/{note_id}",
    tags=["Notes"],
    summary="Get a note by ID",
    description="Retrieve note information from the production tracking system.",
    response_model=Note,
)
async def get_note(note_id: int, provider: ShotGridDep) -> Note:
    """Get a note entity by its ID."""
    try:
        return cast(Note, provider.get_entity("note", note_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
