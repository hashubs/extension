import { accountPublicRPCPort } from '@/shared/channels';
import { SidepanelOptionsButton } from '@/shared/sidepanel/SidepanelOptionsButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/ui-kit';
import { useMutation } from '@tanstack/react-query';
import { LuLayoutGrid, LuLock, LuQrCode, LuSettings } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

export function MenuDropdown() {
  const navigate = useNavigate();

  const logout = useMutation({
    mutationFn: () => accountPublicRPCPort.request('logout'),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="hover:opacity-70 transition-opacity p-1 rounded-md outline-none">
            <LuLayoutGrid size={20} />
          </button>
        }
      />
      <DropdownMenuContent className="w-45" align="end">
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <LuSettings />
          Setting
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LuQrCode />
          My QR Code
        </DropdownMenuItem>
        <SidepanelOptionsButton as={DropdownMenuItem} />
        <DropdownMenuItem
          onClick={async () => {
            await logout.mutateAsync();
            navigate('/login');
          }}
        >
          <LuLock />
          Lock Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
