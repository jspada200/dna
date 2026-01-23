"""RabbitMQ event consumer worker."""

import asyncio
import json
import logging
import os
import signal
import sys
from typing import Any

import aio_pika
from aio_pika.abc import AbstractIncomingMessage

from dna.events import EventType

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://dna:dna@localhost:5672/dna")
EVENTS_EXCHANGE = "dna.events"
EVENTS_QUEUE = "dna.events.worker"


class EventWorker:
    def __init__(self, rabbitmq_url: str = RABBITMQ_URL):
        self.rabbitmq_url = rabbitmq_url
        self.connection: aio_pika.RobustConnection | None = None
        self.channel: aio_pika.Channel | None = None
        self.should_stop = False

    async def connect(self) -> None:
        logger.info("Connecting to RabbitMQ at %s", self.rabbitmq_url)
        self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
        self.channel = await self.connection.channel()
        await self.channel.set_qos(prefetch_count=10)

        exchange = await self.channel.declare_exchange(
            EVENTS_EXCHANGE,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )

        queue = await self.channel.declare_queue(
            EVENTS_QUEUE,
            durable=True,
        )

        await queue.bind(exchange, routing_key="#")

        logger.info(
            "Connected to RabbitMQ, listening for events on queue: %s", EVENTS_QUEUE
        )

    async def process_message(self, message: AbstractIncomingMessage) -> None:
        async with message.process():
            try:
                body = json.loads(message.body.decode())
                event_type = message.routing_key
                logger.info("Received event: %s", event_type)
                await self.handle_event(event_type, body)
            except json.JSONDecodeError as e:
                logger.error("Failed to decode message: %s", e)
            except Exception as e:
                logger.exception("Error processing message: %s", e)

    async def handle_event(
        self, event_type: str | None, payload: dict[str, Any]
    ) -> None:
        match event_type:
            case EventType.TRANSCRIPTION_SUBSCRIBE:
                await self.on_transcription_subscribe(payload)
            case EventType.TRANSCRIPTION_STARTED:
                await self.on_transcription_started(payload)
            case EventType.TRANSCRIPTION_UPDATED:
                await self.on_transcription_updated(payload)
            case EventType.TRANSCRIPTION_COMPLETED:
                await self.on_transcription_completed(payload)
            case EventType.TRANSCRIPTION_ERROR:
                await self.on_transcription_error(payload)
            case EventType.BOT_STATUS_CHANGED:
                await self.on_bot_status_changed(payload)
            case EventType.PLAYLIST_UPDATED:
                await self.on_playlist_updated(payload)
            case EventType.VERSION_UPDATED:
                await self.on_version_updated(payload)
            case EventType.DRAFT_NOTE_UPDATED:
                await self.on_draft_note_updated(payload)
            case _:
                logger.warning("Unknown event type: %s", event_type)

    async def on_transcription_subscribe(self, payload: dict[str, Any]) -> None:
        logger.info("Transcription subscribe: %s", payload)

    async def on_transcription_started(self, payload: dict[str, Any]) -> None:
        logger.info("Transcription started: %s", payload)

    async def on_transcription_updated(self, payload: dict[str, Any]) -> None:
        logger.info("Transcription updated: %s", payload)

    async def on_transcription_completed(self, payload: dict[str, Any]) -> None:
        logger.info("Transcription completed: %s", payload)

    async def on_transcription_error(self, payload: dict[str, Any]) -> None:
        logger.error("Transcription error: %s", payload)

    async def on_bot_status_changed(self, payload: dict[str, Any]) -> None:
        logger.info("Bot status changed: %s", payload)

    async def on_playlist_updated(self, payload: dict[str, Any]) -> None:
        logger.info("Playlist updated: %s", payload)

    async def on_version_updated(self, payload: dict[str, Any]) -> None:
        logger.info("Version updated: %s", payload)

    async def on_draft_note_updated(self, payload: dict[str, Any]) -> None:
        logger.info("Draft note updated: %s", payload)

    async def start(self) -> None:
        await self.connect()

        if self.channel is None:
            raise RuntimeError("Channel not initialized")

        queue = await self.channel.get_queue(EVENTS_QUEUE)
        await queue.consume(self.process_message)

        logger.info("Worker started, waiting for events...")

        while not self.should_stop:
            await asyncio.sleep(1)

    async def stop(self) -> None:
        logger.info("Stopping worker...")
        self.should_stop = True
        if self.connection:
            await self.connection.close()
        logger.info("Worker stopped")


async def main() -> None:
    worker = EventWorker()

    loop = asyncio.get_event_loop()

    def signal_handler() -> None:
        logger.info("Received shutdown signal")
        asyncio.create_task(worker.stop())

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)

    try:
        await worker.start()
    except KeyboardInterrupt:
        await worker.stop()
    except Exception as e:
        logger.exception("Worker failed: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
