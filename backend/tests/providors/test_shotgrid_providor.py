import pytest
from unittest import mock

from dna.prodtrack_providers.shotgrid import ShotgridProvider



@pytest.fixture
def shotgrid_provider():
    sg_provider = ShotgridProvider(connect=False)
    
    mock_sg = mock.MagicMock()
    sg_provider.sg = mock_sg
    
    return sg_provider



def test_get_version(shotgrid_provider):
    shotgrid_provider.sg.reset_mock()
    
    shotgrid_provider.sg.find_one.return_value = {
        "id": 1,
        "code": "V001",
        "description": "Version 1",
        "sg_status_list": "Completed",
        "entity": "Entity 1",
        "project": "Project 1",
        "user": "User 1",
        "created_at": "2021-01-01",
        "updated_at": "2021-01-01",
        "sg_path_to_movie": "path/to/movie",
        "sg_path_to_frames": "path/to/frames",
    }

    version = shotgrid_provider.get_entity("version", 1)
    assert version.id == 1
    assert version.name == "V001"
    assert version.description == "Version 1"
    assert version.status == "Completed"
    assert version.movie_path == "path/to/movie"
    assert version.frame_path == "path/to/frames"


def test_missing_credentials_raises_error():
    """Test that missing credentials raises ValueError."""
    with mock.patch.dict("os.environ", {}, clear=True):
        with pytest.raises(ValueError, match="ShotGrid credentials not provided"):
            ShotgridProvider(url=None, script_name=None, api_key=None, connect=False)


def test_connect_creates_shotgun_instance():
    """Test that _connect() creates a Shotgun instance."""
    with mock.patch("dna.prodtrack_providers.shotgrid.Shotgun") as mock_shotgun:
        provider = ShotgridProvider(
            url="https://test.shotgunstudio.com",
            script_name="test_script",
            api_key="test_key",
            connect=True,
        )
        mock_shotgun.assert_called_once_with(
            "https://test.shotgunstudio.com", "test_script", "test_key"
        )
        assert provider.sg == mock_shotgun.return_value


def test_get_entity_when_not_connected():
    """Test that get_entity raises error when not connected."""
    provider = ShotgridProvider(
        url="https://test.shotgunstudio.com",
        script_name="test_script",
        api_key="test_key",
        connect=False,
    )
    # sg is None when connect=False and we don't set it
    with pytest.raises(ValueError, match="Not connected to ShotGrid"):
        provider.get_entity("version", 1)


def test_get_entity_not_found(shotgrid_provider):
    """Test that get_entity raises error when entity not found."""
    shotgrid_provider.sg.find_one.return_value = None
    
    with pytest.raises(ValueError, match="Entity not found: version 123"):
        shotgrid_provider.get_entity("version", 123)




def test_version_with_linked_shot_entity(shotgrid_provider):
    """Test that a version's linked entity (Shot) is populated correctly."""
    # ShotGrid returns linked entities as dicts with id, name, type
    version_data = {
        "type": "Version",
        "id": 673,
        "entity": {"id": 1002, "name": "bunny_080_0010", "type": "Shot"},
        "code": "bunny_080_0010_layout_v001",
        "description": "Test description",
        "sg_status_list": "rev",
        "user": {"id": 24, "name": "ShotGrid Support", "type": "HumanUser"},
        "created_at": "2015-12-01T16:43:43",
        "updated_at": "2017-04-19T15:13:05",
        "sg_path_to_movie": None,
        "sg_path_to_frames": None,
    }
    
    shot_data = {
        "type": "Shot",
        "id": 1002,
        "code": "bunny_080_0010",
        "description": "Shot description",
    }
    
    # Mock find_one to return version first, then shot when linked field is fetched
    shotgrid_provider.sg.find_one.side_effect = [version_data, shot_data]
    
    version = shotgrid_provider.get_entity("version", 673)
    
    assert version.id == 673
    assert version.name == "bunny_080_0010_layout_v001"
    # The linked entity should be a Shot object
    assert version.entity is not None
    assert version.entity.id == 1002
    assert version.entity.code == "bunny_080_0010"

