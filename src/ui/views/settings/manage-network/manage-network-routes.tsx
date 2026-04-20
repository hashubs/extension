import { Route, Routes } from 'react-router-dom';
import { AddNetwork } from './add-network';
import { EditNetwork } from './edit-network';
import { ManageNetwork } from './manage-network';

export function ManageNetworksRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ManageNetwork />} />
      <Route path="/add" element={<AddNetwork />} />
      <Route path="/:id" element={<EditNetwork />} />
    </Routes>
  );
}
