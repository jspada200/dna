from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from dna.prodtrack_providers.prodtrack_provider_base import ProdtrackProviderBase


class EntityBase:
    def __init__(self, provider: "ProdtrackProviderBase"):
        self.provider = provider

class Shot(EntityBase):
    def __init__(self, provider: "ProdtrackProviderBase"):
        super().__init__(provider)

class Asset(EntityBase):
    def __init__(self, provider: "ProdtrackProviderBase"):
        super().__init__(provider)