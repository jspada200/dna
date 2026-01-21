"""Vexa Transcription Provider.

Implementation of the transcription provider using Vexa API.
"""

import os
from datetime import datetime
from typing import Optional

import httpx

from dna.models.transcription import (
    BotSession,
    BotStatus,
    BotStatusEnum,
    Platform,
    Transcript,
    TranscriptSegment,
)
from dna.transcription_providers.transcription_provider_base import (
    TranscriptionProviderBase,
)


class VexaTranscriptionProvider(TranscriptionProviderBase):
    """Transcription provider implementation using Vexa API."""

    def __init__(self):
        self.base_url = os.getenv("VEXA_API_URL", "https://api.cloud.vexa.ai")
        self.api_key = os.getenv("VEXA_API_KEY", "")
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "X-API-Key": self.api_key,
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    async def dispatch_bot(
        self,
        platform: Platform,
        meeting_id: str,
        playlist_id: int,
        passcode: Optional[str] = None,
        bot_name: Optional[str] = None,
        language: Optional[str] = None,
    ) -> BotSession:
        """Dispatch a bot to join a meeting and start transcription."""
        payload = {
            "platform": platform.value,
            "native_meeting_id": meeting_id,
        }

        if passcode:
            payload["passcode"] = passcode
        if bot_name:
            payload["bot_name"] = bot_name
        if language:
            payload["language"] = language

        response = await self.client.post("/bots", json=payload)
        response.raise_for_status()

        return BotSession(
            platform=platform,
            meeting_id=meeting_id,
            playlist_id=playlist_id,
            status=BotStatusEnum.JOINING,
            bot_name=bot_name,
            language=language,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

    async def stop_bot(self, platform: Platform, meeting_id: str) -> bool:
        """Stop a bot that is currently in a meeting."""
        response = await self.client.delete(f"/bots/{platform.value}/{meeting_id}")
        return response.status_code == 200

    async def get_bot_status(self, platform: Platform, meeting_id: str) -> BotStatus:
        """Get the current status of a bot."""
        try:
            response = await self.client.get(
                f"/bots/{platform.value}/{meeting_id}/status"
            )
            response.raise_for_status()
            data = response.json()

            status_map = {
                "idle": BotStatusEnum.IDLE,
                "joining": BotStatusEnum.JOINING,
                "in_call": BotStatusEnum.IN_CALL,
                "transcribing": BotStatusEnum.TRANSCRIBING,
                "failed": BotStatusEnum.FAILED,
                "stopped": BotStatusEnum.STOPPED,
                "completed": BotStatusEnum.COMPLETED,
            }

            return BotStatus(
                platform=platform,
                meeting_id=meeting_id,
                status=status_map.get(data.get("status", "idle"), BotStatusEnum.IDLE),
                message=data.get("message"),
                updated_at=datetime.utcnow(),
            )
        except httpx.HTTPStatusError:
            return BotStatus(
                platform=platform,
                meeting_id=meeting_id,
                status=BotStatusEnum.IDLE,
                message="Bot not found",
                updated_at=datetime.utcnow(),
            )

    async def get_transcript(self, platform: Platform, meeting_id: str) -> Transcript:
        """Get the full transcript for a meeting."""
        response = await self.client.get(f"/transcripts/{platform.value}/{meeting_id}")
        response.raise_for_status()
        data = response.json()

        segments = [
            TranscriptSegment(
                text=seg.get("text", ""),
                speaker=seg.get("speaker"),
                start_time=seg.get("start_time"),
                end_time=seg.get("end_time"),
            )
            for seg in data.get("segments", [])
        ]

        return Transcript(
            platform=platform,
            meeting_id=meeting_id,
            segments=segments,
            language=data.get("language"),
            duration=data.get("duration"),
        )

    async def close(self):
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
