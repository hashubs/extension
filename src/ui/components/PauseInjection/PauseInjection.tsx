import { naiveFormDataToObject } from '@/shared/form-data';
import { Dialog } from '@base-ui/react';
import { useQuery } from '@tanstack/react-query';
import CloseIcon from 'jsx:src/ui/assets/close.svg';
import ConnectionIconOff from 'jsx:src/ui/assets/pause-feature-off.svg';
import ConnectionIconOn from 'jsx:src/ui/assets/pause-feature-on.svg';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { invariant } from 'src/shared/invariant';
import { reloadActiveTab } from 'src/shared/reloadActiveTab';
import { getActiveTabOrigin } from 'src/shared/youno-api/internal/getActiveTabOrigin';
import { useGlobalPreferences } from 'src/ui/features/preferences/usePreferences';
import type { SubmitData } from './actions';
import {
  TESTING,
  TurnOffDuration,
  createInjectionPreference,
  disableInjectionPreference,
} from './actions';

// import { Button } from 'src/ui/ui-kit/Button';
// import { UIText } from 'src/ui/ui-kit/UIText';
// import { VStack } from 'src/ui/ui-kit/VStack';
// import { HStack } from 'src/ui/ui-kit/HStack';
// import { BottomSheetDialog } from 'src/ui/ui-kit/ModalDialogs/BottomSheetDialog';
// import type { HTMLDialogElementInterface } from 'src/ui/ui-kit/ModalDialogs/HTMLDialogElementInterface';
// import { ViewLoading } from '../ViewLoading';

function PauseInjectionDialog({
  activeTabUrl,
  onSubmit,
}: {
  activeTabUrl: URL | null;
  onSubmit: (data: SubmitData) => void;
}) {
  invariant(activeTabUrl != null, '`activeTabUrl` is required');

  const buttons = [
    {
      value: TurnOffDuration.oneHour,
      label: `For 1 Hour${TESTING ? ' (40 sec for testing)' : ''}`,
    },
    // { value: TurnOffDuration.untilTomorrow, label: 'Pause until Tomorrow' },
    { value: TurnOffDuration.forever, label: 'Forever' },
  ];

  const formRef = useRef<HTMLFormElement | null>(null);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    invariant(formRef.current, 'Form not found');
    const { current: form } = formRef;
    function handleSubmit(event: SubmitEvent) {
      event.preventDefault();
      interface FormDataWithSubmitter extends FormData {
        new (form?: HTMLFormElement, submitter?: HTMLElement | null): FormData;
      }
      const data = naiveFormDataToObject<{ duration: TurnOffDuration }>(
        new (FormData as FormDataWithSubmitter)(
          event.currentTarget as HTMLFormElement,
          event.submitter
        ),
        (key, value) => (key === 'duration' ? Number(value) : (value as string))
      );
      onSubmitRef.current({
        origin: data.origin as string,
        duration: data.duration,
      });
    }
    /**
     * NOTE: we add a 'submit' listener instead of using `onSubmit` prop
     * because we need to access the `event.submitter` property
     */
    form.addEventListener('submit', handleSubmit);
    return () => {
      form.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return (
    <div className="relative flex flex-col gap-6 min-h-full">
      <h2 className="text-2xl font-bold text-center">
        Disable Zerion for
        <br />
        <span className="text-gray-500 wrap-break-word">
          {activeTabUrl?.hostname}
        </span>
      </h2>

      <form ref={formRef}>
        <input type="hidden" name="origin" value={activeTabUrl.origin} />
        <div className="flex flex-col gap-1">
          {buttons.map((button) => (
            <button
              key={button.value}
              name="duration"
              value={button.value}
              className="w-full h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold transition-colors"
            >
              {button.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

export function usePausedData() {
  const { data: tabData } = useQuery({
    queryKey: ['activeTab/origin'],
    queryFn: getActiveTabOrigin,
  });
  const { globalPreferences, mutation } = useGlobalPreferences();
  const tabUrl = tabData?.url;
  const protocol = tabUrl?.protocol;
  const tabUrlHttp =
    protocol === 'https:' || protocol === 'http:' ? tabUrl : undefined;
  const isPausedForAll = Boolean(
    globalPreferences?.providerInjection['<all_urls>']
  );
  const isPaused =
    isPausedForAll ||
    (tabUrlHttp
      ? Boolean(globalPreferences?.providerInjection[tabUrlHttp.origin])
      : false);
  return {
    tabUrl: tabUrlHttp,
    isPaused,
    pattern: isPausedForAll ? '<all_urls>' : tabUrlHttp?.origin ?? null,
    isPausedForAll,
    globalPreferences,
    setGlobalPreferences: mutation.mutateAsync,
    tabData,
  };
}

export function PauseInjectionControl() {
  const {
    isPaused,
    isPausedForAll,
    tabUrl,
    globalPreferences,
    setGlobalPreferences,
  } = usePausedData();
  const [open, setOpen] = useState(false);

  const handleDialogDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  if (!globalPreferences) {
    // ViewLoading replaced with plain div spinner
    return (
      <div className="flex items-center justify-center w-9 h-9">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Popup className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-6">
            {open ? (
              <div className="relative">
                <PauseInjectionDialog
                  activeTabUrl={tabUrl || null}
                  onSubmit={(formData) => {
                    setGlobalPreferences(
                      createInjectionPreference(globalPreferences, formData)
                    ).then(reloadActiveTab);
                    handleDialogDismiss();
                  }}
                />
                <Dialog.Close
                  aria-label="Close"
                  onClick={handleDialogDismiss}
                  className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <CloseIcon style={{ display: 'block' }} />
                </Dialog.Close>
              </div>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <button
        type="button"
        title="Disable Wallet Provider"
        disabled={isPaused}
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 disabled:cursor-auto transition-colors p-0"
      >
        {React.createElement(isPaused ? ConnectionIconOff : ConnectionIconOn, {
          style: {
            display: 'block',
            width: 36,
            height: 36,
            color: isPausedForAll
              ? 'var(--notice-600)'
              : isPaused
              ? 'var(--neutral-500)'
              : undefined,
          },
        })}
      </button>
    </>
  );
}

export function PausedHeader() {
  const {
    isPaused,
    isPausedForAll,
    pattern,
    tabUrl,
    globalPreferences,
    setGlobalPreferences,
  } = usePausedData();

  if (!isPaused || !globalPreferences) {
    return null;
  }

  return (
    <div
      className="grid gap-2 items-center justify-between"
      style={{ gridTemplateColumns: '1fr auto' }}
    >
      {/* Left: paused label */}
      <div
        className="grid items-center gap-1"
        style={{ gridTemplateColumns: 'auto 1fr' }}
      >
        <span className="text-sm text-yellow-500">Paused for</span>
        {isPausedForAll ? (
          <span className="text-sm font-semibold text-yellow-600">
            All DApps
          </span>
        ) : (
          <span
            className="text-sm font-semibold truncate"
            title={tabUrl?.hostname || 'current tab'}
          >
            {tabUrl?.hostname || 'current tab'}
          </span>
        )}
      </div>

      {/* Right: resume button */}
      <button
        type="button"
        onClick={() =>
          setGlobalPreferences(
            disableInjectionPreference(globalPreferences, pattern)
          ).then(reloadActiveTab)
        }
        className="h-9 px-6 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-semibold transition-colors"
      >
        Resume
      </button>
    </div>
  );
}
