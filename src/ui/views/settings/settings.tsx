import { Layout } from '@/ui/components/layout';
import { useAnimationPreference } from '@/ui/features/appearance';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { Switch } from '@/ui/ui-kit/switch';
import {
  LuChevronRight,
  LuDollarSign,
  LuShield,
  LuSunMoon,
  LuTerminal,
  LuWallet,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { CurrencyBadge } from './currency';
import { ThemeBadge } from './theme';

type navigationType = {
  title?: string;
  items: ItemType[];
};

export function SettingsView() {
  const navigate = useNavigate();

  const { enableAnimation, toggleAnimation, setAnimation } =
    useAnimationPreference();

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
          iconRight: LuChevronRight,
          label: 'Theme',
          badge: <ThemeBadge />,
          onClick: () => navigate('/settings/theme'),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
        {
          icon: LuSunMoon,
          label: 'Animation',
          subLabel: 'Enable or disable animations',
          badge: (
            <Switch checked={enableAnimation} onCheckedChange={setAnimation} />
          ),
          onClick: toggleAnimation,
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
          label: 'Networks',
          onClick: () => navigate('/settings/manage-networks'),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
        {
          icon: LuTerminal,
          iconRight: LuChevronRight,
          label: 'Connected Sites',
          onClick: () => navigate('/settings/connected-sites'),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
        {
          icon: LuTerminal,
          iconRight: LuChevronRight,
          label: 'Developer Tools',
          onClick: () => navigate('/settings/developer-tools'),
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
      ],
    },
    {
      title: 'Accounts & Security',
      items: [
        {
          icon: LuWallet,
          iconRight: LuChevronRight,
          label: 'Manage Accounts',
          onClick: () => navigate('/settings/manage-wallets'),
          iconClassName: 'text-slate-500 bg-slate-500/10',
        },
        {
          icon: LuShield,
          iconRight: LuChevronRight,
          label: 'Security & Privacy',
          onClick: () => navigate('/settings/security-privacy'),
          iconClassName: 'text-green-500 bg-green-500/10',
        },
      ],
    },
  ];

  return (
    <Layout
      title="Settings"
      onBack={() => navigate('/overview', { state: { direction: 'back' } })}
      className="pt-0!"
    >
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
    </Layout>
  );
}
