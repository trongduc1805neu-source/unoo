import { Modal } from './Modal';

export function ConfirmModal({ isOpen, onClose, onConfirm, title = "Xác nhận", message, confirmText = "Đồng ý", isDanger = false }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-6">
        <p className="text-[var(--color-foreground)] font-medium text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="candy-btn candy-btn-secondary flex-1 font-bold bg-[var(--color-card-solid)] text-[var(--color-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Hủy</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`candy-btn flex-1 font-bold focus-visible:ring-2 ${isDanger ? 'focus-visible:ring-red-500 focus-visible:outline-none bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-[0_2px_8px_rgba(239,68,68,0.25)] hover:from-red-600 hover:to-rose-700 hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)]' : 'focus-visible:ring-[var(--color-accent)] focus-visible:outline-none'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
