import { WithPasswordSession } from '@/ui/components/verify-user/WithPasswordSession';
import { Route, Routes } from 'react-router-dom';

import { EcosystemSelectView } from './create-wallet/ecosystem-select';
import { GenerateWalletView } from './create-wallet/generate-wallet';
import { NewWalletExistingView } from './create-wallet/new-wallet-existing';
import { NewWalletOptionView } from './create-wallet/new-wallet-option';
import { WalletGroupSelectView } from './create-wallet/wallet-group-select';
import { ManageWalletView } from './manage-wallet';
import { WalletAccountView } from './wallet-account';
import { WalletGroupView } from './wallet-group';

import { AddWalletRoutes } from './add-wallet';
import { BackupWalletRoutes } from './backup-wallet';

export function ManageWalletsRoutes() {
  return (
    <Routes>
      <Route index element={<ManageWalletView />} />
      <Route path="groups/:groupId" element={<WalletGroupView />} />
      <Route path="accounts/:address" element={<WalletAccountView />} />

      <Route path="create-wallet">
        <Route index element={<NewWalletOptionView />} />
        <Route path="existing" element={<NewWalletExistingView />} />
        <Route path="select-group" element={<WalletGroupSelectView />} />
        <Route path="select-ecosystem">
          <Route index element={<EcosystemSelectView />} />
          <Route
            path="generate"
            element={
              <WithPasswordSession
                text="Your password is required to securely access your recovery phrase."
                buttonTitle="Continue"
              >
                <GenerateWalletView />
              </WithPasswordSession>
            }
          />
        </Route>
      </Route>

      <Route path="add-wallet/*" element={<AddWalletRoutes />} />
      <Route path="backup/*" element={<BackupWalletRoutes />} />
    </Routes>
  );
}
