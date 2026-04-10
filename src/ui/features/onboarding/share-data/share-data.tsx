import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingSession } from '../../../hooks/useOnboardingSession';
import { useGlobalPreferences } from '../../preferences/usePreferences';

export function ShareData() {
  const navigate = useNavigate();
  const { globalPreferences, setGlobalPreferences, query } =
    useGlobalPreferences();

  useOnboardingSession({ navigateOnExistingUser: 'success' });

  useEffect(() => {
    if (!query.isLoading && globalPreferences?.analyticsEnabled != null) {
      navigate('/onboarding/welcome');
    }
  }, [query.isLoading, globalPreferences?.analyticsEnabled, navigate]);

  const handleAnalyticsChoiceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return setGlobalPreferences({
        analyticsEnabled: enabled,
      });
    },
    onSuccess: () => {
      navigate('/onboarding/welcome');
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
