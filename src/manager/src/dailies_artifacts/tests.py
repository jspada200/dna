from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ArtifactViewSetTests(APITestCase):
    def test_artifact_list_accessible(self):
        url = reverse("artifact-list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_artifact_create(self):
        url = reverse("artifact-list")
        data = {"name": "Test Artifact", "description": "This is a test artifact."}
        response = self.client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == data["name"]
        assert response.data["description"] == data["description"]
