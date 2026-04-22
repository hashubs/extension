import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { WithPasswordSession } from '@/ui/components/verify-user/WithPasswordSession';
import { MemoryLocationState } from './memoryLocationState';
import { MnemonicImportView } from './mnemonic';

export function ImportWalletRoutes() {
  const [memoryLocationState] = useState(() => new MemoryLocationState({}));
  return (
    <Routes>
      <Route
        path="/mnemonic"
        element={
          <WithPasswordSession text="Recovery phrase will be encrypted with your password">
            <MnemonicImportView locationStateStore={memoryLocationState} />
          </WithPasswordSession>
        }
      />
    </Routes>
  );
}
