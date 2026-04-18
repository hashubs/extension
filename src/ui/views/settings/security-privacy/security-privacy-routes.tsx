import { Route, Routes } from 'react-router-dom';
import { AutoLockTimerView } from './auto-lock-timer';
import { ChangePasswordView } from './change-password';
import { SecurityPrivacyView } from './security-privacy';

export function SecurityPrivacyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SecurityPrivacyView />} />
      <Route path="/auto-lock" element={<AutoLockTimerView />} />
      <Route path="/change-password" element={<ChangePasswordView />} />
    </Routes>
  );
}
