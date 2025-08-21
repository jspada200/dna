from django.db import models


class Artifact(models.Model):
    transcript = models.JSONField()
    context = models.JSONField()
    timestamp = models.DateTimeField()
    artifact_link = models.ForeignKey("scheduler.Schedule", on_delete=models.CASCADE)

    def __str__(self):
        return f"Artifact at {self.timestamp}"
