from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ScheduleViewSetTests(APITestCase):
    def test_schedule_list_accessible(self):
        url = reverse("schedule-list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
