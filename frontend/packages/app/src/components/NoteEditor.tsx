import styled from 'styled-components';
import { NoteOptionsInline } from './NoteOptionsInline';
import { MarkdownEditor } from './MarkdownEditor';

interface NoteEditorProps {
  toValue?: string;
  ccValue?: string;
  subjectValue?: string;
  linksValue?: string;
  versionStatus?: string;
  notesValue?: string;
  onNotesChange?: (value: string) => void;
}

const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const EditorTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export function NoteEditor({
  toValue = '',
  ccValue = '',
  subjectValue = '',
  linksValue = '',
  versionStatus = '',
  notesValue = '',
  onNotesChange,
}: NoteEditorProps) {
  return (
    <EditorWrapper>
      <EditorTitle>New Note</EditorTitle>

      <NoteOptionsInline
        toValue={toValue}
        ccValue={ccValue}
        subjectValue={subjectValue}
        linksValue={linksValue}
        versionStatus={versionStatus}
      />

      <MarkdownEditor
        value={notesValue}
        onChange={onNotesChange}
        placeholder="Write your notes here... (supports **markdown**)"
        minHeight={120}
      />
    </EditorWrapper>
  );
}
