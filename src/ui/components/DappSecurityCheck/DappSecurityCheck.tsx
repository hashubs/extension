import type { DappSecurityStatus } from '@/modules/phishing-defence/phishing-defence-service';
import { Button, Drawer, DrawerContent } from '@/ui/ui-kit';
import { useState } from 'react';
import { BsShieldFillCheck, BsShieldFillExclamation } from 'react-icons/bs';
import { TransactionWarning } from '../warning/TransactionWarning';
import {
  SecurityButtonKind,
  SecurityStatusButton,
} from './SecurityStatusButton';

const SECURITY_STATUS_TO_TITLE: Record<DappSecurityStatus, string> = {
  error: 'Unverified',
  loading: '',
  unknown: 'Unverified',
  phishing: 'Risks Found',
  ok: 'No Risks Found',
};

const SECURITY_STATUS_BUTTON_KIND: Record<
  DappSecurityStatus,
  SecurityButtonKind
> = {
  error: 'unknown',
  loading: 'loading',
  unknown: 'unknown',
  phishing: 'danger',
  ok: 'ok',
};

const PHISHING_RISK_LIST = [
  'Trick you into signing malicious transactions',
  'Steal your seed phrase or private key',
  'Drain your wallet without approval',
];

function SecurityCheckDialogContent({
  status,
  onClose,
}: {
  status: 'ok' | 'error';
  onClose: () => void;
}) {
  if (status === 'error') {
    return (
      <div className="flex flex-col gap-8 p-4">
        <BsShieldFillExclamation className="absolute -top-10 -right-10 size-42 text-teal-600/8" />
        <div className="flex flex-col gap-4 relative">
          <span className="text-xl font-bold">Unverified</span>
          <span className="text-sm">
            We couldn't verify this website or complete security checks. Be
            careful and connect only if you trust the source.
          </span>
          <span className="text-sm">
            Security checks are powered by Blockaid.
          </span>
        </div>
        <Button onClick={onClose} variant="secondary" size="md" shimmer>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      <BsShieldFillCheck className="absolute -top-10 -right-10 size-42 text-teal-600/8" />
      <div className="flex flex-col gap-4 relative">
        <span className="text-xl font-bold">No Risks Found</span>
        <span className="text-sm">
          We scanned this website and found no malicious code or phishing
          attempts. It appears safe to connect. Always stay cautious and
          double-check before proceeding.
        </span>
        <span className="text-sm">
          Security checks are powered by Blockaid.
        </span>
      </div>
      <Button onClick={onClose} variant="primary" size="md" shimmer>
        Close
      </Button>
    </div>
  );
}

export function DappSecurityCheck({
  status: rawStatus,
  isLoading: statusIsLoading,
}: {
  status?: DappSecurityStatus;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const isLoading = statusIsLoading || rawStatus === 'loading';
  const status = isLoading ? 'loading' : rawStatus || 'unknown';

  return (
    <>
      {status === 'ok' || status === 'error' ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent
            variant="inset"
            className="overflow-hidden"
            title="Security Check"
            description="Security Check"
          >
            <SecurityCheckDialogContent
              status={status}
              onClose={() => setOpen(false)}
            />
          </DrawerContent>
        </Drawer>
      ) : null}
      <div className="flex flex-col gap-2">
        <SecurityStatusButton
          kind={SECURITY_STATUS_BUTTON_KIND[status]}
          title={SECURITY_STATUS_TO_TITLE[status]}
          onClick={
            status === 'ok' || status === 'error'
              ? () => setOpen(true)
              : undefined
          }
          size="big"
        />
        {status === 'phishing' ? (
          <TransactionWarning
            title="Potential risks:"
            kind="danger"
            message={PHISHING_RISK_LIST.map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/70 shrink-0" />
                <span className="text-xs">{text}</span>
              </div>
            ))}
          />
        ) : null}
      </div>
    </>
  );
}
