import { windowPort } from '@/shared/channel';
import { SiteFaviconImg } from '@/ui/components/SiteFaviconImg';
import { BrandLogo } from '@/ui/components/svg';
import { ViewLoading } from '@/ui/components/view-loading';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { invariant } from 'src/shared/invariant';
import {
  TurnOffDuration,
  createInjectionPreference,
} from 'src/ui/components/PauseInjection/actions';
import { useGlobalPreferences } from 'src/ui/features/preferences/usePreferences';

export function ChooseGlobalProvider({
  origin,
  onConfirm,
  onReject,
}: {
  origin: string;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const { globalPreferences, setGlobalPreferencesAsync } =
    useGlobalPreferences();

  if (!globalPreferences) {
    return <ViewLoading />;
  }

  const hostname = new URL(origin).hostname;

  return (
    <div className="flex flex-col flex-1 px-4 h-full">
      <div
        className="grid h-full flex-1"
        style={{ gridTemplateRows: '1fr auto' }}
      >
        <div className="self-center flex flex-col gap-7 border border-border/20 rounded-3xl p-8">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-13 h-13 rounded-[14px] bg-muted/40 border border-border/20 flex items-center justify-center">
              <SiteFaviconImg url={origin} size={26} />
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
              Connect to
            </p>
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border/20 rounded-full px-3.5 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[13px] font-medium text-foreground">
                {hostname}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-85 transition-opacity"
            >
              <BrandLogo style={{ width: 17, height: 17 }} />
              Continue with Selvo
            </button>

            <button
              type="button"
              onClick={async () => {
                await setGlobalPreferencesAsync(
                  createInjectionPreference(globalPreferences, {
                    origin,
                    duration: TurnOffDuration.forever,
                  })
                );
                await new Promise((r) => setTimeout(r, 100));
                onReject();
              }}
              className="w-full py-3 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              Use other wallet
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
            Selvo will never request your seed phrase or private key.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChooseGlobalProviderGuard({
  children,
}: React.PropsWithChildren) {
  const [params, setParams] = useSearchParams();
  const origin = params.get('origin');
  const windowId = params.get('windowId');
  const nonEip6963Request = params.get('nonEip6963Request') === 'yes';
  const providerSelected = params.get('providerSelected') === 'yes';

  invariant(origin, 'origin get-parameter is required');
  invariant(windowId, 'windowId get-parameter is required');

  const handleReject = () => windowPort.reject(windowId);

  const showSelectView = nonEip6963Request && !providerSelected;
  if (!showSelectView) {
    return children;
  }

  return (
    <>
      <ChooseGlobalProvider
        origin={origin}
        onConfirm={() => {
          setParams(
            (params) => {
              const newParams = new URLSearchParams(params);
              newParams.set('providerSelected', 'yes');
              return newParams;
            },
            { replace: true }
          );
        }}
        onReject={() => {
          // Do not reload the dapp because we will forward request
          // automatically to the other wallet. But I want to leave the comment here
          // in case we need to revert
          //
          // reloadTabsByOrigin({ origin });

          handleReject();
        }}
      />
    </>
  );
}
