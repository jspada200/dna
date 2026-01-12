import { useState } from 'react';
import { Playlist, Project, Version } from '@dna/core';
import { Layout, ContentArea, ProjectSelector } from './components';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const handleSelectionComplete = (
    project: Project,
    playlist: Playlist,
    email: string
  ) => {
    setSelectedProject(project);
    setSelectedPlaylist(playlist);
    setUserEmail(email);
  };

  const handleReplacePlaylist = () => {
    setSelectedPlaylist(null);
    setSelectedVersion(null);
  };

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
  };

  if (!selectedProject || !selectedPlaylist || !userEmail) {
    return <ProjectSelector onSelectionComplete={handleSelectionComplete} />;
  }

  return (
    <Layout
      onReplacePlaylist={handleReplacePlaylist}
      playlistId={selectedPlaylist.id}
      selectedVersionId={selectedVersion?.id}
      onVersionSelect={handleVersionSelect}
    >
      <ContentArea />
    </Layout>
  );
}

export default App;
