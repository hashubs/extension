import { getError } from '@/shared/errors/get-error';
import { getNotificationUrl } from '@/shared/get-browser-url';
import { nanoid } from 'nanoid';
import type { Windows } from 'webextension-polyfill';
import browser from 'webextension-polyfill';

type WindowType = 'tab' | 'dialog';

function makeNotifRoute(route: string, _windowType: WindowType) {
  const notifUrl = getNotificationUrl();
  notifUrl.hash = route;
  return notifUrl.toString();
}

const IS_WINDOWS = /windows/i.test(navigator.userAgent);
const BROWSER_HEADER = 80;
const DEFAULT_WINDOW_SIZE = {
  width: 400 + (IS_WINDOWS ? 14 : 0), // windows cuts the width
  height: 600,
};
const DEFAULT_TAB_VIEW_WIDTH = 400;

export interface WindowProps {
  route: string;
  type: WindowType;
  search?: string;
  width?: number;
  height?: number | 'max';
}

export async function createBrowserWindow({
  width: rawWidth,
  height = DEFAULT_WINDOW_SIZE.height,
  route: initialRoute,
  search,
  type,
}: WindowProps) {
  const width =
    rawWidth ??
    (type === 'tab' ? DEFAULT_TAB_VIEW_WIDTH : DEFAULT_WINDOW_SIZE.width);
  const id = nanoid();
  const params = new URLSearchParams(search);
  params.append('windowId', id);

  const {
    top: currentWindowTop = 0,
    left: currentWindowLeft = 0,
    width: currentWindowWidth = 0,
  } = await browser.windows.getCurrent({
    windowTypes: ['normal'],
  } as Windows.GetInfo);

  const position = {
    top: currentWindowTop + BROWSER_HEADER,
    left: currentWindowLeft + currentWindowWidth - width,
  };

  let heightValue = DEFAULT_WINDOW_SIZE.height;
  if (height === 'max') {
    const currentWindow = await browser.windows.getCurrent();
    heightValue = Math.max(
      DEFAULT_WINDOW_SIZE.height,
      currentWindow.height ?? 0
    );
  } else {
    heightValue = height;
  }
  const windowOptions: Partial<Windows.CreateCreateDataType> = {
    focused: true,
    url: makeNotifRoute(`${initialRoute}?${params.toString()}`, type),
    type: type === 'dialog' ? 'popup' : 'normal',
    width,
    height: heightValue,
  };

  let window: Windows.Window | undefined;
  try {
    window = await browser.windows.create({
      ...windowOptions,
      ...position,
    });
  } catch (e) {
    const error = getError(e);
    if (error.message.includes('Invalid value for bound')) {
      window = await browser.windows.create({
        ...windowOptions,
        top: 0,
        left: 0,
      });
    } else {
      throw e;
    }
  }

  if (!window?.id) {
    throw new Error('Window ID not received from the window API.');
  }

  return { id, windowId: window.id };
}
