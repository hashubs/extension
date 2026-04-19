import { Route, Routes } from 'react-router-dom';
import { ConnectedSiteView } from './connected-site';
import { ConnectedSitesView } from './connected-sites';

export function ConnectedSitesRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ConnectedSitesView />} />
      <Route path="/:originName" element={<ConnectedSiteView />} />
    </Routes>
  );
}
