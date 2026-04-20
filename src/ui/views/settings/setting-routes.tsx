import { Route, Routes } from 'react-router-dom';

import { ConnectedSitesRoutes } from './connected-sites';
import { CurrencyView } from './currency';
import { DeveloperToolsView } from './developer-tools';
import { ManageNetworksRoutes } from './manage-network';
import { ManageWalletsRoutes } from './manage-wallet';
import { SecurityPrivacyRoutes } from './security-privacy';
import { SettingsView } from './settings';
import { ThemeView } from './theme';

export function SettingsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SettingsView />} />
      <Route path="/developer-tools" element={<DeveloperToolsView />} />
      <Route path="/currency" element={<CurrencyView />} />
      <Route path="/theme" element={<ThemeView />} />
      <Route path="/security-privacy/*" element={<SecurityPrivacyRoutes />} />
      <Route path="/connected-sites/*" element={<ConnectedSitesRoutes />} />
      <Route path="/manage-networks/*" element={<ManageNetworksRoutes />} />
      <Route path="/manage-wallets/*" element={<ManageWalletsRoutes />} />
    </Routes>
  );
}
