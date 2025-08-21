from django.urls import reverse
from .models import Artifact
from scheduler.models import Schedule
from rest_framework import status
from rest_framework.test import APITestCase


class ArtifactViewSetTests(APITestCase):

    def setUp(self):

        self.new_schedule = Schedule.objects.create(
            status="pending",
            starttime="2023-01-01T00:00:00Z",
            endtime="2023-01-01T01:00:00Z",
            metadata="{}",
            playlistid="123",
            meetingtype="meet"
        )

        self.new_artifact = Artifact.objects.create(
            transcript="{}",
            context="{}",
            timestamp="2023-01-01T00:00:00Z",
            artifact_link=self.new_schedule
        )

    def test_artifact_list_accessible(self):
        url = reverse("artifact-list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_artifact_create(self):
        url = reverse("artifact-list")
        data = {
            "transcript": "{}",
            "context": "{}",
            "timestamp": "2023-01-01T00:00:00Z",
            "artifact_link": self.new_schedule.id
        }
        response = self.client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["transcript"] == data["transcript"]
        assert response.data["context"] == data["context"]
        assert response.data["timestamp"] == data["timestamp"]
        assert response.data["artifact_link"] == data["artifact_link"]

    def test_artifact_retrieve(self):
        url = reverse("artifact-detail", args=[self.new_artifact.id])
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == self.new_artifact.id

    def test_artifact_str(self):
        assert str(self.new_artifact) == f"Artifact at {self.new_artifact.timestamp}"