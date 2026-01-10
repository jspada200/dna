import { useState } from 'react';
import { PanelLeftClose, PanelLeft, Search } from 'lucide-react';
import { Button, TextField, IconButton } from '@radix-ui/themes';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { SplitButton } from './SplitButton';

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const playlistMenuItems = [
    { label: 'Replace Playlist' },
    { label: 'Add Version' },
  ];

  return (
    <aside className={`dna-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="dna-sidebar-header">
        <Logo showText={!collapsed} width={collapsed ? 32 : 120} />
        <div className="dna-sidebar-header-actions">
          {!collapsed && (
            <>
              <Button size="2" variant="solid" color="violet">
                Publish Notes
              </Button>
              <UserAvatar name="Jane Doe" size="2" />
            </>
          )}
          <button
            className="dna-sidebar-collapse-btn"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="dna-sidebar-toolbar">
          <div className="dna-sidebar-toolbar-left">
            <SplitButton menuItems={playlistMenuItems}>
              Reload Playlist
            </SplitButton>
          </div>

          <div className="dna-sidebar-toolbar-right">
            {searchOpen ? (
              <TextField.Root
                size="2"
                placeholder="Search..."
                autoFocus
                onBlur={() => setSearchOpen(false)}
                className="dna-sidebar-search"
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
          </div>
        </div>
      )}
    </aside>
  );
}
