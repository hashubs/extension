import { Route, Routes } from 'react-router-dom';
import { DeveloperTools } from './developer-tools';
import { Networks } from './networks';
import { SettingsList } from './setting-list';

export function Settings() {
  return (
    <Routes>
      <Route path="/" element={<SettingsList />} />
      <Route path="/developer-tools" element={<DeveloperTools />} />
      <Route path="/networks/*" element={<Networks />} />
    </Routes>
  );
}
