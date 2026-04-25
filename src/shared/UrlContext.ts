import type {
  AppMode,
  UrlContext,
  WindowLayout,
  WindowType,
} from './types/UrlContext';
import { UrlContextParam } from './types/UrlContext';

function getWindowType(params: URLSearchParams): WindowType {
  if (
    window.location.pathname.startsWith('/sidepanel') &&
    params.get(UrlContextParam.windowType) !== 'tab'
  ) {
    return 'sidepanel';
  }
  return (params.get(UrlContextParam.windowType) as WindowType) || 'popup';
}

function getUrlContext(): UrlContext {
  const params = new URL(window.location.href).searchParams;
  const pathname = window.location.pathname;
  return {
    appMode: (params.get(UrlContextParam.appMode) as AppMode) || 'wallet',
    windowType: getWindowType(params),
    windowLayout:
      (params.get(UrlContextParam.windowLayout) as WindowLayout) || 'column',
    isFullPage: pathname.endsWith('index.html'),
  };
}

export const urlContext = getUrlContext();
