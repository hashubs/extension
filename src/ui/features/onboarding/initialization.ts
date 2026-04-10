import { getCurrentUser } from 'src/shared/get-current-user';
import { openOnboarding } from 'src/shared/open-onboarding';
import { OnboardingInterrupt } from './errors';

export async function maybeOpenOnboarding() {
  const hasExistingUser = Boolean(await getCurrentUser());
  const isOnboarding = document.location.hash.startsWith('#/onboarding');

  if (!isOnboarding && !hasExistingUser) {
    openOnboarding();
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: false,
    });
    window.close();
    throw new OnboardingInterrupt();
  }
}
