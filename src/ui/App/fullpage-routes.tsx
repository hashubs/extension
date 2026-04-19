import { Onboarding } from '@/ui/views/onboarding/onboarding';
import { PhishingWarningPage } from '@/ui/views/phishing-warning';
import { Navigate, Route, Routes } from 'react-router-dom';

export function FullPageRoutes() {
  return (
    <Routes>
      <Route path="/onboarding/*" element={<Onboarding />} />
      <Route path="/phishing-warning" element={<PhishingWarningPage />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}
