import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalPreferences } from '../../../features/preferences/usePreferences';
import { useOnboardingSession } from '../../../hooks/useOnboardingSession';

import { ONBOARDING_ROUTES } from '../routes';

export function ShareData() {
  const navigate = useNavigate();
  const { globalPreferences, setGlobalPreferences, query } =
    useGlobalPreferences();

  useOnboardingSession({ navigateOnExistingUser: ONBOARDING_ROUTES.SUCCESS });

  useEffect(() => {
    if (!query.isLoading && globalPreferences?.analyticsEnabled != null) {
      navigate(`../${ONBOARDING_ROUTES.WELCOME}`);
    }
  }, [query.isLoading, globalPreferences?.analyticsEnabled, navigate]);

  const handleAnalyticsChoiceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return setGlobalPreferences({
        analyticsEnabled: enabled,
      });
    },
    onSuccess: () => {
      navigate(`../${ONBOARDING_ROUTES.WELCOME}`);
    },
  });

  console.log(handleAnalyticsChoiceMutation.data);

  if (query.isLoading) {
    return null;
  }

  return (
    <>
      <div>Share Data</div>
    </>
  );
}
