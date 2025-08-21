from rest_framework import viewsets

from .models import Artifact
from .serializers import ArtifactSerializer


class ArtifactViewSet(viewsets.ModelViewSet):
    queryset = Artifact.objects.all()
    serializer_class = ArtifactSerializer
