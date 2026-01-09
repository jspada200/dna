"""ShotGrid production tracking provider implementation."""

import os
from typing import Optional

from dna.models.entity import EntityBase
from shotgun_api3 import Shotgun

from dna.prodtrack_providers.prodtrack_provider_base import ProdtrackProviderBase


FIELD_MAPPING = {
    "shot": {
        "entity_id": "Shot",
        "fields": {
            "id": "id",
            "code": "code",
            "description": "description",
        },
    },
    "asset": {
        "entity_id": "Asset",
        "fields": {
            "id": "id",
            "code": "code",
            "description": "description",
        },
    },
    "version": {
        "entity_id": "Version",
        "fields": {
            "id": "id",
            "code": "name",
            "description": "description",
            "sg_status_list": "status",
            "user": "user",
            "created_at": "created_at",
            "updated_at": "updated_at",
            "sg_path_to_movie": "movie_path",
            "sg_path_to_frames": "frame_path",
        },
        "linked_fields": {
            "entity": "entity",
        }
    },
    "playlist": {
        "entity_id": "Playlist",
        "fields": {
            "id": "id",
            "code": "code",
            "description": "description",
            "project": "project",
            "created_at": "created_at",
            "updated_at": "updated_at",
        },
        "linked_fields": {
            "versions": "version"
        }
    },
}



class ShotgridProvider(ProdtrackProviderBase):
    """ShotGrid provider for production tracking operations."""

    def __init__(
        self,
        url: Optional[str] = None,
        script_name: Optional[str] = None,
        api_key: Optional[str] = None,
        connect: bool = True,
    ):
        """Initialize the ShotGrid connection.

        Args:
            url: ShotGrid server URL. Defaults to SHOTGRID_URL env var.
            script_name: API script name. Defaults to SHOTGRID_SCRIPT_NAME env var.
            api_key: API key for authentication. Defaults to SHOTGRID_API_KEY env var.
        """
        super().__init__()

        self.url = url or os.getenv("SHOTGRID_URL")
        self.script_name = script_name or os.getenv("SHOTGRID_SCRIPT_NAME")
        self.api_key = api_key or os.getenv("SHOTGRID_API_KEY")

        if not all([self.url, self.script_name, self.api_key]):
            raise ValueError(
                "ShotGrid credentials not provided. Set SHOTGRID_URL, "
                "SHOTGRID_SCRIPT_NAME, and SHOTGRID_API_KEY environment variables."
            )

        self.sg = None
        if connect:
            self._connect()


    def _connect(self):
        """Connect to ShotGrid."""
        self.sg = Shotgun(self.url, self.script_name, self.api_key)
    
    def get_entity(self, entity_type: str, entity_id: int) -> EntityBase:
        """
        Get an entity by its ID.
        
        Using the field mapping, we get the entity from ShotGrid and then we create the entity object.
        """
        if not self.sg:
            raise ValueError("Not connected to ShotGrid")
        
        linked_fields = FIELD_MAPPING[entity_type].get("linked_fields", {})
        field_names = list(linked_fields.values())
        field_names.extend(list(FIELD_MAPPING[entity_type]["fields"].keys()))
        
        entity = self.sg.find_one(
            FIELD_MAPPING[entity_type]["entity_id"],
            filters=[["id", "is", entity_id]],
            fields=field_names
        )

        if not entity:
            raise ValueError(f"Entity not found: {entity_type} {entity_id}")

        obj_type = self._get_object_type(entity_type)
        obj = obj_type(self)

        setattr(obj, "_impl", entity)
        
        for sg_name, dna_name in FIELD_MAPPING[entity_type]["fields"].items():
            setattr(obj, dna_name, entity.get(sg_name))

        for linked_field_name in linked_fields.keys():
            def __populate_linked_field(entity_data: dict | list | None) -> dict | list | None:
                if isinstance(entity_data, dict):
                    return self.get_entity(_get_dna_entity_type(entity_data["type"]), entity_data["id"])
                
                elif isinstance(entity_data, list):
                    return [self.get_entity(_get_dna_entity_type(item["type"]), item["id"]) for item in entity_data]
                return None
            setattr(obj, linked_field_name, __populate_linked_field(entity[linked_field_name]))

        return obj


def _get_dna_entity_type(sg_entity_type: str) -> str:
    """Get the DNA entity type from the ShotGrid entity type."""
    for entity_type, entity_data in FIELD_MAPPING.items():
        if entity_data["entity_id"] == sg_entity_type:
            return entity_type
    raise ValueError(f"Unknown entity type: {sg_entity_type}")