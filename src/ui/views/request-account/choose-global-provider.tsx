import { windowPort } from '@/shared/channel';
import { BrandLogo } from '@/ui/components/svg';
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
    // return <ViewLoading />;
    return null;
  }

  return (
    <div className="flex flex-col flex-1 px-4 h-full">
      <div
        className="grid h-full flex-1"
        style={{ gridTemplateRows: '1fr auto' }}
      >
        <div className="self-center border border-gray-200 rounded-3xl p-10">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center">
              <div>Connect to</div>
              <div className="text-gray-500">{new URL(origin).hostname}</div>
            </h2>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onConfirm()}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <BrandLogo style={{ width: 20, height: 20 }} />
                <span>Continue with Selvo</span>
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
                  // Give ContentScriptManager time to update
                  await new Promise((r) => setTimeout(r, 100));
                  onReject();
                }}
                className="w-full py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Use Other Wallet
              </button>
            </div>
          </div>
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
