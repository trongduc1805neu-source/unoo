import { useState } from 'react';
import { Expense, SplitMethod } from '../types';
import { firebaseService } from '../services/firebase';
import { formatVND } from '../constants';
import { ArrowLeft, CheckLg, ArrowRight, Sparkles, AlertTriangle } from '../components/ui/Icons';
import { motion, AnimatePresence } from 'motion/react';

export default function AddExpenseWizard({ roomId, members, user, onClose }: any) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  // Step 1
  const [itemName, setItemName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  const [singlePayer, setSinglePayer] = useState(user.uid);
  const [multiPayers, setMultiPayers] = useState<Record<string, string>>({}); // string for input

  // Step 2
  const [participants, setParticipants] = useState<string[]>(members.map((m:any) => m.uid));
  
  // Step 3
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(SplitMethod.EVENLY);
  const [manualSplits, setManualSplits] = useState<Record<string, string>>({});

  const amount = Number(amountStr.replace(/[^0-9]/g, '')) || 0;

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!itemName) return setError("Vui lòng nhập tên khoản chi tiêu.");
      if (amount <= 0) return setError("Số tiền phải lớn hơn 0.");
      if (isMultiPayer) {
        const sum = Object.values(multiPayers).reduce<number>((a, b) => a + (Number(b) || 0), 0);
        if (sum !== amount) return setError(`Tổng số tiền các người trả (${formatVND(sum)}) không khớp với tổng (${formatVND(amount)}).`);
      }
    }
    if (step === 2) {
      if (participants.length === 0) return setError("Vui lòng chọn ít nhất 1 người tham gia.");
    }
    if (step === 3) {
      if (splitMethod === SplitMethod.MANUALLY) {
        const sum = Object.values(manualSplits).reduce<number>((a, b) => a + (Number(b) || 0), 0);
        if (Math.abs(sum - amount) > 5) return setError(`Tổng số tiền chia (${formatVND(sum)}) không khớp với tổng tiền (${formatVND(amount)}).`);
      }
    }
    if (step < 4) setStep(s => s + 1);
  };

  const handlePrev = () => {
    setError('');
    if (step > 1) setStep(s => s - 1);
    else onClose();
  };

  const handleFinish = async () => {
    const finalMultiPayers: Record<string, number> = {};
    if (isMultiPayer) {
      Object.entries(multiPayers).forEach(([u, a]) => {
         if (Number(a) > 0) finalMultiPayers[u] = Number(a);
      });
    }

    const finalManualSplits: Record<string, number> = {};
    if (splitMethod === SplitMethod.MANUALLY) {
      Object.entries(manualSplits).forEach(([u, a]) => {
         if (Number(a) > 0) finalManualSplits[u] = Number(a);
      });
    }

    const newExpense: Expense = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      itemName,
      amount,
      payer: singlePayer,
      ...(isMultiPayer && { payers: finalMultiPayers }),
      participants,
      splitMethod,
      ...(splitMethod === SplitMethod.MANUALLY && { manualSplits: finalManualSplits }),
      createdAt: Date.now(),
      createdBy: user.uid
    };

    const db = (await import('firebase/database')).getDatabase();
    const ref = (await import('firebase/database')).ref;
    const set = (await import('firebase/database')).set;
    await set(ref(db, `rooms/${roomId}/expenses/${newExpense.id}`), newExpense);
    await firebaseService.writeChatMessage(roomId, user, `đã thêm chi tiêu cho nhóm "${itemName}" - ${formatVND(amount)}`, 'system');
    onClose();
  };

  const getNumInputVal = (valStr: string) => {
    if(!valStr) return '';
    return formatVND(Number(valStr.replace(/[^0-9]/g, ''))).replace('₫','').trim();
  };
  const parseStrNum = (valStr: string) => valStr.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-2xl mx-auto glass-card min-h-[500px] flex flex-col relative overflow-hidden bg-[var(--color-card-solid)] mt-10 mb-10 w-full sm:w-[90%] md:w-[600px] absolute lg:relative lg:mx-auto top-0 left-0 lg:left-auto right-0 lg:right-auto z-50">
      
      {/* Header / Steps Indicator */}
      <div className="border-b border-[var(--color-border)] p-5 px-6 flex justify-between items-center z-10 bg-[var(--color-card-solid)]">
         <h2 className="text-lg font-heading font-bold m-0 flex-1 flex items-center gap-2.5 text-[var(--color-foreground)]">
           <Sparkles size={18} className="text-[var(--color-accent)]" aria-hidden="true" /> Thêm Chi Tiêu
         </h2>
         <div className="flex gap-2">
           {[1,2,3,4].map(i => (
             <div key={i} className={`w-7.5 h-7.5 rounded-full border border-[var(--color-border)] flex items-center justify-center font-bold text-xs transition-all duration-300 ${step === i ? 'bg-[var(--color-accent)] text-white shadow-md scale-110 border-[var(--color-accent)]' : step > i ? 'bg-[var(--color-green-light)] text-[var(--color-green-dark)] border-[var(--color-green-light)]' : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'}`} aria-hidden="true">
               {i}
             </div>
           ))}
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-xs font-bold p-3 border-b border-red-500/20 flex justify-between items-center transition-all animate-fadeIn px-6 shrink-0 z-10">
            <span className="flex items-center gap-1.5">
               <AlertTriangle size={14} className="text-red-400" aria-hidden="true" />
               {error}
            </span>
           <button type="button" onClick={() => setError('')} className="bg-transparent border-none text-red-400 hover:text-red-500 text-xs font-bold font-sans cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none">Đóng</button>
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto no-scrollbar relative z-10 bg-[var(--color-card-solid)]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-6"
            >
              <div>
                <label htmlFor="expense-item-name" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Tên khoản chi tiêu</label>
                <input 
                  id="expense-item-name"
                  name="itemName"
                  autoComplete="off"
                  spellCheck={false}
                  value={itemName} 
                  onChange={e=>setItemName(e.target.value)} 
                  placeholder="VD: Bữa tối trên biển" 
                  className="candy-input w-full font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" 
                  autoFocus 
                />
              </div>
              <div>
                <label htmlFor="expense-amount" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Số tiền (VND)</label>
                <input 
                  id="expense-amount"
                  name="amount"
                  inputMode="numeric"
                  autoComplete="off"
                  value={getNumInputVal(amountStr)} 
                  onChange={e => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))} 
                  placeholder="0" 
                  className="candy-input text-2xl w-full font-bold text-[var(--color-accent)] text-right focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" 
                />
              </div>
              <div className="p-4 glass-card bg-[var(--color-muted)]">
                <div className="flex justify-between items-center mb-4">
                  <label htmlFor="single-payer-select" className="text-xs font-bold text-[var(--color-foreground)]">Ai trả tiền?</label>
                  <label htmlFor="multi-payer-checkbox" className="flex items-center gap-3 cursor-pointer select-none text-xs font-bold text-[var(--color-foreground)] bg-[var(--color-card-solid)] px-3 py-2 rounded border border-[var(--color-border)] hover:border-[var(--color-border)] transition-colors shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-accent)]">
                    <span>Nhiều người trả?</span>
                    <div className={`w-10 h-5 rounded-full border border-[var(--color-border)] relative transition-colors duration-300 ${isMultiPayer ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'bg-[var(--color-muted)]'}`}>
                       <div className={`w-4 h-4 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-full absolute -top-0.5 transition-transform duration-300 ${isMultiPayer ? 'translate-x-[20px]' : ''}`}></div>
                    </div>
                    <input id="multi-payer-checkbox" type="checkbox" checked={isMultiPayer} onChange={e=>setIsMultiPayer(e.target.checked)} className="sr-only"/> 
                  </label>
                </div>
                
                {!isMultiPayer ? (
                  <select id="single-payer-select" value={singlePayer} onChange={e=>setSinglePayer(e.target.value)} className="candy-input w-full form-select h-[48px] py-0 cursor-pointer font-bold bg-[var(--color-card-solid)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
                    {members.map((m:any) => <option key={m.uid} value={m.uid}>{m.name}</option>)}
                  </select>
                ) : (
                  <div className="flex flex-col gap-3 bg-[var(--color-card-solid)] p-4 rounded-xl border border-[var(--color-border)]">
                    {members.map((m:any) => (
                      <div key={m.uid} className="flex gap-4 items-center">
                        <label htmlFor={`multi-payer-${m.uid}`} className="w-1/3 truncate font-bold text-sm text-[var(--color-foreground)]">{m.name}</label>
                        <input 
                          id={`multi-payer-${m.uid}`}
                          value={getNumInputVal(multiPayers[m.uid] || '')}
                          onChange={e => setMultiPayers(prev => ({...prev, [m.uid]: parseStrNum(e.target.value)}))}
                          placeholder="0"
                          inputMode="numeric"
                          autoComplete="off"
                          className="candy-input flex-1 text-right py-2 h-[40px] text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                        />
                      </div>
                    ))}
                    <div className="text-right text-xs font-bold text-[var(--color-muted-foreground)] mt-2 pt-3 border-t-2 border-[var(--color-border)]">
                       Tổng đã nhập: <span className="text-[var(--color-accent)]">{formatVND(Object.values(multiPayers).reduce<number>((a,b)=>a+(Number(b)||0), 0))}</span> / {formatVND(amount)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-6"
            >
               <div className="flex justify-between items-center bg-[var(--color-quaternary)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
                  <span className="block text-sm font-bold text-[var(--color-foreground)]">Chọn người tham gia khoản này</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setParticipants(members.map((m:any)=>m.uid))} className="candy-btn candy-btn-secondary py-1 px-3 min-h-[32px] text-xs bg-[var(--color-card-solid)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-colors">Mặc định</button>
                    <button type="button" onClick={() => setParticipants([])} className="candy-btn py-1 px-3 min-h-[32px] text-xs bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)] shadow-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-colors">Khỏi</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-3">
                 {members.map((m:any) => {
                   const isSel = participants.includes(m.uid);
                   return (
                     <label key={m.uid} htmlFor={`participant-checkbox-${m.uid}`} className={`px-4 py-3 flex justify-between items-center cursor-pointer select-none border rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--color-accent)] ${isSel ? 'border-[var(--color-border)] bg-[var(--color-card-solid)] shadow-sm' : 'border-[var(--color-border)] bg-[var(--color-muted)] hover:border-[var(--color-border)]'}`}>
                       <span className="truncate font-bold text-sm flex-1 text-[var(--color-foreground)]">{m.name}</span>
                       <div className={`w-6 h-6 rounded border border-[var(--color-border)] flex items-center justify-center transition-colors ${isSel ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-card-solid)]'}`}>
                          {isSel && <CheckLg size={16} className="text-white font-medium" aria-hidden="true" />}
                       </div>
                       <input id={`participant-checkbox-${m.uid}`} type="checkbox" checked={isSel} onChange={e => {
                             if (e.target.checked) setParticipants([...participants, m.uid]);
                             else setParticipants(participants.filter(x => x !== m.uid));
                       }} className="sr-only" />
                     </label>
                   )
                 })}
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-6"
            >
              <span className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Cách chia tiền</span>
              <div className="flex gap-4">
                <button 
                   type="button"
                   onClick={() => setSplitMethod(SplitMethod.EVENLY)} 
                   className={`flex-1 glass-card p-4 flex flex-col items-center justify-center gap-2 group transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${splitMethod === SplitMethod.EVENLY ? 'bg-[var(--color-orange-light)] border-[var(--color-accent)] shadow-sm' : 'bg-[var(--color-muted)] border-transparent hover:border-[var(--color-border)] shadow-none'}`}>
                   <span className={`font-bold text-sm ${splitMethod===SplitMethod.EVENLY?'text-[var(--color-accent)]':'text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]'}`}>Trung Bình</span>
                </button>
                <button 
                   type="button"
                   onClick={() => setSplitMethod(SplitMethod.MANUALLY)} 
                   className={`flex-1 glass-card p-4 flex flex-col items-center justify-center gap-2 group transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${splitMethod === SplitMethod.MANUALLY ? 'bg-[var(--color-orange-light)] border-[var(--color-accent)] shadow-sm' : 'bg-[var(--color-muted)] border-transparent hover:border-[var(--color-border)] shadow-none'}`}>
                   <span className={`font-bold text-sm ${splitMethod===SplitMethod.MANUALLY?'text-[var(--color-accent)]':'text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]'}`}>Chia Tùy Chọn</span>
                </button>
              </div>

              {splitMethod === SplitMethod.EVENLY && (
                <div className="text-center p-8 bg-[var(--color-muted)] border border-[var(--color-border)] rounded-2xl relative overflow-hidden mt-4">
                  <p className="text-3xl font-medium text-[var(--color-accent)] relative z-10">{formatVND(amount / participants.length)}</p>
                  <p className="text-xs font-bold text-[var(--color-muted-foreground)] mt-2 relative z-10">Mỗi người chịu phần bằng nhau</p>
                </div>
              )}

              {splitMethod === SplitMethod.MANUALLY && (
                <div className="flex flex-col gap-3 mt-4 bg-[var(--color-muted)] p-5 rounded-xl border border-[var(--color-border)]">
                    {participants.map((uid: string) => {
                      const m = members.find((x:any)=>x.uid===uid);
                      return (
                      <div key={uid} className="flex gap-4 items-center bg-[var(--color-card-solid)] p-2 border border-[var(--color-border)] rounded-lg">
                        <label htmlFor={`manual-split-${uid}`} className="w-1/3 truncate font-bold text-sm pl-2 text-[var(--color-foreground)]">{m?.name}</label>
                        <input 
                          id={`manual-split-${uid}`}
                          value={getNumInputVal(manualSplits[uid] || '')}
                          onChange={e => setManualSplits(prev => ({...prev, [uid]: parseStrNum(e.target.value)}))}
                          placeholder="0"
                          inputMode="numeric"
                          autoComplete="off"
                          className="candy-input flex-1 text-right py-2 h-[40px] text-sm !border-transparent focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                        />
                      </div>
                    )})}
                    <div className="text-right text-xs font-bold text-[var(--color-muted-foreground)] mt-2 pt-4 border-t-2 border-[var(--color-border)]">
                       Số tiền đã chọn: <span className="text-[var(--color-accent)]">{formatVND(Object.values(manualSplits).reduce<number>((a,b)=>a+(Number(b)||0), 0))}</span> / {formatVND(amount)}
                    </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-6 h-full"
            >
               <div className="flex-1 p-6 flex flex-col gap-5 border border-[var(--color-border)] z-10 relative bg-[var(--color-card-solid)] overflow-hidden rounded-2xl shadow-sm">
                  <div className="absolute -top-4 -right-4 text-sky-200 rotate-12 opacity-50"><Sparkles size={100} aria-hidden="true"/></div>
                  <h3 className="text-xl font-heading font-medium mb-2 text-[var(--color-foreground)] drop-shadow-sm flex items-center gap-2">
                     Xác nhận thông tin <CheckLg size={20} className="text-[var(--color-accent)]" aria-hidden="true"/>
                  </h3>
                  
                  <div className="flex flex-col border-b-2 border-sky-100 pb-3 relative z-10">
                    <span className="text-[10px] font-bold text-[var(--color-secondary)] pb-1">Tên khoản chi:</span>
                    <span className="font-heading font-medium text-xl text-[var(--color-foreground)]">{itemName}</span>
                  </div>
                  <div className="flex flex-col border-b-2 border-sky-100 pb-3 relative z-10">
                    <span className="text-[10px] font-bold text-[var(--color-secondary)] pb-1">Tổng số tiền:</span>
                    <span className="text-3xl text-[var(--color-accent)] font-medium">{formatVND(amount)}</span>
                  </div>
                  <div className="flex flex-col gap-2 border-b-2 border-sky-100 pb-3 relative z-10">
                    <span className="text-[10px] font-bold text-[var(--color-secondary)]">Người trả:</span>
                    {!isMultiPayer ? <span className="font-bold text-sm text-[var(--color-foreground)]">{members.find((m:any) => m.uid === singlePayer)?.name}</span> : 
                      Object.entries(multiPayers).map(([u, a]) => Number(a) > 0 ? (
                        <div key={u} className="flex justify-between items-center text-sm font-bold"><span className="truncate max-w-[60%] text-[var(--color-foreground)]">• {members.find((m:any)=>m.uid===u)?.name}</span><span className="text-[var(--color-muted-foreground)]">{formatVND(Number(a))}</span></div>
                      ) : null)
                    }
                  </div>
                  <div className="flex flex-col gap-2 relative z-10">
                    <span className="text-[10px] font-bold text-[var(--color-secondary)]">Người tham gia:</span>
                    {participants.map(uid => {
                      const m = members.find((x:any)=>x.uid===uid);
                      let partAmount = 0;
                      if(splitMethod==='EVENLY') partAmount = amount / participants.length;
                      if(splitMethod==='MANUALLY') partAmount = Number(manualSplits[uid] || 0);
                      return (
                         <div key={uid} className="flex justify-between items-center text-sm font-bold"><span className="truncate max-w-[60%] text-[var(--color-foreground)]">• {m?.name}</span><span className="text-[var(--color-muted-foreground)]">{formatVND(partAmount)}</span></div>
                      )
                    })}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-[var(--color-border)] p-4 flex justify-between z-10 relative bg-[var(--color-card-solid)]">
        <button type="button" onClick={handlePrev} className="candy-btn candy-btn-secondary px-6 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none flex items-center"><ArrowLeft size={16} className="mr-1.5" aria-hidden="true" /> {step===1 ? 'Hủy' : 'Quay lại'}</button>
        {step < 4 ? (
          <button type="button" onClick={handleNext} className="candy-btn px-8 text-sm flex gap-1.5 items-center focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Tiếp theo <ArrowRight size={16} aria-hidden="true" /></button>
        ) : (
          <button type="button" onClick={handleFinish} className="candy-btn px-8 text-sm flex gap-1.5 items-center font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Xác nhận <CheckLg size={16} aria-hidden="true" /></button>
        )}
      </div>
    </div>
  );
}
