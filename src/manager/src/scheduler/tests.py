from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase



from .models import Schedule


class ScheduleViewSetTests(APITestCase):

    def setUp(self):
        self.new_schedule = Schedule.objects.create(
            status="pending",
            starttime="2023-01-01T00:00:00Z",
            endtime="2023-01-01T01:00:00Z",
            metadata="{}",
            playlistid="123",
            meetingtype="meet"
        )

    def test_schedule_list_accessible(self):
        url = reverse("schedule-list")
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_schedule_create(self):
        url = reverse("schedule-list")
        data = {
            "status": "pending",
            "starttime": "2023-01-01T00:00:00Z",
            "endtime": "2023-01-01T01:00:00Z",
            "metadata": "{}",
            "playlistid": "456",
            "meetingtype": "review"
        }
        response = self.client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == data["status"]
        assert response.data["starttime"] == data["starttime"]
        assert response.data["endtime"] == data["endtime"]
        assert response.data["metadata"] == data["metadata"]
        assert response.data["playlistid"] == data["playlistid"]
        assert response.data["meetingtype"] == data["meetingtype"]

    def test_schedule_retrieve(self):
        url = reverse("schedule-detail", args=[self.new_schedule.id])
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == self.new_schedule.id

    def test_schedule_str(self):
        assert str(self.new_schedule) == f"Schedule {self.new_schedule.id} ({self.new_schedule.status})"
