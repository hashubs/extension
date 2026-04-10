import { urlContext } from '@/shared/url-context';
import PopupIcon from 'jsx:@/ui/assets/popup.svg';
import SidepanelIcon from 'jsx:@/ui/assets/sidepanel.svg';
import React, { useMemo } from 'react';
import { openSidePanel } from '../sidepanel-apis';
import { isSidepanelSupported } from '../sidepanel-support';

function closeIfNotInTab() {
  if (urlContext.windowType !== 'tab') {
    window.close();
  }
}

function SidepanelOptionsButtonComponent() {
  const isSidepanel = urlContext.windowType === 'sidepanel';

  return (
    <div className="relative">
      <button
        type="button"
        title={
          isSidepanel
            ? 'Close Sidepanel, open next time as popup'
            : 'Open Sidepanel'
        }
        className="flex items-center justify-center w-9 h-9 p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        style={{ ['anchorName' as string]: '--popover-1' }}
        onClick={async () => {
          if (!isSidepanel) {
            await openSidePanel({
              pathname: '/',
              searchParams: null,
              openPanelOnActionClickParam: true,
            });
            closeIfNotInTab();
          } else {
            await chrome.sidePanel.setPanelBehavior({
              openPanelOnActionClick: false,
            });
            window.close();
          }
        }}
      >
        {React.createElement(isSidepanel ? PopupIcon : SidepanelIcon, {
          className: 'block w-5 h-5',
        })}
      </button>
    </div>
  );
}

export function SidepanelOptionsButton() {
  const requiredApisSupported = useMemo(() => {
    const supportsSidepanel = isSidepanelSupported();
    return supportsSidepanel;
  }, []);
  if (!requiredApisSupported) {
    return null;
  }
  return <SidepanelOptionsButtonComponent />;
}
