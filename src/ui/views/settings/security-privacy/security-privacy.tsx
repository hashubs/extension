import { EraseData } from '@/ui/components/erase-data';
import { Layout } from '@/ui/components/layout';
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
    <>
      <Layout
        title="Security & Privacy"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
      >
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
      </Layout>
      <EraseData open={open} onOpenChange={setOpen} />
    </>
  );
}
