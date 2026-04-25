import { urlContext } from '@/shared/UrlContext';
import { getCurrentUser } from 'src/shared/get-current-user';
import { openOnboarding } from 'src/shared/open-onboarding';
import { OnboardingInterrupt } from './errors';

export async function maybeOpenOnboarding() {
  const hasExistingUser = Boolean(await getCurrentUser());

  const isOnboardingMode = urlContext.appMode === 'onboarding';

  if (!isOnboardingMode && !hasExistingUser) {
    openOnboarding();
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: false,
    });
    window.close();
    throw new OnboardingInterrupt();
  }
}
