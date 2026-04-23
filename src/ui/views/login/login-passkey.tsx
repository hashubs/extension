import { getPasskeyTitle } from '@/modules/passkey';
import { PublicUser } from '@/shared/types/User';
import {
  getPasskeyEnabled,
  usePasskeyLogin,
} from '@/ui/hooks/request/internal/usePasskey';
import { Button } from '@/ui/ui-kit';
import { useEffect, useRef } from 'react';
import { LuFingerprint, LuLoader } from 'react-icons/lu';
import { useNavigationType } from 'react-router-dom';

export function LoginPasskey({
  user,
  onSuccess,
}: {
  user: PublicUser | undefined;
  onSuccess: () => void;
}) {
  const defaultValueQuery = getPasskeyEnabled();

  const passkeyEnabled = defaultValueQuery.data;

  const { mutation: loginMutation } = usePasskeyLogin({
    user,
    passkeyEnabled,
    onSuccess,
  });

  const navigationType = useNavigationType();
  const autologinRef = useRef(false);
  const passkeyTitle = getPasskeyTitle();

  const isLoading = loginMutation.isPending;

  useEffect(() => {
    // Automatically trigger passkey login if the user navigated here via a
    // replace action — this happens when redirected to login on popup open.
    const showSuggestPasskey = navigationType === 'REPLACE';
    if (showSuggestPasskey && passkeyEnabled && !autologinRef.current) {
      autologinRef.current = true;
      loginMutation.mutate();
    }
  }, [navigationType, passkeyEnabled, loginMutation]);

  if (!passkeyEnabled) {
    return null;
  }

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
        icon={isLoading ? LuLoader : LuFingerprint}
        iconClassName={isLoading ? 'animate-spin' : ''}
        iconPosition="left"
        aria-label={`Login with ${passkeyTitle}`}
        onClick={() => loginMutation.mutate()}
        disabled={isLoading || !passkeyEnabled}
        autoFocus={true}
        shimmer
      >
        Unlock with {passkeyTitle}
      </Button>

      {loginMutation.isError && (
        <p className="text-xs text-destructive text-center mt-2">
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : 'Authentication failed. Please try again.'}
        </p>
      )}
    </>
  );
}
