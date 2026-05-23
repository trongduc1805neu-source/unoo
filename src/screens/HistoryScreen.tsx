import { useState } from 'react';
import { SettledBill } from '../types';
import { formatVND } from '../constants';
import { ArrowLeft, Trash2, CalendarCheck, Info, RotateCcw } from '../components/ui/Icons';
import { firebaseService } from '../services/firebase';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export default function HistoryScreen({ roomId, room, isOwner, onViewBill, onClose }: any) {
  const bills: SettledBill[] = (Object.values(room.settledBills || {}) as SettledBill[])
    .filter((b: any) => b && typeof b === 'object')
    .reverse();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = async () => {
    await firebaseService.clearRoomData(roomId);
    onClose();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 relative z-10 w-full xl:w-3/4">

      
      <div className="flex justify-between items-center border-[var(--color-border)] border-b-2  pb-4 mb-2 sticky top-0 z-10 bg-[var(--color-background)] pt-4 px-4 bg-opacity-90 backdrop-blur-sm">
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] flex items-center justify-center p-0 text-[var(--color-foreground)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-sm transition-all shadow-sm active:translate-y-0 active:translate-x-0 active:shadow-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" aria-label="Quay lại"><ArrowLeft size={20} aria-hidden="true" /></button>
        <h2 className="text-xl font-heading font-medium  text-[var(--color-foreground)] flex items-center gap-2 ">
           <RotateCcw size={20} className="text-[var(--color-accent)]" aria-hidden="true" /> 
           Lịch Sử Thanh Toán
        </h2>
        <div className="w-10"></div>
      </div>

      {bills.length === 0 ? (
        <div className="text-center p-12 bg-[var(--color-card-solid)] border  border-[var(--color-border)] rounded-2xl opacity-80 backdrop-blur-sm mx-4">
          <p className="text-sm font-bold text-[var(--color-muted-foreground)]  ">Chưa có bản ghi thanh toán nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 mb-8">
          {bills.map((b, index) => {
            const bgColors = ['bg-[var(--color-card-solid)]', 'bg-[var(--color-blue-light)]', 'bg-[var(--color-orange-light)]'];
            const bgColor = bgColors[index % bgColors.length];
            return (
              <button type="button" key={b.id} className={`glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:-translate-y-1 transition-all group text-left w-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${bgColor}`} onClick={() => onViewBill(b)} aria-label={`Xem chi tiết hóa đơn chốt ngày ${b.date} số tiền ${formatVND(b.totalAmount)}`}>
                <div className="flex gap-4 items-center w-full sm:w-auto relative z-10">
                  <div className="bg-[var(--color-card-solid)] text-[var(--color-accent)] border border-[var(--color-border)] hidden sm:flex rounded-xl h-12 w-12 items-center justify-center shadow-sm" aria-hidden="true">
                    <CalendarCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-medium  leading-none mb-1 text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors">{b.date}</h3>
                    <p className="text-xs font-semibold text-[var(--color-muted-foreground)]  ">
                       Chốt bởi {b.settledBy} • {b.expenses ? (Array.isArray(b.expenses) ? b.expenses.length : Object.keys(b.expenses).length) : 0} khoản
                    </p>
                  </div>
                </div>
                <div className="flex justify-between sm:justify-end items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
                  <div className="font-mono text-xl font-bold bg-[var(--color-card-solid)] px-4 py-2 rounded-xl text-[var(--color-foreground)] border border-[var(--color-border)] shrink-0 shadow-sm">
                    {formatVND(b.totalAmount)}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] text-[var(--color-foreground)] group-hover:-translate-y-1 transition-all group-hover:shadow-sm flex items-center justify-center hidden sm:flex shrink-0" aria-hidden="true">
                    <Info size={16}/>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {isOwner && (
        <div className="mt-4 border-t-2  border-[var(--color-border)] p-6 mb-8 text-center mx-4 flex justify-end">
          <button type="button" onClick={() => setShowClearConfirm(true)} className="candy-btn candy-btn-secondary border-red-500/20 text-red-400 hover:bg-red-500/10 px-8 py-3 w-full sm:w-auto text-xs font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none flex items-center justify-center">
            <Trash2 size={16} className="mr-2" aria-hidden="true" /> Xoá Dữ Liệu Lịch Sử
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="Cảnh báo nguy hiểm"
        message="Hành động này sẽ TÌA SẠCH toàn bộ lịch sử thanh toán. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa Sạch"
        isDanger={true}
      />
    </div>
  );
}
