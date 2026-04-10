import { initialize as initializeApperance } from '@/ui/features/appearance';
import { Onboarding } from '@/ui/Views/onboarding/onboarding';
import { PhishingWarningPage } from '@/ui/Views/phishing-warning';
import { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BaseApp } from '../base/App';
import * as styles from './style.module.css';

initializeApperance();

export interface AppProps {
  inspect?: { message: string };
}

export function App({ inspect }: AppProps) {
  const bodyClassList = useMemo(() => [styles.layoutFullscreen], []);

  return (
    <BaseApp bodyClassList={bodyClassList} inspect={inspect}>
      <Routes>
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route path="/phishing-warning" element={<PhishingWarningPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </BaseApp>
  );
}
