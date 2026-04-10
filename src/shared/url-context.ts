import type {
  AppMode,
  UrlContext,
  WindowLayout,
  WindowType,
} from './types/url-context';
import { UrlContextParam } from './types/url-context';

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
  return {
    appMode: (params.get(UrlContextParam.appMode) as AppMode) || 'wallet',
    windowType: getWindowType(params),
    windowLayout:
      (params.get(UrlContextParam.windowLayout) as WindowLayout) || 'column',
  };
}

export const urlContext = getUrlContext();
