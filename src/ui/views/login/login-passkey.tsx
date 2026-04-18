import { getPasskeyTitle, getPasswordWithPasskey } from '@/modules/passkey';
import { accountPublicRPCPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { PublicUser } from '@/shared/types/User';
import {
  PopoverToast,
  PopoverToastHandle,
} from '@/ui/components/toast/PopoverToast';
import { Button } from '@/ui/ui-kit';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { LuLoader } from 'react-icons/lu';
import { SiMonkeytie } from 'react-icons/si';
import { useNavigationType } from 'react-router-dom';

export function LoginPasskey({
  user,
  onSuccess,
}: {
  user: PublicUser | undefined;
  onSuccess: () => void;
}) {
  const toastPasskeyNotEnabledRef = useRef<PopoverToastHandle>(null);

  const defaultValueQuery = useQuery({
    queryKey: ['account/getPasskeyEnabled'],
    queryFn: () => {
      return accountPublicRPCPort.request('getPasskeyEnabled');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!passkeyEnabled) {
        toastPasskeyNotEnabledRef.current?.showToast();
      }
      invariant(user, 'user is required');
      const password = await getPasswordWithPasskey();
      return accountPublicRPCPort.request('login', { user, password });
    },
    onSuccess,
  });

  const passkeyEnabled = defaultValueQuery.data;
  const navigationType = useNavigationType();
  const autologinRef = useRef(false);
  const passkeyTitle = getPasskeyTitle();

  const isLoading = loginMutation.isPending;

  useEffect(() => {
    // Automatically trigger passkey login if the user navigated here via a replace action
    // This happens when user is redirected to the login page when opening the extension popup
    const showSuggestPasskey = navigationType === 'REPLACE';
    if (showSuggestPasskey && passkeyEnabled && !autologinRef.current) {
      autologinRef.current = true;
      loginMutation.mutate();
    }
  }, [navigationType, passkeyEnabled, loginMutation]);

  return (
    <>
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-muted-foreground/10" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-muted-foreground/10" />
      </div>
      <Button
        variant="outline"
        size="md"
        icon={isLoading ? LuLoader : SiMonkeytie}
        iconClassName={isLoading ? 'animate-spin' : ''}
        iconPosition="left"
        aria-label={`Login with ${passkeyTitle}`}
        onClick={() => loginMutation.mutate()}
        disabled={isLoading || !passkeyEnabled}
        autoFocus={true}
        shimmer
      >
        {`Unlock with ${passkeyTitle}`}
      </Button>

      <PopoverToast ref={toastPasskeyNotEnabledRef}>
        Passkey is not enabled
      </PopoverToast>
    </>
  );
}
