import { emitter } from '@/shared/events';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'src/shared/get-current-user';
import {
  ONBOARDING_ROUTES,
  TopLevelRouteValues,
} from '../views/onboarding/routes';

export function useOnboardingSession({
  navigateOnExistingUser,
}: {
  navigateOnExistingUser: Extract<
    TopLevelRouteValues,
    typeof ONBOARDING_ROUTES.SESSION_EXPIRED | typeof ONBOARDING_ROUTES.SUCCESS
  >;
}) {
  const navigate = useNavigate();

  const { data: existingUser, isLoading } = useQuery({
    queryKey: ['getCurrentUser'],
    queryFn: async () => {
      const result = await getCurrentUser();
      return result || null;
    },
    suspense: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    console.log('[DEBUG] useOnboardingSession: existingUser =', existingUser);
    if (existingUser) {
      if (navigateOnExistingUser === ONBOARDING_ROUTES.SESSION_EXPIRED) {
        console.log(
          '[DEBUG] useOnboardingSession: Redirecting to SESSION_EXPIRED'
        );
        navigate('/onboarding/' + ONBOARDING_ROUTES.SESSION_EXPIRED, {
          replace: true,
        });
      } else {
        console.log('[DEBUG] useOnboardingSession: Redirecting to SUCCESS');
        navigate('/onboarding/' + ONBOARDING_ROUTES.SUCCESS);
        emitter.emit('reloadExtension');
      }
    }
  }, [existingUser, navigate, navigateOnExistingUser]);

  return {
    sessionDataIsLoading: isLoading,
  };
}
