export type WindowType = 'popup' | 'tab' | 'dialog' | 'sidepanel';

export function getWindowType(): WindowType {
  const { pathname } = window.location;
  if (pathname.includes('sidepanel')) return 'sidepanel';
  if (pathname.includes('popup')) return 'popup';
  if (pathname.includes('notification')) return 'dialog';
  return 'tab';
}
