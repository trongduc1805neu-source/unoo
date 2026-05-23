import { useState, useMemo } from 'react';
import { Expense, Transaction, SettledBill } from '../types';
import { firebaseService } from '../services/firebase';
import { formatVND, ALL_BANKS } from '../constants';
import { ArrowLeft, QrCode, Download, CheckCircle2, ArrowRight, DollarSign } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';

function calculateSettlement(expenses: Expense[], members: any[]): { transactions: Transaction[], total: number } {
  const balances: Record<string, number> = {};
  members.forEach(m => balances[m.uid] = 0);
  
  let total = 0;

  expenses.forEach(e => {
    total += e.amount;
    // Payer pays
    if (e.payers) {
      Object.entries(e.payers).forEach(([uid, amount]) => {
        balances[uid] = (balances[uid] || 0) + Number(amount);
      });
    } else {
      balances[e.payer] = (balances[e.payer] || 0) + Number(e.amount);
    }
    // Participants consume
    if (e.splitMethod === 'EVENLY') {
      const amtPerPerson = e.amount / e.participants.length;
      e.participants.forEach(p => {
        balances[p] = (balances[p] || 0) - amtPerPerson;
      });
    } else if (e.splitMethod === 'MANUALLY' && e.manualSplits) {
      Object.entries(e.manualSplits).forEach(([uid, amt]) => {
        balances[uid] = (balances[uid] || 0) - Number(amt);
      });
    }
  });

  const debtors: {uid: string, amount: number}[] = [];
  const creditors: {uid: string, amount: number}[] = [];

  Object.entries(balances).forEach(([uid, bal]) => {
    if (bal > 0.1) creditors.push({ uid, amount: bal });
    else if (bal < -0.1) debtors.push({ uid, amount: Math.abs(bal) });
  });

  // Sort creditors by amount desc
  creditors.sort((a,b) => b.amount - a.amount);
  const mainCreditor = creditors.length > 0 ? creditors[0] : null;

  const transactions: Transaction[] = [];

  if (mainCreditor) {
    // Everyone pays mainCreditor
    debtors.forEach(d => {
      transactions.push({ from: d.uid, to: mainCreditor.uid, amount: d.amount });
    });
    // mainCreditor pays other creditors
    for (let i = 1; i < creditors.length; i++) {
        const c = creditors[i];
        transactions.push({ from: mainCreditor.uid, to: c.uid, amount: c.amount });
    }
  }

  return { transactions, total };
}

