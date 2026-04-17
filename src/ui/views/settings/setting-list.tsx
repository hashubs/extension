import { Header } from '@/ui/components/header';
import { DarkModeSelector } from '@/ui/components/settings/dark-mode-selector';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { useState } from 'react';
import { LuChevronRight, LuSunMoon, LuTerminal } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

type navigationType = {
  title?: string;
  items: ItemType[];
};

export function SettingsList() {
  const navigate = useNavigate();
  const [openDarkMode, setOpenDarkMode] = useState(false);

  const navigations: navigationType[] = [
    {
      title: 'Preferences',
      items: [
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
            navigate('/settings/connectivity', {
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
