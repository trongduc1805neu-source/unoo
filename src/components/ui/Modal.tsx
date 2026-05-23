import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-md relative z-10 p-6 flex flex-col max-h-[90vh]"
          >
            
            <div className="flex justify-between items-center mb-6 relative z-10 border-b border-[var(--color-border)] pb-4">
              <h2 className="text-2xl font-heading text-[var(--color-foreground)]">
                {title}
              </h2>
              <button onClick={onClose} aria-label="Đóng" className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-foreground)] hover:bg-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-colors p-0 text-xl font-bold">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
