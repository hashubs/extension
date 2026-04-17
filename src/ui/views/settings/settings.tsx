import { Route, Routes } from 'react-router-dom';
import { Networks } from '../network';
import { Connectivity } from './connectivity';
import { SettingsList } from './setting-list';

export function Settings() {
  return (
    <Routes>
      <Route path="/" element={<SettingsList />} />
      <Route path="/connectivity" element={<Connectivity />} />
      <Route path="/networks/*" element={<Networks />} />
    </Routes>
  );
}
