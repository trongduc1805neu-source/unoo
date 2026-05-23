import { useState } from 'react';
import { Expense } from '../types';
import { firebaseService } from '../services/firebase';
import { formatVND } from '../constants';
import { ArrowLeft, Trash2, ArrowRight } from '../components/ui/Icons';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export default function ExpensesListScreen({ roomId, room, user, getDisplayName, onClose }: any) {
  const expenses: Expense[] = (Object.values(room.expenses || {}) as Expense[])
    .filter((e: any) => e && typeof e === 'object' && typeof e.createdAt === 'number')
    .sort((a, b) => b.createdAt - a.createdAt);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const canDeleteExpense = (e: Expense) => {
    return e.createdBy === user.uid || room.ownerId === user.uid;
  };

  const handleRemoveExpense = async () => {
    if (expenseToDelete) {
      const db = (await import('firebase/database')).getDatabase();
      const ref = (await import('firebase/database')).ref;
      const remove = (await import('firebase/database')).remove;
      await remove(ref(db, `rooms/${roomId}/expenses/${expenseToDelete}`));
      
      const exp = room.expenses[expenseToDelete];
      if (exp) {
        await firebaseService.writeChatMessage(roomId, user, `đã xoá khoản chi "${exp.itemName}"`, 'system');
      }
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10 w-full xl:w-3/4">
      <div className="flex justify-between items-center border-[var(--color-border)] border-b-2 pb-4 mb-2 sticky top-0 z-10 bg-[var(--color-background)] pt-4 px-4 bg-opacity-90 backdrop-blur-sm">
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] flex items-center justify-center p-0 text-[var(--color-foreground)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-sm transition-all shadow-sm active:translate-y-0 active:translate-x-0 active:shadow-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" aria-label="Quay lại"><ArrowLeft size={20} aria-hidden="true" /></button>
        <h2 className="text-xl font-heading font-medium text-[var(--color-foreground)]">
           Lịch Sử Chi Tiêu
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="px-4 pb-8 flex flex-col gap-3">
        {expenses.length === 0 ? (
          <div className="p-8 text-center border border-[var(--color-border)] rounded-xl bg-[var(--color-card-solid)]">
            <span className="text-sm font-bold text-[var(--color-muted-foreground)]">Chưa có khoản chi nào.</span>
          </div>
        ) : (
          expenses.map(e => (
            <div key={e.id} className="glass-card p-4 flex flex-col gap-2 group relative overflow-hidden bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-xl shadow-sm hover:border-[var(--color-border)] hover:-translate-y-1 transition-all">
              {canDeleteExpense(e) && (
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-red-500/10 text-red-400 border-l-2 border-[var(--color-border)] md:translate-x-full md:group-hover:translate-x-0 transition-transform flex items-center justify-center sm:translate-x-0">
                  <button type="button" onClick={() => setExpenseToDelete(e.id)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform bg-[var(--color-card-solid)] rounded-full border border-red-500/20 shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none" aria-label={`Xóa khoản chi ${e.itemName}`}><Trash2 size={18} aria-hidden="true"/></button>
                </div>
              )}
              <div className={`flex justify-between items-start pr-2 ${canDeleteExpense(e) ? 'md:group-hover:pr-14 sm:pr-14 pr-14' : ''} transition-all`}>
                <div>
                  <h4 className="font-bold text-base text-[var(--color-foreground)]">{e.itemName}</h4>
                  <p className="text-xs font-semibold text-[var(--color-muted-foreground)] mt-1 flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-tertiary)] inline-block"></span>
                    Người trả: {e.payers ? 'Nhiều người' : getDisplayName(e.payer)}
                  </p>
                </div>
                <span className="font-bold text-lg text-[var(--color-accent)]">{formatVND(e.amount)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleRemoveExpense}
        title="Xóa Khoản Chi"
        message="Bạn có chắc chắn muốn xóa khoản chi này không?"
        confirmText="Xóa"
        isDanger={true}
      />
    </div>
  );
}
