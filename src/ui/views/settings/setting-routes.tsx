import { Route, Routes } from 'react-router-dom';

import { ConnectedSitesRoutes } from './connected-sites';
import { CurrencyView } from './currency';
import { DeveloperToolsView } from './developer-tools';
import { NetworksRoutes } from './networks';
import { SecurityPrivacyRoutes } from './security-privacy';
import { SettingsView } from './settings';

export function SettingsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SettingsView />} />
      <Route path="/developer-tools" element={<DeveloperToolsView />} />
      <Route path="/networks/*" element={<NetworksRoutes />} />
      <Route path="/currency" element={<CurrencyView />} />
      <Route path="/security-privacy/*" element={<SecurityPrivacyRoutes />} />
      <Route path="/connected-sites/*" element={<ConnectedSitesRoutes />} />
    </Routes>
  );
}
