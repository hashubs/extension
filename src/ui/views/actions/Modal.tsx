'use client';

import { Button, Drawer, DrawerContent } from '@/ui/ui-kit';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent variant="inset" title={title} description={title}>
        <div className="px-4 pb-4 flex flex-col gap-4">
          <div>{children}</div>
          <Button onClick={onClose} variant="primary" size="md" shimmer>
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
