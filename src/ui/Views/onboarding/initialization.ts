import { getCurrentUser } from 'src/shared/get-current-user';
import { openOnboarding } from 'src/shared/open-onboarding';
import { OnboardingInterrupt } from './errors';

/**
 * Ensures the user is redirected to the onboarding flow if no account is detected.
 * This is primarily used in the Popup entry point to redirect new users to a 
 * full-tab setup experience (onboarding.html) for better UX.
 * 
 * It checks the current page context to prevent redirect loops when called 
 * from within the onboarding page itself.
 */
export async function maybeOpenOnboarding() {
  const hasExistingUser = Boolean(await getCurrentUser());
  const isOnboarding = window.location.pathname.endsWith('index.html');

  if (!isOnboarding && !hasExistingUser) {
    openOnboarding();
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: false,
    });
    window.close();
    throw new OnboardingInterrupt();
  }
}
