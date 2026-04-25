import { accountPublicRPCPort, walletPort } from '@/shared/channels';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { useToastStore } from '@/shared/store/useToastStore';
import {
  estimatePasswordStrengh,
  Strength,
} from '@/shared/validation/password-strength';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { FormField } from '@/ui/components/form';
import { Layout } from '@/ui/components/layout';
import { StrengthIndicator } from '@/ui/components/strength-indicator';
import { useGetExistingUser } from '@/ui/hooks/request/internal/useAccount';
import { GET_PASSKEY_ENABLED_QUERY_KEY } from '@/ui/hooks/request/internal/usePasskey';
import { Drawer, DrawerContent, DrawerFooter, DrawerTitle } from '@/ui/ui-kit';
import { Button } from '@/ui/ui-kit/button';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MdLock, MdWarning } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const PASSWORD_MIN_LENGTH = 8;

function getError(error: unknown): { message: string } {
  if (error instanceof Error) return error;
  return { message: String(error) };
}

export function ChangePasswordView() {
  const navigate = useNavigate();

  const { show: showToast } = useToastStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [weakDrawerOpen, setWeakDrawerOpen] = useState(false);

  const pendingSubmitRef = useRef<{
    oldPassword: string;
    newPassword: string;
  } | null>(null);

  const userQuery = useGetExistingUser();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const stats = useMemo(
    () => estimatePasswordStrengh(newPassword),
    [newPassword]
  );

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => {
      if (oldPassword === newPassword) {
        throw new Error(
          'The new password must be different from the current one.'
        );
      }
      invariant(userQuery.data, 'User must be defined');
      await accountPublicRPCPort.request('changePassword', {
        user: userQuery.data,
        oldPassword,
        newPassword,
      });
    },
    onSuccess: () => {
      zeroizeAfterSubmission();
      walletPort.request('passwordChangeSuccess');
      showToast('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setFormError(null);
    },
    onSettled: () => {
      setNewPassword('');
      setConfirmPassword('');
      zeroizeAfterSubmission();
      queryClient.refetchQueries({ queryKey: GET_PASSKEY_ENABLED_QUERY_KEY });
    },
    onError: (error) => {
      walletPort.request('passwordChangeError');
      setFormError(getError(error).message || 'Unknown error');
    },
  });

  const submitChange = useCallback(
    (payload: { oldPassword: string; newPassword: string }) => {
      changePasswordMutation.mutate(payload);
    },
    [changePasswordMutation]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const formData = new FormData(event.currentTarget);
      const oldPassword = formData.get('oldPassword') as string | null;
      const newPwd = formData.get('newPassword') as string | null;
      const confirmPwd = formData.get('confirmPassword') as string | null;

      if (!oldPassword || !newPwd || !confirmPwd) return;
      if (newPwd !== confirmPwd) {
        setFormError('New passwords do not match.');
        return;
      }

      if (stats.strength === Strength.weak) {
        // Store payload and open the warning drawer
        pendingSubmitRef.current = { oldPassword, newPassword: newPwd };
        setWeakDrawerOpen(true);
      } else {
        submitChange({ oldPassword, newPassword: newPwd });
      }
    },
    [stats.strength, submitChange]
  );

  const handleProceedAnyway = useCallback(() => {
    setWeakDrawerOpen(false);
    if (pendingSubmitRef.current) {
      submitChange(pendingSubmitRef.current);
      pendingSubmitRef.current = null;
    }
  }, [submitChange]);

  const handleImprovePassword = useCallback(() => {
    setWeakDrawerOpen(false);
    pendingSubmitRef.current = null;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    !changePasswordMutation.isPending &&
    newPassword.length >= PASSWORD_MIN_LENGTH &&
    confirmPassword.length >= PASSWORD_MIN_LENGTH &&
    passwordsMatch;

  return (
    <>
      <Layout
        title="Change Password"
        onBack={() =>
          navigate('/settings/security-privacy', {
            state: { direction: 'back' },
          })
        }
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Change Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your wallet password. Make sure to choose a strong one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            ref={inputRef}
            id="oldPassword"
            label="Current Password"
            name="oldPassword"
            type="password"
            placeholder="••••••••"
            required
            icon={MdLock}
          />

          <div className="space-y-1.5">
            <FormField
              id="newPassword"
              label="New Password"
              name="newPassword"
              type="password"
              placeholder={`Min. ${PASSWORD_MIN_LENGTH} characters`}
              required
              minLength={PASSWORD_MIN_LENGTH}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={MdLock}
              isValid={newPassword.length > 0 && passwordsMatch}
            />
            {newPassword.length > 0 && <StrengthIndicator stats={stats} />}
          </div>

          <div className="space-y-1.5">
            <FormField
              id="confirmPassword"
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={MdLock}
              isError={confirmPassword.length > 0 && !passwordsMatch}
              isValid={confirmPassword.length > 0 && passwordsMatch}
              status={passwordsMatch ? 'success' : 'error'}
            />
          </div>

          {(changePasswordMutation.isError || formError) && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              <MdWarning size={16} className="mt-0.5 shrink-0" />
              <span>
                {formError ||
                  getError(changePasswordMutation.error).message ||
                  'Unknown error'}
              </span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!canSubmit}
            loading={changePasswordMutation.isPending}
            loadingText="Changing…"
          >
            Change Password
          </Button>
        </form>
      </Layout>

      <Drawer open={weakDrawerOpen} onOpenChange={setWeakDrawerOpen}>
        <DrawerContent
          variant="inset"
          title="Weak Password"
          description="Your password is weak"
        >
          <div className="flex items-center justify-center gap-2 mb-1 pt-2">
            <MdWarning size={20} className="text-yellow-500 shrink-0" />
            <DrawerTitle>Weak Password</DrawerTitle>
          </div>

          <div className="px-4 text-sm text-muted-foreground leading-relaxed">
            Your new password is considered{' '}
            <span className="font-medium text-yellow-500">weak</span>. We
            recommend using a longer password with a mix of letters, numbers,
            and symbols for better security. Would you like to improve it, or
            proceed anyway?
          </div>

          <DrawerFooter className="gap-2">
            <Button className="w-full" onClick={handleImprovePassword}>
              Improve Password
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleProceedAnyway}
            >
              Proceed Anyway
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
