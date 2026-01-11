import styled from 'styled-components';
import { Bot, ChevronDown, Copy, ClipboardCopy } from 'lucide-react';

interface AssistantNoteProps {
  noteContent?: string;
}

const NoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NoteTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BotIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RegenerateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.accent.main};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${({ theme }) => theme.colors.accent.main};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

const NoteContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding-left: 32px;
`;

const NoteActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 32px;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    color: ${({ theme }) => theme.colors.text.secondary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

export function AssistantNote({
  noteContent = "David thought that the lighting has come a long way. The flames could throw more light onto Indie's face. Add more high frequency noise to the flames coming off the torch.",
}: AssistantNoteProps) {
  return (
    <NoteWrapper>
      <NoteHeader>
        <NoteTitle>
          <BotIcon>
            <Bot size={14} />
          </BotIcon>
          Assistant's note
        </NoteTitle>
        <HeaderActions>
          <RegenerateButton>Regenerate</RegenerateButton>
          <ExpandButton>
            <ChevronDown size={14} />
          </ExpandButton>
        </HeaderActions>
      </NoteHeader>
      <NoteContent>{noteContent}</NoteContent>
      <NoteActions>
        <CopyButton title="Copy to clipboard">
          <Copy size={14} />
        </CopyButton>
        <CopyButton title="Copy as formatted">
          <ClipboardCopy size={14} />
        </CopyButton>
      </NoteActions>
    </NoteWrapper>
  );
}
