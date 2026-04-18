import { Header } from '@/ui/components/header';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { DarkModeSelector } from '@/ui/views/settings/dark-mode-selector';
import { useState } from 'react';
import {
  LuChevronRight,
  LuDollarSign,
  LuSunMoon,
  LuTerminal,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { CurrencyBadge } from '../tests/currency-selector';

type navigationType = {
  title?: string;
  items: ItemType[];
};

export function SettingsView() {
  const navigate = useNavigate();
  const [openDarkMode, setOpenDarkMode] = useState(false);

  const navigations: navigationType[] = [
    {
      title: 'Preferences',
      items: [
        {
          icon: LuDollarSign,
          iconRight: LuChevronRight,
          label: 'Currency',
          badge: <CurrencyBadge />,
          iconClassName: 'text-yellow-500 bg-yellow-500/10',
          onClick: () => navigate('/settings/currency'),
        },
        {
          icon: LuSunMoon,
          label: 'Theme',
          badge: (
            <DarkModeSelector
              open={openDarkMode}
              onOpenChange={setOpenDarkMode}
            />
          ),
          onClick: () => setOpenDarkMode(!openDarkMode),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
      ],
    },
    {
      title: 'Connectivity',
      items: [
        {
          icon: LuTerminal,
          iconRight: LuChevronRight,
          label: 'Developer Tools',
          onClick: () =>
            navigate('/settings/developer-tools', {
              state: { direction: 'forward' },
            }),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
        {
          icon: LuTerminal,
          iconRight: LuChevronRight,
          label: 'Networks',
          onClick: () =>
            navigate('/settings/networks', {
              state: { direction: 'forward' },
            }),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
      ],
    },
  ];

  return (
    <>
      <Header
        title="Settings"
        onBack={() => navigate('/overview', { state: { direction: 'back' } })}
      />

      <div className="flex flex-col h-full px-4">
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          {navigations.map((section, i) => (
            <div key={i}>
              <Card title={section.title}>
                {section.items.map((item, j) => (
                  <CardItem key={j} item={item} />
                ))}
              </Card>
            </div>
          ))}

          <p className="text-center text-[10px] text-gray-600 mt-4 font-mono pb-4">
            v1.0.0 (Build 001)
          </p>
        </div>
      </div>
    </>
  );
}
