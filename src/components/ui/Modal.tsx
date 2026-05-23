import { ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const modalVariants = {
    hidden: isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 },
    visible: { y: 0, opacity: 1, scale: 1 },
    exit: isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={isMobile ? { type: 'spring', damping: 30, stiffness: 300 } : { duration: 0.2, ease: 'easeOut' }}
            className="glass-card w-full sm:max-w-md relative z-10 p-6 sm:p-7 flex flex-col max-h-[92vh] sm:max-h-[90vh] rounded-t-[2rem] rounded-b-none sm:rounded-[2.5rem] border-t sm:border border-[var(--color-border)] shadow-2xl"
          >
            {/* Grab handle bar for bottom sheet style on mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-[var(--color-border)]/75 rounded-full mx-auto mb-4 shrink-0 opacity-70" />
            
            <div className="flex justify-between items-center mb-6 relative z-10 border-b border-[var(--color-border)]/45 pb-4.5">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[var(--color-foreground)] tracking-tight">
                {title}
              </h2>
              <button 
                onClick={onClose} 
                aria-label="Đóng" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-foreground)] hover:bg-[var(--color-border)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all p-0 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pr-0.5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
