import { cn } from '@/ui/lib/utils';
import { Button, Input } from '@/ui/ui-kit';
import { useState } from 'react';
import { MdInfo, MdWarningAmber } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../section-header';

type StrengthLevel = 'weak' | 'fair' | 'good' | 'robust';

const strengthConfig: Record<StrengthLevel, { label: string; bars: number }> = {
  weak: { label: 'Weak', bars: 1 },
  fair: { label: 'Fair', bars: 2 },
  good: { label: 'Good', bars: 3 },
  robust: { label: 'Robust', bars: 4 },
};

function getStrength(password: string): StrengthLevel {
  if (password.length === 0) return 'weak';

  const rules = [
    password.length >= 14,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (rules <= 2 || password.length < 8) return 'weak';
  if (rules === 3) return 'fair';
  if (rules === 4) return 'good';
  return 'robust';
}

function WeakPasswordWarning({
  onImprove,
  onProceed,
}: {
  onImprove: () => void;
  onProceed: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] gap-4 items-start mb-5">
        <div className="w-12 h-12 bg-[#faeeda] border-[0.5px] border-[#ef9f27] rounded-lg flex items-center justify-center shrink-0 text-[#854f0b]">
          <MdWarningAmber size={22} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#854f0b] tracking-[0.08em] uppercase m-0 mb-1">
            Weak password
          </p>
          <h2 className="text-base font-medium m-0 mb-1.5 leading-[1.3]">
            Strengthen your password before continuing
          </h2>
          <p className="text-[0.8125rem] text-muted-foreground/80 m-0 leading-relaxed">
            This password is easy to guess. Follow the recommendations below for
            better security.
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 list-none p-0 m-0 mb-5">
        {[
          'Min. 14 characters',
          'Uppercase & lowercase letters',
          'Numbers & symbols',
          'Avoid common words',
        ].map((tip) => (
          <li
            key={tip}
            className="bg-surface border-[0.5px] border-outline-variant rounded-lg px-3 py-2.5 flex gap-2 items-start text-[0.8125rem] text-on-surface leading-[1.4]"
          >
            <span className="text-[11px] font-bold text-on-surface bg-surface-container-highest rounded-[3px] px-1 py-px shrink-0 mt-px">
              ✓
            </span>
            {tip}
          </li>
        ))}
      </ul>

      <div className="flex gap-2 *:first:flex-[1.5] *:last:flex-2">
        <Button variant="secondary" size="md" onClick={onProceed}>
          Proceed anyway
        </Button>
        <Button variant="primary" size="md" onClick={onImprove}>
          Improve password
        </Button>
      </div>
    </>
  );
}

interface Props {
  savePassword: (password: string) => void;
  nextPath?: string;
}

export function SetPassword({
  savePassword,
  nextPath = '../ecosystem',
}: Props) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const strength = getStrength(password);
  const { label, bars } = strengthConfig[strength];
  const isMatching = confirm.length > 0 && password === confirm;

  if (showWarning) {
    return (
      <WeakPasswordWarning
        onImprove={() => setShowWarning(false)}
        onProceed={() => {
          savePassword(password);
          navigate(nextPath);
        }}
      />
    );
  }

  return (
    <>
      <SectionHeader
        title="Create your password"
        description="Secure your Monolith Wallet with a strong, memorable password. This will be used to authorize transactions locally."
      />

      <div className="flex flex-col gap-6 grow mx-auto w-full">
        <div className="flex flex-col gap-2">
          <label
            className="block text-xs font-bold text-muted-foreground uppercase tracking-[0.08em] ml-1 opacity-80"
            htmlFor="password"
          >
            New Password
          </label>

          <Input
            id="password"
            size="md"
            isValid={password.length > 0 && isMatching}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            status="default"
          />

          {password.length > 0 && (
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-on-surface-variant">
                  Security Level:{' '}
                  <strong
                    className={cn('font-bold', {
                      'text-[#ba1a1a]': strength === 'weak',
                      'text-[#b86200]': strength === 'fair',
                      'text-[#386a20]': strength === 'good',
                      'text-primary-container': strength === 'robust',
                    })}
                  >
                    {label}
                  </strong>
                </span>
                <span className="text-xs text-outline">8+ Characters</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-colors duration-300',
                      i < bars
                        ? 'bg-primary-container'
                        : 'bg-surface-container-highest'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="block text-xs font-bold text-muted-foreground uppercase tracking-[0.08em] ml-1 opacity-80"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <Input
            id="confirm-password"
            size="md"
            isError={confirm.length > 0 && !isMatching}
            isValid={confirm.length > 0 && isMatching}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={password.length === 0}
            status={isMatching ? 'success' : 'error'}
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-[rgba(15,61,62,0.05)] rounded-xl border border-[rgba(15,61,62,0.1)]">
          <MdInfo size={20} className="text-primary-container shrink-0 mt-px" />
          <p className="text-xs text-muted-foreground leading-relaxed m-0">
            <strong className="text-primary-container font-bold">
              Remember:
            </strong>{' '}
            Monolith cannot reset this password. If lost, you will need your
            recovery phrase to regain access.
          </p>
        </div>

        <div className="pt-4 mt-auto">
          <Button
            variant="primary"
            size="lg"
            disabled={!isMatching || password.length < 8}
            onClick={() => {
              if (strength === 'weak' && !showWarning) {
                setShowWarning(true);
                return;
              }
              savePassword(password);
              navigate(nextPath);
            }}
          >
            {isMatching ? 'Set Password' : 'Confirm Password'}
          </Button>
        </div>
      </div>
    </>
  );
}
