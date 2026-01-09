from dna.models.entity import ENTITY_MODELS, EntityBase


class ProdtrackProviderBase:
    def __init__(self):
        pass

    def _get_object_type(self, object_type: str) -> type[EntityBase]:
        """Get the model class from the entity type string."""
        return ENTITY_MODELS.get(object_type, EntityBase)

    def get_entity(self, entity_type: str, entity_id: int) -> "EntityBase":
        """Get an entity by its ID."""
        raise NotImplementedError("Subclasses must implement this method.")
