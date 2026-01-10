import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu } from '@radix-ui/themes';

interface SplitButtonMenuItem {
  label: string;
  onSelect?: () => void;
}

interface SplitButtonProps {
  children: ReactNode;
  onClick?: () => void;
  menuItems: SplitButtonMenuItem[];
}

export function SplitButton({ children, onClick, menuItems }: SplitButtonProps) {
  return (
    <div className="dna-split-button">
      <button className="dna-split-button-main" onClick={onClick}>
        {children}
      </button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button className="dna-split-button-trigger">
            <ChevronDown size={14} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {menuItems.map((item, index) => (
            <DropdownMenu.Item key={index} onSelect={item.onSelect}>
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}
