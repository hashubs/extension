import { emitter } from '@/shared/events';
import { urlContext } from '@/shared/UrlContext';
import { useEraseDataMutation } from '@/ui/hooks/request/internal/useEraseDataMutation';
import { maybeOpenOnboarding } from '@/ui/views/onboarding/initialization';
import { AiTwotoneAlert, AiTwotoneCheckCircle } from 'react-icons/ai';
import { GoAlertFill } from 'react-icons/go';
import { ConfirmationSheet } from '../confirmation';

interface EraseDataProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EraseData({ open, onOpenChange }: EraseDataProps) {
  const eraseAllData = useEraseDataMutation({
    onSuccess: () => {
      const isTab = urlContext.windowType === 'tab';
      if (isTab) {
        emitter.emit('reloadExtension');
      } else {
        maybeOpenOnboarding();
      }
    },
  });

  return (
    <ConfirmationSheet
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={() => {
        eraseAllData.mutate();
      }}
      title="Reset Wallet"
      heroGradient="from-red-500 to-red-900"
      heroShadow="shadow-red-500/20"
      heading="Before you proceed"
      confirmLabel="Remove Wallet Group"
      heroIcon={<AiTwotoneAlert size={32} />}
      isLoading={eraseAllData.isPending}
      loadingText="Removing..."
      items={[
        {
          icon: GoAlertFill,
          title: 'Destructive Action',
          text: 'All Secret Recovery Phrases, Private Keys, and configurations will be permanently removed.',
        },
        {
          icon: AiTwotoneCheckCircle,
          title: 'Irreversible',
          text: 'This action cannot be undone. Ensure your Secret Recovery Phrase is backed up before continuing',
        },
      ]}
    />
  );
}
