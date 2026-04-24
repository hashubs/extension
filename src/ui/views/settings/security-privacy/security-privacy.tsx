import { EraseData } from '@/ui/components/erase-data';
import { Header } from '@/ui/components/header';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import React, { useState } from 'react';
import {
  LuChevronRight,
  LuRectangleEllipsis,
  LuTimer,
  LuTrash2,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { AutoLockTimerBadge } from './auto-lock-timer';
import { PasskeyItem } from './passkey';

type NavigationItem = Partial<ItemType> & {
  render?: () => React.ReactNode;
};

type NavigationSection = {
  title?: string;
  items: NavigationItem[];
};

export function SecurityPrivacyView() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navigations: NavigationSection[] = [
    {
      title: 'Access Control',
      items: [
        {
          icon: LuTimer,
          iconRight: LuChevronRight,
          label: 'Auto-Lock',
          onClick: () => navigate('auto-lock'),
          badge: <AutoLockTimerBadge />,
        },
        {
          icon: LuRectangleEllipsis,
          iconRight: LuChevronRight,
          label: 'Change Password',
          onClick: () => navigate('change-password'),
        },
        {
          render: () => <PasskeyItem />,
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: LuTrash2,
          label: 'Reset Wallet',
          onClick: () => setOpen(true),
          variant: 'danger',
          subLabel: 'Wipe all data and start over',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Security & Privacy"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      />
      <div className="flex-1 p-4 pt-0 space-y-4 no-scrollbar overflow-y-auto">
        {navigations.map((section, i) => (
          <section key={i}>
            <Card title={section.title}>
              {section.items.map((item, j) =>
                item.render ? (
                  <React.Fragment key={j}>{item.render()}</React.Fragment>
                ) : (
                  <CardItem key={j} item={item as ItemType} />
                )
              )}
            </Card>
          </section>
        ))}
      </div>

      <EraseData open={open} onOpenChange={setOpen} />
    </div>
  );
}
