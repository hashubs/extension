import { Header } from '@/ui/components/header';
import { usePreferences } from '@/ui/features/preferences';
import { Button, Card, CardItem } from '@/ui/ui-kit';
import { Switch } from '@/ui/ui-kit/switch';
import { useNavigate } from 'react-router-dom';
import { CurrencySelector } from './currency-selector';

export function TestView() {
  const navigate = useNavigate();

  const { preferences, setPreferences } = usePreferences();

  return (
    <div className="mt-8 space-y-4">
      <Header
        title="Test View"
        onBack={() => navigate('/overview', { state: { direction: 'back' } })}
      />

      <CurrencySelector />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => navigate('/test-view')}>
          Test View
        </Button>
        <Button variant="secondary" onClick={() => navigate('/networks')}>
          Networks
        </Button>
      </div>

      <Card>
        <CardItem
          item={{
            label: 'Testnet Mode',
            subLabel: 'Enable testnet mode',
            onClick: () => {
              setPreferences({
                testnetMode: preferences?.testnetMode ? null : { on: true },
              });
            },
            rightElement: (
              <Switch checked={Boolean(preferences?.testnetMode)} />
            ),
          }}
        />
      </Card>
    </div>
  );
}
