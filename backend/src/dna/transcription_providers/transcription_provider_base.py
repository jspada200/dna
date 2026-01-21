"""Transcription Provider Base.

Abstract base class for transcription providers and factory function.
"""

import os
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from dna.models.transcription import (
        BotSession,
        BotStatus,
        Platform,
        Transcript,
    )


class TranscriptionProviderBase:
    """Abstract base class for transcription providers."""

    async def dispatch_bot(
        self,
        platform: "Platform",
        meeting_id: str,
        playlist_id: int,
        passcode: Optional[str] = None,
        bot_name: Optional[str] = None,
        language: Optional[str] = None,
    ) -> "BotSession":
        """Dispatch a bot to join a meeting and start transcription."""
        raise NotImplementedError()

    async def stop_bot(self, platform: "Platform", meeting_id: str) -> bool:
        """Stop a bot that is currently in a meeting."""
        raise NotImplementedError()

    async def get_bot_status(
        self, platform: "Platform", meeting_id: str
    ) -> "BotStatus":
        """Get the current status of a bot."""
        raise NotImplementedError()

    async def get_transcript(
        self, platform: "Platform", meeting_id: str
    ) -> "Transcript":
        """Get the full transcript for a meeting."""
        raise NotImplementedError()

    async def close(self):
        """Clean up any resources."""
        pass


def get_transcription_provider() -> TranscriptionProviderBase:
    """Factory function to get the configured transcription provider."""
    provider_type = os.getenv("TRANSCRIPTION_PROVIDER", "vexa")

    if provider_type == "vexa":
        from dna.transcription_providers.vexa import VexaTranscriptionProvider

        return VexaTranscriptionProvider()

    raise ValueError(f"Unknown transcription provider: {provider_type}")
