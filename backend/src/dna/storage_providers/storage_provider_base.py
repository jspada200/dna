"""Storage Provider Base.

Abstract base class for storage providers and factory function.
"""

import os
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from dna.models.draft_note import DraftNote, DraftNoteUpdate


class StorageProviderBase:
    """Abstract base class for storage providers."""

    async def get_draft_notes_for_version(
        self, playlist_id: int, version_id: int
    ) -> list["DraftNote"]:
        """Get all draft notes for a playlist/version (all users)."""
        raise NotImplementedError()

    async def get_draft_note(
        self, user_email: str, playlist_id: int, version_id: int
    ) -> Optional["DraftNote"]:
        """Get a draft note by composite key (user_email, playlist_id, version_id)."""
        raise NotImplementedError()

    async def upsert_draft_note(
        self,
        user_email: str,
        playlist_id: int,
        version_id: int,
        data: "DraftNoteUpdate",
    ) -> "DraftNote":
        """Create or update a draft note."""
        raise NotImplementedError()

    async def delete_draft_note(
        self, user_email: str, playlist_id: int, version_id: int
    ) -> bool:
        """Delete a draft note. Returns True if deleted."""
        raise NotImplementedError()


def get_storage_provider() -> StorageProviderBase:
    """Factory function to get the configured storage provider."""
    provider_type = os.getenv("STORAGE_PROVIDER", "mongodb")

    if provider_type == "mongodb":
        from dna.storage_providers.mongodb import MongoDBStorageProvider

        return MongoDBStorageProvider()

    raise ValueError(f"Unknown storage provider: {provider_type}")
