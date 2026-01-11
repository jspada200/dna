import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

interface ExpandableSearchProps {
  placeholder?: string;
}

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const InputField = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: ${({ $isOpen }) => ($isOpen ? '200px' : '0')};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: width 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 200ms ease-out;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 110px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.accent.main};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 13px;
  outline: none;
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.glow};
  transition: border-color ${({ theme }) => theme.transitions.base},
    box-shadow ${({ theme }) => theme.transitions.base};
  text-overflow: ellipsis;
  flex-shrink: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.hover};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.glow};
  }
`;

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.accent.main};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.subtle};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ChevronButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.subtle};
    color: ${({ theme }) => theme.colors.accent.main};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.accent.subtle};
    color: ${({ theme }) => theme.colors.accent.main};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform ${({ theme }) => theme.transitions.base};
  }

  &:hover svg {
    transform: rotate(-10deg);
  }
`;

export function ExpandableSearch({
  placeholder = 'Search...',
}: ExpandableSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <Container>
      <InputField $isOpen={isOpen}>
        <InputWrapper>
          <StyledInput
            ref={inputRef}
            placeholder={placeholder}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <IconsContainer>
            <ChevronButton
              aria-label="Previous result"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronUp />
            </ChevronButton>
            <ChevronButton
              aria-label="Next result"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronDown />
            </ChevronButton>
            <IconButton
              onClick={() => setIsOpen(false)}
              aria-label="Close search"
              tabIndex={-1}
            >
              <Search />
            </IconButton>
          </IconsContainer>
        </InputWrapper>
      </InputField>
      <SearchButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close search' : 'Open search'}
        style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? 'none' : 'auto' }}
      >
        <Search />
      </SearchButton>
    </Container>
  );
}
