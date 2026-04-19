import { naiveFormDataToObject } from '@/shared/form-data';
import { cn } from '@/ui/lib/utils';
import { Button, Drawer, DrawerContent, DrawerTrigger } from '@/ui/ui-kit';
import { useEffect, useRef, useState } from 'react';
import { invariant } from 'src/shared/invariant';
import { reloadActiveTab } from 'src/shared/reloadActiveTab';
import { SiteFaviconImg } from '../SiteFaviconImg';
import { BrandLogo } from '../svg';
import type { SubmitData } from './actions';
import { createInjectionPreference, TESTING, TurnOffDuration } from './actions';
import { usePausedData } from './usePausedData';

function PauseInjectionControl({
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
    <div className="flex flex-col items-center w-full px-4 mx-auto">
      <div className="text-center mb-5">
        <span className="font-medium mb-1 text-muted-foreground text-[10px] uppercase tracking-wider">
          Disable Selvo for
        </span>
        <div className="flex items-center justify-center gap-2">
          <SiteFaviconImg size={18} url={activeTabUrl.origin} />
          <p className="font-semibold text-base">{activeTabUrl.hostname}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 w-full">
        <div className="flex-1 h-px bg-muted-foreground/10" />
        <div className="rounded-full bg-muted-foreground/10 size-1.25" />
        <div className="flex-1 h-px bg-muted-foreground/10" />
      </div>

      <form ref={formRef} className="w-full pb-4">
        <input type="hidden" name="origin" value={activeTabUrl.origin} />
        <div className="flex flex-col gap-1 w-full">
          {buttons.map((button) => (
            <Button
              size="md"
              variant="secondary"
              key={button.value}
              name="duration"
              value={button.value}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </form>
    </div>
  );
}

export function PauseInjectionDrawer() {
  const {
    isPaused,
    isPausedForAll,
    tabUrl,
    globalPreferences,
    setGlobalPreferences,
  } = usePausedData();

  const [open, setOpen] = useState(false);

  if (!globalPreferences) {
    return (
      <div className="flex items-center justify-center w-9 h-9">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger disabled={isPaused}>
        <BrandLogo
          size={26}
          className={cn(
            isPausedForAll
              ? '[--logo-background:gray]!'
              : isPaused
              ? '[--logo-background:gray]!'
              : '[--logo-background:#266868]!'
          )}
        />
      </DrawerTrigger>
      <DrawerContent variant="inset">
        <PauseInjectionControl
          activeTabUrl={tabUrl || null}
          onSubmit={(formData) => {
            setGlobalPreferences(
              createInjectionPreference(globalPreferences, formData)
            ).then(reloadActiveTab);
            setOpen(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
