import { useState } from 'react';
import styled, { css } from 'styled-components';
import { PanelLeftClose, PanelLeft, Search } from 'lucide-react';
import { Button, TextField, IconButton } from '@radix-ui/themes';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { SplitButton } from './SplitButton';

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
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
`;

const searchExpandKeyframes = css`
  @keyframes searchExpand {
    from {
      width: 32px;
      opacity: 0;
    }
    to {
      width: 160px;
      opacity: 1;
    }
  }
`;

const SearchField = styled(TextField.Root)`
  ${searchExpandKeyframes}
  width: 160px;
  animation: searchExpand ${({ theme }) => theme.transitions.fast} ease-out;
`;

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

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

      {!collapsed && (
        <Toolbar>
          <ToolbarLeft>
            <SplitButton menuItems={playlistMenuItems}>
              Reload Playlist
            </SplitButton>
          </ToolbarLeft>

          <ToolbarRight>
            {searchOpen ? (
              <SearchField
                size="2"
                placeholder="Search..."
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            ) : (
              <IconButton
                size="2"
                variant="ghost"
                color="gray"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} />
              </IconButton>
            )}
          </ToolbarRight>
        </Toolbar>
      )}
    </SidebarWrapper>
  );
}
