import { getPasskeyTitle, setupAccountPasskey } from '@/modules/passkey';
import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { invariant } from '@/shared/invariant';
import { queryClient } from '@/shared/query-client/queryClient';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { FormField } from '@/ui/components/form';
import {
  PopoverToast,
  PopoverToastHandle,
} from '@/ui/components/toast/PopoverToast';
import {
  Button,
  CardItem,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/ui/ui-kit';
import { Switch } from '@/ui/ui-kit/switch';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { LuFingerprint } from 'react-icons/lu';
import { MdLock, MdWarning } from 'react-icons/md';

export function PasskeyItem() {
  const toastRef = useRef<PopoverToastHandle>(null);
  const [userValue, setUserValue] = useState<boolean | null>(null);
  const [openEnable, setOpenEnable] = useState(false);
  const [openDisable, setOpenDisable] = useState(false);
  const [password, setPassword] = useState('');
  const passkeyTitle = getPasskeyTitle();

  const passkeyAvailabilityQuery = useQuery({
    queryKey: ['passkey/isSupported'],
    queryFn: async () => {
      if (!window.PublicKeyCredential) return false;
      try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        return false;
      }
    },
    staleTime: Infinity,
  });

  const defaultValueQuery = useQuery({
    queryKey: ['account/getPasskeyEnabled'],
    queryFn: () => accountPublicRPCPort.request('getPasskeyEnabled'),
  });

  const userQuery = useQuery({
    queryKey: ['account/getExistingUser'],
    queryFn: () => accountPublicRPCPort.request('getExistingUser'),
  });

  const setupTouchIdMutation = useMutation({
    mutationFn: async (password: string) => {
      invariant(userQuery.data, 'User must be defined');
      await accountPublicRPCPort.request('login', {
        user: userQuery.data,
        password,
      });
      return setupAccountPasskey(password);
    },
    onSuccess: () => {
      walletPort.request('passkeyLoginEnabled');
      queryClient.invalidateQueries({
        queryKey: ['account/getPasskeyEnabled'],
      });
      zeroizeAfterSubmission();
      toastRef.current?.showToast();
      setOpenEnable(false);
      setUserValue(true);
      setPassword(''); // Reset after success
    },
  });

  const removeTouchIdMutation = useMutation({
    mutationFn: async () => {
      await accountPublicRPCPort.request('removePasskey');
    },
    onSuccess: () => {
      walletPort.request('passkeyLoginDisabled');
      queryClient.invalidateQueries({
        queryKey: ['account/getPasskeyEnabled'],
      });
      setOpenDisable(false);
      setUserValue(false);
    },
  });

  const checked = userValue ?? defaultValueQuery.data ?? false;
  const isLoading =
    userQuery.isLoading ||
    setupTouchIdMutation.isPending ||
    removeTouchIdMutation.isPending ||
    defaultValueQuery.isLoading;

  const handleToggle = useCallback(() => {
    if (checked) {
      setOpenDisable(true);
    } else {
      setOpenEnable(true);
    }
  }, [checked]);

  const handleEnableSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    if (password) {
      setupTouchIdMutation.mutate(password);
    }
  };

  if (!passkeyAvailabilityQuery.data && process.env.NODE_ENV === 'production')
    return null;

  return (
    <>
      <CardItem
        item={{
          label: passkeyTitle,
          icon: LuFingerprint,
          onClick: handleToggle,
          disabled: isLoading,
          badge: <Switch checked={checked} disabled={isLoading} />,
        }}
      />

      <Drawer open={openEnable} onOpenChange={setOpenEnable}>
        <DrawerContent variant="inset">
          <DrawerHeader>
            <DrawerTitle>Enter Password</DrawerTitle>
            <DrawerDescription>
              Verification is required to enable login via {passkeyTitle}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleEnableSubmit} className="px-4 space-y-4">
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={MdLock}
              error={(setupTouchIdMutation.error as Error)?.message}
            />

            <DrawerFooter className="px-0 pb-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!password.trim() || setupTouchIdMutation.isPending}
                loading={setupTouchIdMutation.isPending}
                loadingText="Verifying..."
              >
                Enable {passkeyTitle}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Disable Passkey Drawer */}
      <Drawer open={openDisable} onOpenChange={setOpenDisable}>
        <DrawerContent variant="inset">
          <DrawerHeader>
            <div className="flex justify-center mb-2 text-yellow-500">
              <MdWarning size={32} />
            </div>
            <DrawerTitle>Turn Off {passkeyTitle} Unlock?</DrawerTitle>
            <DrawerDescription>
              You will be able to log in only with your password. You can turn
              this back on at any time.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerFooter>
            <Button
              variant="danger"
              onClick={() => removeTouchIdMutation.mutate()}
              loading={removeTouchIdMutation.isPending}
              loadingText="Disabling..."
            >
              Turn Off {passkeyTitle}
            </Button>
            <Button variant="outline" onClick={() => setOpenDisable(false)}>
              Back
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <PopoverToast ref={toastRef}>{passkeyTitle} is enabled.</PopoverToast>
    </>
  );
}
