from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ArtifactViewSetTests(APITestCase):
    def test_artifact_list_accessible(self):
        url = reverse("artifact-list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_artifact_create(self):
        # First create a Schedule so we have somthing to link to.
        url = reverse("schedule-list")
        response = self.client.post(
            url,
            {"status": "pending", 
             "starttime": "2023-01-01T00:00:00Z",
             "endtime": "2023-01-01T01:00:00Z",
             "metadata": "{}",
             "playlistid": "123",
             "meetingtype": "meet"
             }, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        schedule_id = response.data["id"]

        url = reverse("artifact-list")
        data = {
            "transcript": "{}",
            "context": "{}",
            "timestamp": "2023-01-01T00:00:00Z",
            "artifact_link": schedule_id
        }
        response = self.client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["transcript"] == data["transcript"]
        assert response.data["context"] == data["context"]
        assert response.data["timestamp"] == data["timestamp"]
        assert response.data["artifact_link"] == data["artifact_link"]
