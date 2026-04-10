import { Theme } from './Theme';

export function applyTheme(theme: Theme) {
  if (theme === Theme.dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.body.style.setProperty('--default-background', 'var(--background)');
}
