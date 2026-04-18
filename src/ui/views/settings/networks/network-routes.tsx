import { Route, Routes } from 'react-router-dom';
import { AddNetwork } from './add-network/AddNetwork';
import { EditNetwork } from './edit-network/EditNetwork';
import { ManageNetwork } from './manage-network/ManageNetwork';

export function NetworksRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ManageNetwork />} />
      <Route path="/add" element={<AddNetwork />} />
      <Route path="/:id" element={<EditNetwork />} />
    </Routes>
  );
}
