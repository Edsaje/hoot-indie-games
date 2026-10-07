import React, { type ReactNode } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HeadlessModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  initial?: any;
  animate?: any;
  exit?: any;
}

export const HeadlessModal: React.FC<HeadlessModalProps> = ({
  isOpen,
  onClose,
  children,
  panelClassName = 'relative overflow-hidden sm:overflow-visible w-full h-full sm:h-auto max-w-2xl bg-[#06241b] sm:border-2 border-0 border-[#78350f] rounded-none sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl max-h-[100dvh] sm:max-h-[90dvh] flex flex-col',
  initial = { opacity: 0, scale: 0.95, y: 20 },
  animate = { opacity: 1, scale: 1, y: 0 },
  exit = { opacity: 0, scale: 0.95, y: 20 },
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-50">
          <DialogBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
            <DialogPanel
              as={motion.div}
              initial={initial}
              animate={animate}
              exit={exit}
              className={panelClassName}
            >
              {children}
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
