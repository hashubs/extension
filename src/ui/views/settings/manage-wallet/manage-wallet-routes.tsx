import { Route, Routes } from 'react-router-dom';
import { ManageWalletView } from './manage-wallet';
import { WalletAccountView } from './wallet-account';
import { WalletGroupView } from './wallet-group';

export function ManageWalletsRoutes() {
  return (
    <Routes>
      <Route index element={<ManageWalletView />} />
      <Route path="groups/:groupId" element={<WalletGroupView />} />
      <Route path="accounts/:address" element={<WalletAccountView />} />
    </Routes>
  );
}
