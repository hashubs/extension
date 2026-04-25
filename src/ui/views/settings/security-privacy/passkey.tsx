import { getPasskeyTitle } from '@/modules/passkey';
import { useToastStore } from '@/shared/store/useToastStore';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { FormField } from '@/ui/components/form';
import { useGetExistingUser } from '@/ui/hooks/request/internal/useAccount';
import {
  getPasskeyEnabled,
  usePasskeyAvailability,
  useRemovePasskey,
  useSetupPasskey,
} from '@/ui/hooks/request/internal/usePasskey';
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
import { useCallback, useState } from 'react';
import { LuFingerprint } from 'react-icons/lu';
import { MdLock, MdWarning } from 'react-icons/md';

export function PasskeyItem() {
  const { show: showToast } = useToastStore();
  const [userValue, setUserValue] = useState<boolean | null>(null);
  const [openEnable, setOpenEnable] = useState(false);
  const [openDisable, setOpenDisable] = useState(false);
  const [password, setPassword] = useState('');
  const passkeyTitle = getPasskeyTitle();

  const passkeyAvailabilityQuery = usePasskeyAvailability();

  const defaultValueQuery = getPasskeyEnabled();
  const userQuery = useGetExistingUser();

  const setupTouchIdMutation = useSetupPasskey({
    onSuccess: () => {
      zeroizeAfterSubmission();
      showToast(`${passkeyTitle} is enabled.`);
      setOpenEnable(false);
      setUserValue(true);
      setPassword('');
    },
  });

  const removeTouchIdMutation = useRemovePasskey({
    onSuccess: () => {
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
              icon={MdLock}
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
    </>
  );
}
