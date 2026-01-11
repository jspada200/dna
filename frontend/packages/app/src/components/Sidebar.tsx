import styled from 'styled-components';
import {
  PanelLeftClose,
  PanelLeft,
  Settings,
  Phone,
  Play,
  Upload,
} from 'lucide-react';
import { Button } from '@radix-ui/themes';
import type { Version } from '@dna/core';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { SplitButton } from './SplitButton';
import { ExpandableSearch } from './ExpandableSearch';
import { SquareButton } from './SquareButton';
import { VersionCard } from './VersionCard';

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const SidebarWrapper = styled.aside<{ $collapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${({ theme, $collapsed }) =>
    $collapsed ? theme.sizes.sidebar.collapsed : theme.sizes.sidebar.expanded};
  background: ${({ theme }) => theme.colors.sidebar.bg};
  border-right: 1px solid ${({ theme }) => theme.colors.sidebar.border};
  display: flex;
  flex-direction: column;
  transition: width ${({ theme }) => theme.transitions.base};
  z-index: 100;
  overflow: hidden;
`;

const Header = styled.div<{ $collapsed: boolean }>`
  padding: ${({ $collapsed }) => ($collapsed ? '12px 8px' : '12px 16px')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  min-height: 64px;
  gap: ${({ $collapsed }) => ($collapsed ? '4px' : '0')};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  gap: 12px;

  button[data-accent-color='gray'] {
    color: ${({ theme }) => theme.colors.text.secondary};

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Footer = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ $collapsed }) => ($collapsed ? '12px 8px' : '12px 16px')};
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  gap: 8px;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.sans};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:active {
    background: ${({ theme }) => theme.colors.bg.overlay};
    transform: translateY(1px);
  }
`;

const CollapsedToolbar = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const CollapsedFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  gap: 12px;
`;

const VersionCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
`;

const placeholderVersions: Array<{
  version: Version;
  artistName: string;
  department: string;
  selected?: boolean;
  inReview?: boolean;
}> = [
  {
    version: { id: '1', name: 'TST0010 - 000001', path: '', createdAt: '' },
    artistName: 'Jane Doe',
    department: 'Lighting',
  },
  {
    version: { id: '2', name: 'TST0010 - 000002', path: '', createdAt: '' },
    artistName: 'John Smith',
    department: 'Animation',
    selected: true,
  },
  {
    version: { id: '3', name: 'TST0010 - 000003', path: '', createdAt: '' },
    artistName: 'Emily Chen',
    department: 'Compositing',
    inReview: true,
  },
  {
    version: { id: '4', name: 'TST0020 - 000001', path: '', createdAt: '' },
    artistName: 'Michael Brown',
    department: 'FX',
  },
  {
    version: { id: '5', name: 'TST0020 - 000002', path: '', createdAt: '' },
    artistName: 'Sarah Wilson',
    department: 'Lighting',
  },
  {
    version: { id: '6', name: 'TST0030 - 000001', path: '', createdAt: '' },
    artistName: 'David Lee',
    department: 'Animation',
  },
  {
    version: { id: '7', name: 'TST0030 - 000002', path: '', createdAt: '' },
    artistName: 'Lisa Garcia',
    department: 'Rigging',
  },
  {
    version: { id: '8', name: 'TST0040 - 000001', path: '', createdAt: '' },
    artistName: 'Kevin Martinez',
    department: 'Texturing',
  },
  {
    version: { id: '9', name: 'TST0040 - 000002', path: '', createdAt: '' },
    artistName: 'Amanda Taylor',
    department: 'Modeling',
  },
  {
    version: { id: '10', name: 'TST0050 - 000001', path: '', createdAt: '' },
    artistName: 'Chris Johnson',
    department: 'Layout',
  },
];

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const playlistMenuItems = [
    { label: 'Replace Playlist' },
    { label: 'Add Version' },
  ];

  return (
    <SidebarWrapper $collapsed={collapsed}>
      <Header $collapsed={collapsed}>
        <Logo showText={!collapsed} width={collapsed ? 32 : 120} />
        <HeaderActions>
          {!collapsed && (
            <>
              <Button size="2" variant="solid" color="violet">
                Publish Notes
              </Button>
              <UserAvatar name="Jane Doe" size="2" />
            </>
          )}
          <CollapseButton
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          </CollapseButton>
        </HeaderActions>
      </Header>

      {collapsed ? (
        <CollapsedToolbar>
          <SplitButton
            leftSlot={<Phone size={14} />}
            rightSlot={<Play size={14} />}
            onRightClick={() => {}}
          />
        </CollapsedToolbar>
      ) : (
        <Toolbar>
          <ToolbarLeft>
            <SplitButton menuItems={playlistMenuItems}>
              Reload Playlist
            </SplitButton>
          </ToolbarLeft>

          <ExpandableSearch placeholder="Search versions..." />
        </Toolbar>
      )}

      <ScrollableContent>
        {!collapsed && (
          <VersionCardList>
            {placeholderVersions.map((item) => (
              <VersionCard
                key={item.version.id}
                version={item.version}
                artistName={item.artistName}
                department={item.department}
                selected={item.selected}
                inReview={item.inReview}
              />
            ))}
          </VersionCardList>
        )}
      </ScrollableContent>

      {collapsed ? (
        <CollapsedFooter>
          <SquareButton variant="cta">
            <Upload />
            Publish
          </SquareButton>
          <SquareButton variant="neutral">
            <Settings />
            Settings
          </SquareButton>
        </CollapsedFooter>
      ) : (
        <Footer $collapsed={collapsed}>
          <SplitButton
            leftSlot={<Phone size={14} />}
            rightSlot={<Play size={14} />}
            onRightClick={() => {}}
          >
            Transcribing
          </SplitButton>
          <SettingsButton>
            <Settings size={16} />
            Settings
          </SettingsButton>
        </Footer>
      )}
    </SidebarWrapper>
  );
}
