"""Tests for the in-memory Event Publisher."""

import pytest

from dna.events import EventType, reset_event_publisher
from dna.events.event_publisher import EventPublisher, get_event_publisher


class TestEventPublisher:
    """Tests for EventPublisher class."""

    def test_init_creates_empty_subscribers(self):
        """Test initialization creates empty subscriber lists."""
        publisher = EventPublisher()
        assert publisher._subscribers == {}
        assert publisher._global_subscribers == []

    @pytest.mark.asyncio
    async def test_connect_is_noop(self):
        """Test that connect is a no-op for in-memory publisher."""
        publisher = EventPublisher()
        await publisher.connect()

    @pytest.mark.asyncio
    async def test_publish_calls_type_subscribers(self):
        """Test that publish calls subscribers for the event type."""
        publisher = EventPublisher()
        received_events = []

        async def callback(event_type, payload):
            received_events.append((event_type, payload))

        publisher.subscribe(EventType.SEGMENT_CREATED, callback)
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data"})

        assert len(received_events) == 1
        assert received_events[0] == (EventType.SEGMENT_CREATED, {"test": "data"})

    @pytest.mark.asyncio
    async def test_publish_does_not_call_other_type_subscribers(self):
        """Test that publish only calls subscribers for the matching event type."""
        publisher = EventPublisher()
        received_events = []

        async def callback(event_type, payload):
            received_events.append((event_type, payload))

        publisher.subscribe(EventType.SEGMENT_CREATED, callback)
        await publisher.publish(EventType.SEGMENT_UPDATED, {"test": "data"})

        assert len(received_events) == 0

    @pytest.mark.asyncio
    async def test_publish_calls_global_subscribers(self):
        """Test that publish calls global subscribers for any event."""
        publisher = EventPublisher()
        received_events = []

        async def callback(event_type, payload):
            received_events.append((event_type, payload))

        publisher.subscribe_all(callback)
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data"})
        await publisher.publish(EventType.SEGMENT_UPDATED, {"test": "data2"})

        assert len(received_events) == 2
        assert received_events[0] == (EventType.SEGMENT_CREATED, {"test": "data"})
        assert received_events[1] == (EventType.SEGMENT_UPDATED, {"test": "data2"})

    @pytest.mark.asyncio
    async def test_publish_calls_multiple_subscribers(self):
        """Test that publish calls all subscribers for an event type."""
        publisher = EventPublisher()
        received_events_1 = []
        received_events_2 = []

        async def callback1(event_type, payload):
            received_events_1.append(payload)

        async def callback2(event_type, payload):
            received_events_2.append(payload)

        publisher.subscribe(EventType.SEGMENT_CREATED, callback1)
        publisher.subscribe(EventType.SEGMENT_CREATED, callback2)
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data"})

        assert len(received_events_1) == 1
        assert len(received_events_2) == 1

    @pytest.mark.asyncio
    async def test_subscribe_returns_unsubscribe_function(self):
        """Test that subscribe returns a function to unsubscribe."""
        publisher = EventPublisher()
        received_events = []

        async def callback(event_type, payload):
            received_events.append(payload)

        unsubscribe = publisher.subscribe(EventType.SEGMENT_CREATED, callback)
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data1"})
        unsubscribe()
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data2"})

        assert len(received_events) == 1
        assert received_events[0] == {"test": "data1"}

    @pytest.mark.asyncio
    async def test_subscribe_all_returns_unsubscribe_function(self):
        """Test that subscribe_all returns a function to unsubscribe."""
        publisher = EventPublisher()
        received_events = []

        async def callback(event_type, payload):
            received_events.append(payload)

        unsubscribe = publisher.subscribe_all(callback)
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data1"})
        unsubscribe()
        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data2"})

        assert len(received_events) == 1

    @pytest.mark.asyncio
    async def test_publish_handles_callback_errors(self):
        """Test that publish continues even if a callback raises an error."""
        publisher = EventPublisher()
        received_events = []

        async def failing_callback(event_type, payload):
            raise Exception("Test error")

        async def working_callback(event_type, payload):
            received_events.append(payload)

        publisher.subscribe(EventType.SEGMENT_CREATED, failing_callback)
        publisher.subscribe(EventType.SEGMENT_CREATED, working_callback)

        await publisher.publish(EventType.SEGMENT_CREATED, {"test": "data"})

        assert len(received_events) == 1

    @pytest.mark.asyncio
    async def test_close_clears_all_subscribers(self):
        """Test that close clears all subscribers."""
        publisher = EventPublisher()

        async def callback(event_type, payload):
            pass

        publisher.subscribe(EventType.SEGMENT_CREATED, callback)
        publisher.subscribe_all(callback)

        assert len(publisher._subscribers) > 0
        assert len(publisher._global_subscribers) > 0

        await publisher.close()

        assert len(publisher._subscribers) == 0
        assert len(publisher._global_subscribers) == 0


class TestGetEventPublisher:
    """Tests for get_event_publisher function."""

    def setup_method(self):
        """Reset singleton before each test."""
        reset_event_publisher()

    def teardown_method(self):
        """Reset singleton after each test."""
        reset_event_publisher()

    def test_get_event_publisher_returns_singleton(self):
        """Test that get_event_publisher returns same instance."""
        publisher1 = get_event_publisher()
        publisher2 = get_event_publisher()

        assert publisher1 is publisher2

    def test_get_event_publisher_creates_new_if_none(self):
        """Test that get_event_publisher creates new instance if none exists."""
        publisher = get_event_publisher()

        assert publisher is not None
        assert isinstance(publisher, EventPublisher)
