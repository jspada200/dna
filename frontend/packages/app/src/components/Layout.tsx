import { useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const LayoutWrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100%;
  background: ${({ theme }) => theme.colors.bg.base};
`;

const Main = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${({ theme, $sidebarCollapsed }) =>
    $sidebarCollapsed
      ? theme.sizes.sidebar.collapsed
      : theme.sizes.sidebar.expanded};
  padding: 24px 32px;
  transition: margin-left ${({ theme }) => theme.transitions.base};
  background:
    radial-gradient(
        ellipse 80% 50% at 50% -20%,
        ${({ theme }) => theme.colors.accent.subtle},
        transparent
      )
      fixed,
    ${({ theme }) => theme.colors.bg.base};
  min-height: 100%;
`;

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <LayoutWrapper>
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <Main $sidebarCollapsed={sidebarCollapsed}>{children}</Main>
    </LayoutWrapper>
  );
}
