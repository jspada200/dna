import styled from 'styled-components';
import { VersionHeader } from './VersionHeader';
import { NoteEditor } from './NoteEditor';
import { AssistantPanel } from './AssistantPanel';

interface ContentAreaProps {
  shotCode?: string;
  versionNumber?: string;
  submittedBy?: string;
  submittedByImageUrl?: string;
  dateSubmitted?: string;
  versionStatus?: string;
  links?: string[];
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
`;

export function ContentArea({
  shotCode,
  versionNumber,
  submittedBy,
  submittedByImageUrl,
  dateSubmitted,
  versionStatus,
  links,
}: ContentAreaProps) {
  return (
    <ContentWrapper>
      <VersionHeader
        shotCode={shotCode}
        versionNumber={versionNumber}
        submittedBy={submittedBy}
        submittedByImageUrl={submittedByImageUrl}
        dateSubmitted={dateSubmitted}
        versionStatus={versionStatus}
        links={links}
      />
      <NoteEditor />
      <AssistantPanel />
    </ContentWrapper>
  );
}
