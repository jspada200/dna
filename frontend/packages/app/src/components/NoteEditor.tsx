import styled from 'styled-components';
import { NoteOptionsInline } from './NoteOptionsInline';

interface NoteEditorProps {
  toValue?: string;
  ccValue?: string;
  subjectValue?: string;
  linksValue?: string;
  versionStatus?: string;
  notesValue?: string;
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
  font-size: 22px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TextArea = styled.textarea`
  padding: 12px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.bg.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.subtle};
  }
`;

const ToolbarPlaceholder = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  background: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

export function NoteEditor({
  toValue = '',
  ccValue = '',
  subjectValue = '',
  linksValue = '',
  versionStatus = '',
  notesValue = '',
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

      <FieldGroup>
        <FieldLabel>Notes</FieldLabel>
        <TextArea placeholder="Placeholder" defaultValue={notesValue} />
      </FieldGroup>

      <ToolbarPlaceholder>
        Text Toolbar w/ undo/redo/ text controls/ and screenshot
      </ToolbarPlaceholder>
    </EditorWrapper>
  );
}
