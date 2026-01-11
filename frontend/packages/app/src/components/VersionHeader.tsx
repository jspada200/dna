import styled from 'styled-components';
import { Badge } from '@radix-ui/themes';
import { ChevronLeft, Eye, ChevronRight, RotateCw } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { SquareButton } from './SquareButton';
import { SplitButton } from './SplitButton';

interface VersionHeaderProps {
  shotCode?: string;
  versionNumber?: string;
  submittedBy?: string;
  submittedByImageUrl?: string;
  dateSubmitted?: string;
  versionStatus?: string;
  links?: string[];
}

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NextVersionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.accent.main};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accent.hover};
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: 16px;
`;

const Thumbnail = styled.div`
  width: 200px;
  height: 120px;
  background: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: ${({ theme }) => theme.radii.lg};
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MetadataSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`;

const VersionTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const VersionTitleCode = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetadataRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetadataLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  min-width: 90px;
`;

const MetadataValue = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const LinkBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const LinksContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export function VersionHeader({
  shotCode = 'TST0010',
  versionNumber = '000001',
  submittedBy = 'Jane Doe',
  submittedByImageUrl,
  dateSubmitted = 'Dec 19, 2025',
  versionStatus = 'Submitted for review',
  links = ['Lighting', 'TST0010'],
}: VersionHeaderProps) {
  return (
    <HeaderWrapper>
      <TopBar>
        <BackButton>
          <ChevronLeft size={16} />
          Back
        </BackButton>
        <TopBarActions>
          <SplitButton leftSlot={<Eye size={14} />}>In Review</SplitButton>
          <NextVersionButton>
            Next Version
            <ChevronRight size={16} />
          </NextVersionButton>
          <RefreshButton>
            <RotateCw size={16} />
          </RefreshButton>
        </TopBarActions>
      </TopBar>
      <MainContent>
        <Thumbnail />
        <MetadataSection>
          <VersionTitle>
            {shotCode} - <VersionTitleCode>{versionNumber}</VersionTitleCode>
          </VersionTitle>
          <MetadataRow>
            <MetadataLabel>Submitted by:</MetadataLabel>
            <MetadataValue>
              <UserAvatar
                name={submittedBy}
                imageUrl={submittedByImageUrl}
                size="1"
              />
              {submittedBy}
            </MetadataValue>
          </MetadataRow>
          <MetadataRow>
            <MetadataLabel>Date Submitted:</MetadataLabel>
            <MetadataValue>{dateSubmitted}</MetadataValue>
          </MetadataRow>
          <MetadataRow>
            <MetadataLabel>Version Status:</MetadataLabel>
            <MetadataValue>
              <StatusBadge>{versionStatus}</StatusBadge>
            </MetadataValue>
          </MetadataRow>
          <MetadataRow>
            <MetadataLabel>Links:</MetadataLabel>
            <LinksContainer>
              {links.map((link, index) => (
                <LinkBadge key={index}>{link}</LinkBadge>
              ))}
            </LinksContainer>
          </MetadataRow>
        </MetadataSection>
      </MainContent>
    </HeaderWrapper>
  );
}
