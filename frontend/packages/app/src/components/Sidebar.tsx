import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <aside className={`dna-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="dna-sidebar-header">
        <Logo showText={!collapsed} width={collapsed ? 32 : 120} />
        <div className="dna-sidebar-header-actions">
          {!collapsed && <UserAvatar name="Jane Doe" size="2" />}
          <button
            className="dna-sidebar-collapse-btn"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          </button>
        </div>
      </div>
    </aside>
  );
}
