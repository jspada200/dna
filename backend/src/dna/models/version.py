from dna.models.entity import EntityBase
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from dna.prodtrack_providers.prodtrack_provider_base import ProdtrackProviderBase

class Version(EntityBase):
    def __init__(self, provider: "ProdtrackProviderBase"):
        super().__init__(provider)
