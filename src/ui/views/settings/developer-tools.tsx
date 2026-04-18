import { Header } from '@/ui/components/header';
import { usePreferences } from '@/ui/features/preferences';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { Switch } from '@/ui/ui-kit/switch';
import { LuTerminal } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

type navigationType = {
  title?: string;
  items: ItemType[];
};

export function DeveloperTools() {
  const navigate = useNavigate();
  const { preferences, setPreferences } = usePreferences();

  const navigations: navigationType[] = [
    {
      items: [
        {
          icon: LuTerminal,
          label: 'Custom Nonce',
          subLabel: 'Set your own unique nonce to control transaction order',
          badge: <Switch checked />,
          onClick: () => {},
          iconClassName: 'text-purple-500 bg-purple-500/10',
          isItemStart: true,
        },
        {
          icon: LuTerminal,
          label: 'Custom Data',
          subLabel: 'Attach arbitrary data to Send transactions',
          badge: <Switch checked />,
          onClick: () => {},
          iconClassName: 'text-purple-500 bg-purple-500/10',
          isItemStart: true,
        },
        {
          icon: LuTerminal,
          label: 'Recognizable Connect Buttons',
          subLabel:
            'When enabled, we add Selvo Wallet label to connect buttons in DApps so that they’re easier to spot',
          badge: <Switch checked />,
          onClick: () => {},
          iconClassName: 'text-purple-500 bg-purple-500/10',
          isItemStart: true,
        },
      ],
    },
    {
      items: [
        {
          icon: LuTerminal,
          label: 'Developer Tools',
          subLabel: 'Enables viewing and interacting with test networks.',
          onClick: () => {
            setPreferences({
              testnetMode: preferences?.testnetMode ? null : { on: true },
            });
          },
          badge: <Switch checked={Boolean(preferences?.testnetMode)} />,
          iconClassName: 'text-lime-500 bg-lime-500/10',
          isItemStart: true,
        },
      ],
    },
    {
      items: [
        {
          icon: LuTerminal,
          label: 'Clear Pending Transactions',
          onClick: () => {},
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
      ],
    },
  ];

  return (
    <>
      <Header
        title="Developer Tools"
        onBack={() => navigate('/settings', { state: { direction: 'back' } })}
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
        </div>
      </div>
    </>
  );
}
