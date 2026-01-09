from dna.models.version import Version
from dna.models.playlist import Playlist
from dna.models.entity import EntityBase, Shot, Asset

class ProdtrackProviderBase:
    def __init__(self):
        pass
    
    def _get_object_type(self, object_type: str) -> EntityBase:
        """Get the object type from the object type string."""
        mapping = {
            "version": Version,
            "playlist": Playlist,
            "shot": Shot,
            "asset": Asset,
        }
        return mapping.get(object_type)

    def get_entity(self, entity_type: str, entity_id: int) -> EntityBase:
        """Get an entity by its ID."""
        raise NotImplementedError("Subclasses must implement this method.")