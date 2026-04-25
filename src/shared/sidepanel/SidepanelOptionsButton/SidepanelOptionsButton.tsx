import { getWindowType } from '@/shared/window-type';
import { PopupIcon } from '@/ui/components/svg/popup';
import { SidepannelIcon } from '@/ui/components/svg/sidepannel';
import { DropdownMenuItem } from '@/ui/ui-kit';
import { ElementType, useMemo } from 'react';
import { openSidePanel } from '../sidepanel-apis';
import { isSidepanelSupported } from '../sidepanel-support';

function closeIfNotInTab() {
  if (getWindowType() !== 'tab') {
    window.close();
  }
}

interface SidepanelOptionsButtonComponentProps {
  as?: ElementType;
}

function SidepanelOptionsButtonComponent({
  as: Component = DropdownMenuItem,
}: SidepanelOptionsButtonComponentProps) {
  const isSidepanel = getWindowType() === 'sidepanel';

  return (
    <Component
      title={
        isSidepanel
          ? 'Close Sidepanel, open next time as popup'
          : 'Open Sidepanel'
      }
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
      className="onlyDesktop"
    >
      {isSidepanel ? (
        <>
          <PopupIcon className="block w-5 h-5" />
          Open as popup
        </>
      ) : (
        <>
          <SidepannelIcon className="block w-5 h-5" />
          Open as sidepanel
        </>
      )}
    </Component>
  );
}

export interface SidepanelOptionsButtonProps {
  as?: ElementType;
}

export function SidepanelOptionsButton({ as }: SidepanelOptionsButtonProps) {
  const requiredApisSupported = useMemo(() => isSidepanelSupported(), []);
  if (!requiredApisSupported) return null;
  return <SidepanelOptionsButtonComponent as={as} />;
}
