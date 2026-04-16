'use client';

import { Drawer, DrawerContent } from '@/ui/ui-kit';
import React from 'react';
import { LuX } from 'react-icons/lu';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent variant="inset" title={title} description={title}>
        <div className="px-4 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between sticky top-[16px] bg-background z-10">
            <h3 className="text-lg font-bold text-foreground px-2">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>

          <div>{children}</div>

          {footer && <div className="mt-2">{footer}</div>}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