def test_version_with_linked_asset_entity(shotgrid_provider):
    """Test that a version's linked entity (Asset) is populated correctly."""
    version_data = {
        "type": "Version",
        "id": 100,
        "entity": {"id": 500, "name": "hero_character", "type": "Asset"},
        "code": "hero_character_rig_v002",
        "description": "Rig update",
        "sg_status_list": "apr",
        "user": {"id": 10, "name": "Artist", "type": "HumanUser"},
        "created_at": "2021-01-01",
        "updated_at": "2021-01-02",
        "sg_path_to_movie": "/path/to/movie.mov",
        "sg_path_to_frames": "/path/to/frames",
    }
    
    asset_data = {
        "type": "Asset",
        "id": 500,
        "code": "hero_character",
        "description": "Main hero character asset",
    }
    
    shotgrid_provider.sg.find_one.side_effect = [version_data, asset_data]
    
    version = shotgrid_provider.get_entity("version", 100)
    
    assert version.entity is not None
    assert version.entity.id == 500
    assert version.entity.code == "hero_character"

def test_version_with_null_linked_entity(shotgrid_provider):
    """Test that a version with no linked entity handles None correctly."""
    version_data = {
        "type": "Version",
        "id": 200,
        "entity": None,  # No linked entity
        "code": "standalone_version_v001",
        "description": "No entity linked",
        "sg_status_list": "wip",
        "user": None,
        "created_at": "2021-06-01",
        "updated_at": "2021-06-01",
        "sg_path_to_movie": None,
        "sg_path_to_frames": None,
    }
    
    shotgrid_provider.sg.find_one.return_value = version_data
    
    version = shotgrid_provider.get_entity("version", 200)
    
    assert version.id == 200
    assert version.entity is None

def test_playlist_with_linked_versions_list(shotgrid_provider):
    """Test that a playlist's linked versions list is populated correctly."""
    playlist_data = {
        "type": "Playlist",
        "id": 50,
        "code": "dailies_review_2021",
        "description": "Daily review playlist",
        "project": {"id": 1, "name": "Test Project", "type": "Project"},
        "created_at": "2021-03-01",
        "updated_at": "2021-03-15",
        "versions": [
            {"id": 101, "name": "shot_010_anim_v001", "type": "Version"},
            {"id": 102, "name": "shot_020_anim_v002", "type": "Version"},
        ],
    }
    
    version_1_data = {
        "type": "Version",
        "id": 101,
        "code": "shot_010_anim_v001",
        "description": "Animation pass 1",
        "sg_status_list": "rev",
        "user": None,
        "entity": None,
        "created_at": "2021-03-01",
        "updated_at": "2021-03-01",
        "sg_path_to_movie": None,
        "sg_path_to_frames": None,
    }
    
    version_2_data = {
        "type": "Version",
        "id": 102,
        "code": "shot_020_anim_v002",
        "description": "Animation pass 2",
        "sg_status_list": "apr",
        "user": None,
        "entity": None,
        "created_at": "2021-03-02",
        "updated_at": "2021-03-02",
        "sg_path_to_movie": None,
        "sg_path_to_frames": None,
    }
    
    shotgrid_provider.sg.find_one.side_effect = [
        playlist_data,
        version_1_data,
        version_2_data,
    ]
    
    playlist = shotgrid_provider.get_entity("playlist", 50)
    
    assert playlist.id == 50
    assert playlist.code == "dailies_review_2021"
    assert playlist.versions is not None
    assert len(playlist.versions) == 2
    assert playlist.versions[0].id == 101
    assert playlist.versions[0].name == "shot_010_anim_v001"
    assert playlist.versions[1].id == 102
    assert playlist.versions[1].name == "shot_020_anim_v002"

def test_playlist_with_empty_versions_list(shotgrid_provider):
    """Test that a playlist with no versions handles empty list correctly."""
    playlist_data = {
        "type": "Playlist",
        "id": 60,
        "code": "empty_playlist",
        "description": "Empty playlist",
        "project": {"id": 1, "name": "Test Project", "type": "Project"},
        "created_at": "2021-04-01",
        "updated_at": "2021-04-01",
        "versions": [],
    }
    
    shotgrid_provider.sg.find_one.return_value = playlist_data
    
    playlist = shotgrid_provider.get_entity("playlist", 60)
    
    assert playlist.id == 60
    assert playlist.versions == []
