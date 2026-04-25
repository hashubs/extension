import { Footer, Layout } from '@/ui/components/layout';
import { BrandLogo } from '@/ui/components/svg';
import { Button } from '@/ui/ui-kit';

export function CreateWalletOptionsView({
  onBack,
  onSelectNewPhrase,
  onSelectExisting,
}: {
  onBack: () => void;
  onSelectNewPhrase: () => void;
  onSelectExisting: () => void;
}) {
  return (
    <Layout onBack={onBack} wrapped={false}>
      <div className="flex flex-col flex-1 items-center justify-center">
        <BrandLogo className="w-16 h-16 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Add Wallet</h1>
        <p className="text-muted-foreground text-sm">
          Choose an option to set up your wallet
        </p>
      </div>

      <Footer>
        <Button variant="primary" size="md" onClick={onSelectNewPhrase}>
          Create New Recovery Phrase
        </Button>
        <Button variant="secondary" size="md" onClick={onSelectExisting}>
          Add Account to Existing Seed
        </Button>
      </Footer>
    </Layout>
  );
}
