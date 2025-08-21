from django.db import models


class Schedule(models.Model):
    id = models.AutoField(primary_key=True)
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("inprogress", "In Progress"),
        ("failed", "Failed"),
        ("done", "Done"),
    ]

    starttime = models.DateTimeField()
    endtime = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    metadata = models.JSONField()
    playlistid = models.CharField(max_length=255)
    meetingtype = models.CharField(max_length=50, default="meet")

    def __str__(self):
        return f"Schedule {self.id} ({self.status})"
