import { accountPublicRPCPort, walletPort } from '@/shared/channel';
import { isSessionExpiredError } from '@/shared/isSessionExpiredError';
import { prepareUserInputSeedOrPrivateKey } from '@/shared/prepareUserInputSeedOrPrivateKey';
import { setCurrentAddress } from '@/shared/request/internal/setCurrentAddress';
import { wait } from '@/shared/wait';
import { encodeForMasking } from '@/shared/wallet/encode-locally';
import { zeroizeAfterSubmission } from '@/shared/zeroize-submission';
import { prepareWalletsToImport } from '@/ui/components/ImportWallet/Mnemonic/helpers';
import { Processing as ProcessingComponent } from '@/ui/components/processing';
import { useMutation } from '@tanstack/react-query';
import { isTruthy } from 'is-truthy-ts';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ONBOARDING_ROUTES } from '../routes';
import { useImportWallet } from './import-context';

export function Processing() {
  const navigate = useNavigate();
  const { phrase, privateKey, method, password, selectedAddresses } =
    useImportWallet();
  const mounted = useRef(false);

  const { mutate: createUserAndWallet } = useMutation({
    mutationFn: async () => {
      await wait(500);
      if (!password) {
        throw new Error('Password is not set');
      }

      await accountPublicRPCPort.request('createUser', { password });

      let data: any = null;

      if (method === 'phrase') {
        if (!phrase) throw new Error('Recovery phrase is missing');
        if (selectedAddresses.size === 0)
          throw new Error('No addresses selected');

        const secretKey = prepareUserInputSeedOrPrivateKey(phrase);
        const encodedPhrase = encodeForMasking(secretKey);

        const preparation = await prepareWalletsToImport(encodedPhrase);
        if (!preparation) throw new Error('Failed to derive wallets');

        const { derivedWallets } = preparation;

        const allMaskedWallets = derivedWallets.flatMap((d) => d.wallets);
        const selectedWallets = allMaskedWallets.filter((w) =>
          selectedAddresses.has(w.address)
        );

        if (selectedWallets.length === 0) {
          throw new Error('No valid selected addresses found');
        }

        data = await walletPort.request(
          'uiImportSeedPhrase',
          selectedWallets.map((wallet) => wallet.mnemonic).filter(isTruthy)
        );
      } else if (method === 'privateKey') {
        if (!privateKey) throw new Error('Private key is missing');

        const secretKey = prepareUserInputSeedOrPrivateKey(privateKey);
        const encodedKey = encodeForMasking(secretKey);

        data = await walletPort.request('uiImportPrivateKey', encodedKey);
      } else {
        throw new Error(`Unknown method: ${method}`);
      }

      await accountPublicRPCPort.request('saveUserAndWallet');

      const firstAddress =
        method === 'phrase' ? Array.from(selectedAddresses)[0] : data?.address;

      if (firstAddress) {
        await setCurrentAddress({ address: firstAddress });
      }
    },
    onSuccess: () => {
      zeroizeAfterSubmission();
      navigate(`../${ONBOARDING_ROUTES.SUCCESS}`, { replace: true });
    },
    onError: (error) => {
      if (isSessionExpiredError(error)) {
        navigate(`../../${ONBOARDING_ROUTES.SESSION_EXPIRED}`, {
          replace: true,
        });
      }
    },
  });

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      createUserAndWallet();
    }
  }, [createUserAndWallet]);

  return (
    <ProcessingComponent
      title="Importing your wallet"
      description="Please wait while we secure your wallet and save your preferences..."
    />
  );
}
