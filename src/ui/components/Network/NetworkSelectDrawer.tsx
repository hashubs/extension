import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/ui/ui-kit/drawer';
import { Input } from '@/ui/ui-kit/input';
import * as React from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useSearchParams } from 'react-router-dom';
import { NetworkList } from './NetworkList';

interface NetworkSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NetworkSelectDrawer({
  open,
  onOpenChange,
}: NetworkSelectDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');

  const activeNetworkId = searchParams.get('network') || 'all';

  const handleSelect = (networkId: string) => {
    if (networkId === 'all') {
      searchParams.delete('network');
    } else {
      searchParams.set('network', networkId);
    }
    setSearchParams(searchParams);
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-xl font-bold text-left mb-4">
            Select Network
          </DrawerTitle>
          <Input
            placeholder="Search networks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={IoSearchOutline}
            size="lg"
            className="bg-accent/50 border-none rounded-2xl"
          />
        </DrawerHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <NetworkList
            activeNetworkId={activeNetworkId}
            onSelect={handleSelect}
            searchQuery={searchQuery}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
