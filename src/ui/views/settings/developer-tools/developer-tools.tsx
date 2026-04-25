import { Layout } from '@/ui/components/layout';
import { usePreferences } from '@/ui/features/preferences';
import { useGlobalPreferences } from '@/ui/features/preferences/usePreferences';
import { Card, CardItem, ItemType } from '@/ui/ui-kit/card';
import { Switch } from '@/ui/ui-kit/switch';
import { LuLoader, LuTerminal } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useClearPendingTransactions } from './clear-pending-transaction';

type navigationType = {
  title?: string;
  items: ItemType[];
};

export function DeveloperToolsView() {
  const navigate = useNavigate();

  const { globalPreferences, setGlobalPreferences } = useGlobalPreferences();
  const { preferences, setPreferences } = usePreferences();
  const { clearPendingTransactions, isPending } = useClearPendingTransactions();

  const navigations: navigationType[] = [
    {
      items: [
        {
          icon: LuTerminal,
          label: 'Custom Nonce',
          subLabel: 'Set your own unique nonce to control transaction order',
          onClick: () => {
            setPreferences({
              configurableNonce: !preferences?.configurableNonce,
            });
          },
          badge: <Switch checked={Boolean(preferences?.configurableNonce)} />,
          iconClassName: 'text-purple-500 bg-purple-500/10',
          isItemStart: true,
        },
        {
          icon: LuTerminal,
          label: 'Custom Data',
          subLabel: 'Attach arbitrary data to Send transactions',
          onClick: () => {
            setPreferences({
              configurableTransactionData:
                !preferences?.configurableTransactionData,
            });
          },
          badge: (
            <Switch
              checked={Boolean(preferences?.configurableTransactionData)}
            />
          ),
          iconClassName: 'text-purple-500 bg-purple-500/10',
          isItemStart: true,
        },
        {
          icon: LuTerminal,
          label: 'Recognizable Connect Buttons',
          subLabel:
            'When enabled, we add Selvo Wallet label to connect buttons in DApps so that they’re easier to spot',
          onClick: () => {
            setGlobalPreferences({
              recognizableConnectButtons:
                !globalPreferences?.recognizableConnectButtons,
            });
          },
          badge: (
            <Switch
              checked={Boolean(globalPreferences?.recognizableConnectButtons)}
            />
          ),
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
          onClick: () => {
            clearPendingTransactions();
          },
          iconRight: isPending ? LuLoader : undefined,
          iconRightClassName: 'animate-spin',
          iconClassName: 'text-lime-500 bg-lime-500/10',
        },
      ],
    },
  ];

  return (
    <Layout
      title="Developer Tools"
      onBack={() => navigate('/settings', { state: { direction: 'back' } })}
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
    </Layout>
  );
}
