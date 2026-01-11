import styled from 'styled-components';
import { Select } from '@radix-ui/themes';
import { ChevronDown } from 'lucide-react';

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
  gap: 10px;
  padding: 14px;
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

const FieldRow = styled.div`
  display: flex;
  gap: 10px;
`;

const FieldGroup = styled.div<{ $flex?: number }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: ${({ $flex }) => $flex ?? 1};
`;

const FieldLabel = styled.label`
  font-size: 11px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TextInput = styled.input`
  padding: 6px 10px;
  font-size: 13px;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.bg.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.subtle};
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const StyledSelect = styled.select`
  appearance: none;
  width: 100%;
  padding: 6px 30px 6px 10px;
  font-size: 13px;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.muted};
  background: ${({ theme }) => theme.colors.bg.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  outline: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.subtle};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const SelectIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const TextArea = styled.textarea`
  padding: 8px 10px;
  font-size: 13px;
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
  padding: 6px 10px;
  font-size: 11px;
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

      <FieldRow>
        <FieldGroup>
          <FieldLabel>To</FieldLabel>
          <TextInput
            type="text"
            placeholder="Placeholder"
            defaultValue={toValue}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>CC</FieldLabel>
          <TextInput
            type="text"
            placeholder="Placeholder"
            defaultValue={ccValue}
          />
        </FieldGroup>
      </FieldRow>

      <FieldGroup>
        <FieldLabel>Subject</FieldLabel>
        <TextInput
          type="text"
          placeholder="Placeholder"
          defaultValue={subjectValue}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Links</FieldLabel>
        <TextInput
          type="text"
          placeholder="Placeholder"
          defaultValue={linksValue}
        />
      </FieldGroup>

      <FieldGroup $flex={0}>
        <FieldLabel>Version Status</FieldLabel>
        <SelectWrapper>
          <StyledSelect defaultValue={versionStatus}>
            <option value="" disabled>
              Select...
            </option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="final">Final</option>
          </StyledSelect>
          <SelectIcon>
            <ChevronDown size={16} />
          </SelectIcon>
        </SelectWrapper>
      </FieldGroup>

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
