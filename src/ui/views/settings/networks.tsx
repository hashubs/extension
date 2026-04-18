import { Route, Routes } from 'react-router-dom';
import { AddNetwork, EditNetwork, ManageNetwork } from './network';

export function Networks() {
  return (
    <Routes>
      <Route path="/" element={<ManageNetwork />} />
      <Route path="/add" element={<AddNetwork />} />
      <Route path="/:id" element={<EditNetwork />} />
    </Routes>
  );
}