export default function SettleUpScreen({ roomId, room, members, user, isHistoryView, historyBill, onClose }: any) {
  const expensesRaw = isHistoryView ? (historyBill?.expenses || []) : (room?.expenses || {});
  const expenses: Expense[] = (Object.values(expensesRaw) as Expense[])
    .filter((e: any) => e && typeof e === 'object')
    .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
  const nicknames = room.nicknames || {};

  const getDisplayName = (nameOrUid: string) => {
    if (nicknames[nameOrUid]) return nicknames[nameOrUid];
    const m = members.find((x: any) => x.uid === nameOrUid || x.name === nameOrUid);
    return m ? m.name : nameOrUid;
  };

  const { transactions, total } = useMemo(() => {
    if (isHistoryView && historyBill.transactions) return { transactions: historyBill.transactions, total: historyBill.totalAmount };
    return calculateSettlement(expenses, members);
  }, [expenses, members, isHistoryView, historyBill]);


  const [qrModalTx, setQrModalTx] = useState<Transaction | null>(null);

  const handleSettle = async () => {
    const db = (await import('firebase/database')).getDatabase();
    const ref = (await import('firebase/database')).ref;
    const update = (await import('firebase/database')).update;
    const push = (await import('firebase/database')).push;
    
    const settledRef = push(ref(db, `rooms/${roomId}/settledBills`));
    const billId = settledRef.key as string;
    
    const updatedTransactions = transactions.map(t => ({ ...t, status: 'pending' as const }));
    
    const newBill: SettledBill = {
       id: billId,
       date: new Date().toLocaleString('vi-VN'),
       expenses,
       transactions: updatedTransactions,
       totalAmount: total,
       settledBy: user.displayName,
       mainCreditor: transactions.length > 0 ? transactions[0].to : undefined
    };

    const updates: any = {};
    updates[`rooms/${roomId}/settledBills/${billId}`] = newBill;
    updates[`rooms/${roomId}/expenses`] = null; // clear expenses

    await update(ref(db), updates);
    await firebaseService.writeChatMessage(roomId, user, '', 'settlement', { settledBy: user.displayName, totalAmount: total, transactions: updatedTransactions, billId });
    onClose();
  };

  const exportPDF = async () => {
    // Setting up a minimal print view
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10 w-full xl:w-3/4">
       
       <div className="flex justify-between items-center border-[var(--color-border)] border-b pb-3.5 shadow-sm relative mt-4 px-4 bg-[var(--color-card-solid)] sticky top-0 bg-opacity-90 backdrop-blur-sm z-50 py-3.5 print:hidden">
         <button type="button" onClick={onClose} className="w-9.5 h-9.5 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] flex items-center justify-center p-0 text-[var(--color-foreground)] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" aria-label="Quay lại"><ArrowLeft size={18} aria-hidden="true" /></button>
         <h2 className="text-base font-heading font-bold text-[var(--color-foreground)]">{isHistoryView ? 'Lịch sử thanh toán' : 'Thanh Toán Nhóm'}</h2>
         <button type="button" onClick={exportPDF} className="w-9.5 h-9.5 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] flex items-center justify-center p-0 text-[var(--color-foreground)] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" aria-label="Tải PDF hoặc In bảng thanh toán"><Download size={18} aria-hidden="true" /></button>
       </div>

       {isHistoryView && (
         <div className="text-center font-bold text-[10px] text-[var(--color-muted-foreground)] mt-1 mb-1 bg-[var(--color-card-solid)] border border-[var(--color-border)] py-1.5 rounded-full inline-block mx-auto px-6 shadow-sm">
           Người chốt: <span className="text-[var(--color-foreground)]">{historyBill.settledBy}</span> • <span className="text-[var(--color-foreground)]">{historyBill.date}</span>
         </div>
       )}

       {/* Hero Block */}
       <div className="glass-card p-8 text-center overflow-hidden mx-4 bg-[var(--color-card-solid)] relative">
         <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent pointer-events-none"></div>
         <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] relative z-10 mb-2">Tổng tiền quyết toán</div>
         <div className="text-4xl md:text-5xl font-extrabold text-[var(--color-accent)] relative z-10 drop-shadow-sm">{formatVND(total)}</div>
       </div>

       <div className="glass-card p-6 md:p-8 mx-4 mb-4">
         <h3 className="text-lg font-heading font-medium  mb-6 pb-4 border-b-2  border-[var(--color-border)] relative z-10 flex items-center gap-3 text-[var(--color-foreground)] ">
           <CheckCircle2 size={24} className="text-[var(--color-quaternary)]" aria-hidden="true"/> Ai nợ ai?
         </h3>
         
         <div className="relative z-10">
         {transactions.length === 0 ? (
           <div className="text-center p-8 bg-[var(--color-muted)] border  border-[var(--color-border)] rounded-xl ">
              <span className="font-bold text-sm text-[var(--color-muted-foreground)] ">Không ai nợ ai cả!</span>
           </div>
         ) : (
           <div className="flex flex-col gap-4">
             {transactions.map((t, idx) => {
                const isPaid = t.status === 'paid';
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col sm:flex-row justify-between items-center gap-4 p-5 rounded-xl border transition-all ${
                      isPaid 
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75' 
                        : 'bg-[var(--color-card-solid)] border-[var(--color-border)] hover:border-[var(--color-border)] hover:-translate-y-1 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 w-full text-base relative z-10">
                      <span className="font-bold text-[var(--color-muted-foreground)]">{getDisplayName(t.from)}</span>
                      <div className="flex items-center gap-2 text-[var(--color-quaternary)] px-2" aria-hidden="true">
                        <div className="h-[2px] w-4 bg-[var(--color-quaternary)]"></div>
                        <ArrowRight size={16} strokeWidth={4}/>
                        <div className="h-[2px] w-4 bg-[var(--color-quaternary)]"></div>
                      </div>
                      <span className="font-bold text-[var(--color-foreground)]">{getDisplayName(t.to)}</span>
                      
                      {/* Trạng thái thanh toán */}
                      {isHistoryView && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 ${
                          isPaid 
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {isPaid ? 'Đã trả nợ' : 'Chờ thanh toán'}
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-lg bg-[var(--color-accent)] px-4 py-2 rounded-xl text-white relative z-10 shadow-sm border border-[var(--color-border)]">{formatVND(t.amount)}</div>
                    <button 
                      type="button" 
                      onClick={() => setQrModalTx({ ...t, index: idx })} 
                      className="w-10 h-10 p-0 flex items-center justify-center text-[var(--color-foreground)] hover:text-white transition-colors rounded-full shrink-0 relative z-10 border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:shadow-sm bg-[var(--color-card-solid)] shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" 
                      aria-label={`Xem mã QR thanh toán ${formatVND(t.amount)} cho ${getDisplayName(t.to)}`} 
                      title="QR Code"
                    >
                      <QrCode size={18} aria-hidden="true"/>
                    </button>
                  </div>
                );
              })}
           </div>
         )}
         </div>
       </div>

        {/* Expenses list participating in settlement */}
        <div className="glass-card p-6 md:p-8 mx-4 mb-4">
          <h3 className="text-lg font-heading font-medium mb-6 pb-4 border-b-2 border-[var(--color-border)] relative z-10 flex items-center gap-3 text-[var(--color-foreground)]">
            <DollarSign size={24} className="text-[var(--color-accent)]" aria-hidden="true" /> Các khoản chi tiêu tham gia ({expenses.length})
          </h3>
          
          {expenses.length === 0 ? (
            <div className="text-center p-8 bg-[var(--color-muted)]/50 border border-[var(--color-border)] rounded-xl">
              <span className="font-bold text-sm text-[var(--color-muted-foreground)]">Không có khoản chi tiêu nào trong quyết toán này.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto no-scrollbar pr-1 relative z-10">
              {expenses.map((e, idx) => (
                <div key={e.id || idx} className="p-4 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-2xl flex justify-between items-center gap-4 hover:border-[var(--color-border-hover)] transition-all">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[13px] text-[var(--color-foreground)] truncate">{e.itemName}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[var(--color-muted-foreground)] font-semibold mt-1">
                      <span>Trả: {e.payers ? 'Nhiều người' : getDisplayName(e.payer)}</span>
                      <span>•</span>
                      <span>{new Date(e.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span className="bg-[var(--color-orange-light)] text-[var(--color-accent)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                        {e.splitMethod === 'EVENLY' ? 'Chia đều' : 'Tự nhập'}
                      </span>
                    </div>
                  </div>
                  <span className="font-heading font-bold text-sm text-[var(--color-accent)] shrink-0">
                    {formatVND(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isHistoryView && (
          <div className="flex justify-center mt-2 mb-12 px-4 print:hidden">
           <button type="button" onClick={handleSettle} className="candy-btn py-4.5 px-12 text-base w-full font-bold shadow-[0_4px_16px_rgba(36,129,204,0.3)] hover:shadow-[0_6px_22px_rgba(36,129,204,0.45)] group transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
             Xác Nhận Quyết Toán ✔
           </button>
          </div>
        )}

        {qrModalTx && (
          <QRModal 
            tx={qrModalTx} 
            onClose={() => setQrModalTx(null)} 
            members={members} 
            getDisplayName={getDisplayName} 
            roomId={roomId} 
            billId={historyBill?.id}
            isHistoryView={isHistoryView}
            user={user}
          />
        )}

    </div>
  );
}

function QRModal({ tx, onClose, members, getDisplayName, roomId, billId, isHistoryView, user }: any) {
  const receiver = members.find((m:any) => m.uid === tx.to);
  const infoMissing = !receiver || !receiver.bankId || !receiver.accountNumber;

  const [isEditing, setIsEditing] = useState(infoMissing);
  const [bankId, setBankId] = useState(receiver?.bankId || '');
  const [accNum, setAccNum] = useState(receiver?.accountNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Normalize Vietnamese characters for secure VietQR addInfo contents
  const rawInfo = `Tra no - ${getDisplayName(tx.from)} thanh toan`;
  const queryInfo = encodeURIComponent(
    rawInfo.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9- ]/g, "")
  );

  const qrUrl = (!infoMissing && receiver) 
    ? `https://img.vietqr.io/image/${receiver.bankId}-${receiver.accountNumber}-compact2.jpg?amount=${Math.round(tx.amount)}&addInfo=${queryInfo}&accountName=${encodeURIComponent(receiver.name)}`
    : '';

  const handleSaveBank = async () => {
    if (!bankId || !accNum.trim()) return;
    setIsSaving(true);
    try {
      const db = (await import('firebase/database')).getDatabase();
      const ref = (await import('firebase/database')).ref;
      const update = (await import('firebase/database')).update;
      const bName = ALL_BANKS.find(b => b.bin === bankId)?.name || '';

      await update(ref(db, `rooms/${roomId}/customMembersBanks/${tx.to}`), {
        bankId,
        accountNumber: accNum.trim(),
        bankName: bName
      });
      setIsEditing(false);
    } catch (e) {
      console.error("Lỗi khi lưu thẻ:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!roomId || !billId || tx.index === undefined) return;
    setIsConfirming(true);
    try {
      const db = (await import('firebase/database')).getDatabase();
      const ref = (await import('firebase/database')).ref;
      const update = (await import('firebase/database')).update;
      
      const updates: any = {};
      updates[`rooms/${roomId}/settledBills/${billId}/transactions/${tx.index}/status`] = 'paid';
      
      await update(ref(db), updates);
      
      // Ghi tin nhắn hệ thống
      const fromName = getDisplayName(tx.from);
      const toName = getDisplayName(tx.to);
      await firebaseService.writeChatMessage(
        roomId, 
        user, 
        `đã xác nhận ${fromName} trả nợ thành công cho ${toName} số tiền ${formatVND(tx.amount)}`, 
        'system'
      );
      
      onClose();
    } catch (e) {
      console.error("Lỗi khi xác nhận thanh toán:", e);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Chuyển Khoản VietQR">
      <div className="flex flex-col items-center text-center">
         <div className="text-sm font-bold  mb-6 mt-4 w-full">
           <div className="flex justify-between border-b-2  border-[var(--color-border)] py-3">
             <span className="text-[var(--color-muted-foreground)] ">Từ:</span> <span className="text-[var(--color-foreground)]">{getDisplayName(tx.from)}</span>
           </div>
           <div className="flex justify-between border-b-2  border-[var(--color-border)] py-3">
             <span className="text-[var(--color-muted-foreground)] ">Đến:</span> <span className="text-[var(--color-foreground)]">{getDisplayName(tx.to)}</span>
           </div>
           <div className="bg-[var(--color-card-solid)] border border-[var(--color-border)] inline-block mt-6 px-8 py-4 rounded-2xl shadow-sm">
             <span className="text-[var(--color-accent)] text-3xl font-medium  drop-shadow-sm">{formatVND(tx.amount)}</span>
           </div>
         </div>
         
         {isEditing ? (
            <div className="w-full bg-[var(--color-muted)] p-5 rounded-2xl border border-[var(--color-border)] text-left flex flex-col gap-4 mt-2">
              <h4 className="text-xs font-bold text-[var(--color-foreground)] mb-1">Cài Đặt / Override Tài Khoản Nhận</h4>
              
              <div>
                <label htmlFor="qr-bank-select" className="block text-[10px] font-bold text-[var(--color-muted-foreground)] mb-1 uppercase">Ngân hàng</label>
                <select 
                  id="qr-bank-select"
                  name="bank"
                  value={bankId} 
                  onChange={e => setBankId(e.target.value)} 
                  className="candy-input w-full py-2 h-[48px] text-xs bg-[var(--color-card-solid)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {ALL_BANKS.map(b => (
                    <option key={b.bin} value={b.bin}>{b.code} - {b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="qr-acc-num" className="block text-[10px] font-bold text-[var(--color-muted-foreground)] mb-1 uppercase">Số tài khoản nhận</label>
                <input 
                  id="qr-acc-num"
                  name="accountNumber"
                  type="text" 
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Nhập số thẻ hoặc tài khoản nhận..." 
                  value={accNum} 
                  onChange={e => setAccNum(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="candy-input w-full font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button"
                  onClick={handleSaveBank} 
                  disabled={isSaving || !bankId || !accNum.trim()} 
                  className="candy-btn text-xs flex-1 min-h-[40px] items-center justify-center p-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                >
                  {isSaving ? "Đang lưu..." : "Lưu & Hiện QR"}
                </button>
                {!infoMissing && (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)} 
                    className="candy-btn candy-btn-secondary text-xs flex-1 min-h-[40px] bg-[var(--color-card-solid)] p-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                  >
                    Hủy sửa
                  </button>
                )}
              </div>
            </div>
         ) : (
            <>
              <div className="bg-[var(--color-card-solid)] p-4 rounded-2xl mt-2 border border-[var(--color-border)] shadow-sm relative group overflow-hidden">
                <img src={qrUrl} alt={`Mã QR chuyển khoản VietQR từ ${getDisplayName(tx.from)} đến ${getDisplayName(tx.to)} số tiền ${formatVND(tx.amount)}`} className="w-[280px] h-auto object-cover rounded-xl border border-[var(--color-border)]" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span className="text-white text-xs font-semibold select-none bg-black/60 px-3 py-1.5 rounded-full pointer-events-none">Quét bằng ứng dụng ngân hàng</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-1 items-center bg-[var(--color-muted)] border border-[var(--color-border)]  w-full py-4 rounded-xl relative">
                <p className="text-[10px] font-bold  text-[var(--color-muted-foreground)] ">{receiver?.bankName || receiver?.bankId}</p>
                <p className="text-xl font-medium  text-[var(--color-foreground)]">{receiver?.accountNumber}</p>
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-accent)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none rounded px-2 py-1"
                >
                  Sửa đổi 🛠️
                </button>
              </div>
            </>
         )}

         {isHistoryView && tx.status !== 'paid' && (
           <button 
             type="button" 
             onClick={handleConfirmPayment} 
             disabled={isConfirming}
             className="candy-btn w-full mt-6 py-3.5 text-sm font-bold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
           >
             {isConfirming ? "Đang xác nhận..." : "Xác Nhận Đã Thanh Toán ✔"}
           </button>
         )}

         {tx.status === 'paid' && (
           <div className="mt-6 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 justify-center w-full">
             <span>Giao dịch đã hoàn tất thanh toán</span>
           </div>
         )}
         
         <button type="button" onClick={onClose} className="candy-btn candy-btn-secondary w-full mt-8 py-3 text-sm font-bold bg-[var(--color-card-solid)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Đóng Cửa Sổ</button>
      </div>
    </Modal>
  );
}