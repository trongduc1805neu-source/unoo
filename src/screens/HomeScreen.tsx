import { useState, useMemo, useEffect } from 'react';
import { Screen, Expense } from '../types';
import { firebaseService } from '../services/firebase';
import { formatVND } from '../constants';
import { Search, EmojiSmile, ImageIcon, Paperclip, Scissors, SendIcon, ChatDots, ChatDotsFill, Plus, CheckSquare, Clock, MapPin, Navigation, UserPlus, Trash2, Edit2, MessageCircle, MessagesSquare, BarChart3, DollarSign, AlertTriangle, FileText, ThumbsUp, MessageSquarePlus, Pin, PartyPopper, ArrowRight } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

export default function HomeScreen({ roomId, room, members, user, profile, onNavigate, showRightSidebar, setShowRightSidebar, onViewSettlement }: any) {
  const expenses: Expense[] = (Object.values(room.expenses || {}) as Expense[])
    .filter((e: any) => e && typeof e === 'object' && typeof e.createdAt === 'number')
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
  const nicknames = room.nicknames || {};

  const getDisplayName = (nameOrUid: string) => {
    if (nicknames[nameOrUid]) return nicknames[nameOrUid];
    const m = members.find((x: any) => x.uid === nameOrUid || x.name === nameOrUid);
    return m ? m.name : nameOrUid;
  };

  const isOwner = user.uid === (room.metadata?.ownerId);

  const canDeleteExpense = (e: Expense) => {
    return isOwner || e.createdBy === user.uid;
  };

  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);

  // States và logic tạo chuyến đi / kế hoạch nhóm được nhấc lên từ PlansSection
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planNote, setPlanNote] = useState('');
  const [planTime, setPlanTime] = useState('');

  const handleAddPlan = async () => {
    if (!planTitle) return;
    const db = (await import('firebase/database')).getDatabase();
    const ref = (await import('firebase/database')).ref;
    const push = (await import('firebase/database')).push;
    const set = (await import('firebase/database')).set;
    
    const newRef = push(ref(db, `rooms/${roomId}/plans`));
    await set(newRef, { 
      id: newRef.key, 
      title: planTitle, 
      note: planNote, 
      time: planTime, 
      createdBy: user.displayName || user.email || 'Thành viên', 
      creatorUid: user.uid, 
      votes: {} 
    });

    // Viết tin nhắn hệ thống vào chat nhóm báo đã lên lịch chuyến đi
    await firebaseService.writeChatMessage(roomId, user, `đã lên kế hoạch chuyến đi mới: "${planTitle}"`, 'system');

    setIsCreatePlanOpen(false);
    setPlanTitle(''); setPlanNote(''); setPlanTime('');
  };

  const executeRemoveExpense = async () => {
    if (!expenseToDelete) return;
    const id = expenseToDelete;
    const exp = room.expenses[id];
    if (!canDeleteExpense(exp)) {
      setExpenseToDelete(null);
      return;
    }

    const db = (await import('firebase/database')).getDatabase();
    const ref = (await import('firebase/database')).ref;
    const remove = (await import('firebase/database')).remove;
    await remove(ref(db, `rooms/${roomId}/expenses/${id}`));
    
    await firebaseService.writeChatMessage(roomId, user, `đã xoá khoản chi "${exp.itemName}"`, 'system');
    setExpenseToDelete(null);
  };

  // Compute Balances
  const balances = useMemo(() => {
    const bals: Record<string, number> = {};
    members.forEach((m:any) => bals[m.uid] = 0);
    
    expenses.forEach(e => {
      // Payer pays
      if (e.payers) {
        Object.entries(e.payers).forEach(([uid, amount]) => {
          bals[uid] = (bals[uid] || 0) + Number(amount);
        });
      } else {
        bals[e.payer] = (bals[e.payer] || 0) + Number(e.amount);
      }

      // Participants consume
      if (e.splitMethod === 'EVENLY') {
        const amtPerPerson = e.amount / e.participants.length;
        e.participants.forEach(p => {
          bals[p] = (bals[p] || 0) - amtPerPerson;
        });
      } else if (e.splitMethod === 'MANUALLY' && e.manualSplits) {
        Object.entries(e.manualSplits).forEach(([uid, amt]) => {
          bals[uid] = (bals[uid] || 0) - Number(amt);
        });
      }
    });
    return bals;
  }, [expenses, members]);

  return (
    <div className="flex h-full w-full bg-[var(--color-background)] overflow-hidden relative">
      
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full bg-[var(--color-muted)] relative ${showRightSidebar ? 'hidden lg:flex' : 'flex'}`}>
         {/* Confetti Background in chat */}
         <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-foreground) 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
         <ChatSection 
           roomId={roomId} 
           room={room} 
           user={user} 
           getDisplayName={getDisplayName} 
           onViewSettlement={onViewSettlement} 
           onNavigate={onNavigate}
           onCreatePlan={() => setIsCreatePlanOpen(true)}
         />
      </div>

      {/* Right Sidebar - Details */}
      <div className={`w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 h-full bg-[var(--color-card-solid)] border-l border-[var(--color-border)] flex flex-col overflow-y-auto no-scrollbar transition-all duration-300 ${showRightSidebar ? 'fixed inset-y-0 right-0 z-40 lg:relative flex' : 'hidden'}`}>
        
        {/* Mobile Sidebar Header */}
        <div className="flex lg:hidden items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-card-solid)] sticky top-0 z-30">
          <h3 className="font-heading font-bold text-base text-[var(--color-foreground)]">Thông tin nhóm</h3>
          <button 
            type="button"
            onClick={() => setShowRightSidebar(false)} 
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-colors cursor-pointer"
            aria-label="Đóng bảng thông tin nhóm"
          >
            Đóng ✕
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-6">
          
          {/* Action Banners */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                type="button"
                onClick={() => onNavigate(Screen.ADD_EXPENSE)} 
                className="glass-card p-4 flex flex-col items-center justify-center gap-2 group focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                aria-label="Thêm chi tiêu mới"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] border border-[var(--color-border)] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                  <Plus size={20} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold  text-[var(--color-foreground)] text-center">Thêm Khổ Cực</span>
              </button>
              <button 
                type="button"
                disabled={expenses.length === 0}
                onClick={() => onNavigate(Screen.SETTLE_UP)} 
                className="glass-card p-4 flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                aria-label="Quyết toán và đòi tiền nhau"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-quaternary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)] shadow-sm group-hover:scale-110 transition-transform">
                  <CheckSquare size={20} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold  text-[var(--color-foreground)] text-center">Đòi Tiền Nhau</span>
              </button>
            </div>
            <button 
              type="button"
              onClick={() => onNavigate(Screen.HISTORY)} 
              className="w-full candy-btn candy-btn-secondary py-3 text-xs bg-[var(--color-card-solid)] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            >
              <Clock size={16} aria-hidden="true" /> Lịch Sử Đòi Nợ
            </button>
          </div>

          {/* Balances */}
          <div className="glass-card p-4.5 bg-[var(--color-muted)]">
            <h3 className="font-heading font-bold text-[var(--color-foreground)] text-sm mb-3 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-[var(--color-accent)]" aria-hidden="true" />
              Số Dư Hiện Tại
            </h3>
            <div className="flex flex-col gap-2">
              {members.map((m:any) => {
                const bal = balances[m.uid] || 0;
                const isPositive = bal > 0.01;
                const isNegative = bal < -0.01;
                const badgeColor = isPositive ? 'bg-[var(--color-green-light)] text-[var(--color-green-dark)]' : (isNegative ? 'bg-red-500/10 text-red-400' : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]');
                const badgeText = isPositive ? 'text-[var(--color-green-dark)]' : (isNegative ? 'text-red-400' : 'text-[var(--color-muted-foreground)]');
                
                return (
                  <div key={m.uid} className="flex justify-between items-center p-3 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-xl transition-all hover:border-[var(--color-border-hover)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-orange-light)] text-[var(--color-accent)] font-bold text-xs flex items-center justify-center shrink-0">
                        {getDisplayName(m.uid).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-[var(--color-foreground)] truncate">{getDisplayName(m.uid)}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${badgeColor} ${badgeText} border-[var(--color-border)] shrink-0`}>
                      {isPositive ? '+' : ''}{isNegative ? '-' : ''}{formatVND(Math.abs(bal))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Members */}
          <MembersSection roomId={roomId} members={members} nicknames={nicknames} isOwner={isOwner} user={user} />

          {/* Plans/Trips */}
          <PlansSection 
            roomId={roomId} 
            room={room} 
            members={members} 
            user={user} 
            getDisplayName={getDisplayName} 
            isOwner={isOwner} 
            onAddPlanClick={() => setIsCreatePlanOpen(true)}
          />

          {/* Recent Expenses */}
          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-bold text-[var(--color-foreground)] text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign size={16} className="text-[var(--color-accent)]" aria-hidden="true" />
                Chi Tiêu Gần Đây
              </span>
              <span className="text-xs bg-[var(--color-orange-light)] text-[var(--color-accent)] px-2.5 py-0.5 rounded-full border border-[var(--color-border)]">{expenses.length}</span>
            </h3>
            {expenses.length === 0 ? (
              <div className="p-5 text-center border border-[var(--color-border)] rounded-xl bg-[var(--color-card-solid)]">
                <span className="text-xs font-bold text-[var(--color-muted-foreground)]">Nhóm chưa có khoản chi tiêu nào.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {expenses.slice(0, 5).map(e => (
                  <div key={e.id} className="p-3.5 flex flex-col gap-2 group relative overflow-hidden bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-border-hover)] transition-all">
                    {canDeleteExpense(e) && (
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-red-500/10 border-l border-[var(--color-border)] flex items-center justify-center md:translate-x-full md:group-hover:translate-x-0 transition-transform">
                        <button 
                          type="button"
                          onClick={() => setExpenseToDelete(e.id)} 
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition-transform cursor-pointer"
                          aria-label={`Xóa khoản chi ${e.itemName}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                    <div className={`flex justify-between items-start pr-2 ${canDeleteExpense(e) ? 'md:group-hover:pr-10 pr-8' : ''} transition-all`}>
                      <h4 className="font-bold text-sm text-[var(--color-foreground)] truncate max-w-[65%]">{e.itemName}</h4>
                      <span className="font-bold text-sm text-[var(--color-accent)]">{formatVND(e.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--color-muted-foreground)]">
                      <span className="flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                        Trả: {e.payers ? 'Nhiều người' : getDisplayName(e.payer)}
                      </span>
                      <span>{new Date(e.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
                {expenses.length > 5 && (
                  <button 
                    type="button"
                    onClick={() => onNavigate(Screen.EXPENSES_LIST)} 
                    className="text-xs font-bold text-[var(--color-accent)] hover:underline text-center mt-2 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none rounded cursor-pointer"
                  >
                    Xem tất cả {expenses.length} mục…
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="h-8 shrink-0"></div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={executeRemoveExpense}
        title="Xóa Khoản Chi"
        message="Bạn có chắc chắn muốn xóa khoản chi này không?"
        confirmText="Xóa"
        isDanger={true}
      />

      <Modal isOpen={isCreatePlanOpen} onClose={() => setIsCreatePlanOpen(false)} title="Hẹn Nhau Đâu Đây">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="plan-title" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Làm cái gì đã?</label>
            <input 
              id="plan-title"
              name="planTitle"
              autoComplete="off"
              placeholder="VD: Nhậu ăn sinh thái ngàn dặm" 
              value={planTitle} 
              onChange={e=>setPlanTitle(e.target.value)} 
              className="candy-input w-full font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>
          <div>
            <label htmlFor="plan-time" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Chừng Nào? (Tuỳ Chọn)</label>
            <input 
              id="plan-time"
              type="datetime-local"
              name="planTime"
              value={planTime} 
              onChange={e=>setPlanTime(e.target.value)} 
              className="candy-input w-full font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>
          <div>
            <label htmlFor="plan-note" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Có gì vui?</label>
            <textarea 
              id="plan-note"
              name="planNote"
              placeholder="Ghi chú anh em mang theo thứ gì…" 
              value={planNote} 
              onChange={e=>setPlanNote(e.target.value)} 
              className="candy-input w-full min-h-[80px] py-3 resize-none font-medium focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>
          <button 
            type="button"
            onClick={handleAddPlan} 
            className="candy-btn w-full mt-2 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none cursor-pointer"
          >
            Hẹn Nhé
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Subcomponents
function MembersSection({ roomId, members, nicknames, isOwner, user }: any) {
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddCustom = async () => {
    setErrorMsg('');
    if (!newMember.trim()) return;
    const current = members.filter((m:any) => !m.isGoogle).map((m:any) => m.name);
    if (current.includes(newMember) || members.some((m:any) => m.name === newMember)) {
      setErrorMsg("Tên này đã tồn tại trong nhóm rồi nhé!"); 
      return;
    }
    await firebaseService.writeCustomMembers(roomId, [...current, newMember]);
    setNewMember('');
    setErrorMsg('');
    setIsOpenAdd(false);
  };

  const executeRemoveMember = async () => {
    if (!memberToDelete) return;
    const m = memberToDelete;
    if (!m.isGoogle) {
      const current = members.filter((mbr:any) => !mbr.isGoogle).map((mbr:any) => mbr.name);
      const updated = current.filter((n: string) => n !== m.name);
      await firebaseService.writeCustomMembers(roomId, updated);
    } else {
      await firebaseService.removeMember(roomId, m.uid);
    }
    setMemberToDelete(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-heading font-bold text-[var(--color-foreground)] text-sm flex items-center gap-2">
           <UserPlus size={16} /> Băng Đảng <span className="text-xs bg-[var(--color-orange-light)] text-[var(--color-accent)] px-2.5 py-0.5 rounded-full border border-[var(--color-border)] ml-1">{members.length}</span>
        </h3>
        {isOwner && (
          <button 
            type="button"
            onClick={() => setIsOpenAdd(true)} 
            className="w-8 h-8 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)] shadow-sm hover:border-[var(--color-border-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all active:scale-95 p-0 cursor-pointer"
            aria-label="Thêm thành viên khách mới"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 relative z-10 max-h-[300px] overflow-y-auto no-scrollbar pb-2">
        {members.map((m:any, index: number) => {
          const bgColors = ['bg-[var(--color-accent)]', 'bg-[var(--color-tertiary)]', 'bg-[var(--color-quaternary)]', 'bg-[var(--color-secondary)]'];
          const avatarColor = bgColors[index % bgColors.length];
          return (
            <motion.div 
              key={m.uid} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
              className="flex justify-between items-center gap-3 p-2.5 bg-[var(--color-card-solid)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] group transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[var(--color-border)] shadow-sm ${avatarColor} flex items-center justify-center`}>
                  {m.photoURL ? <img src={m.photoURL} alt="Ảnh đại diện thành viên" className="w-full h-full object-cover"/> : <div className="font-heading font-bold text-white text-base leading-none">{m.name.charAt(0).toUpperCase()}</div>}
                </div>
                <div className="truncate text-sm font-bold text-[var(--color-foreground)] min-w-0">
                  <span className="block truncate">{nicknames[m.uid] ? `${nicknames[m.uid]}` : m.name}</span>
                  {nicknames[m.uid] && <span className="text-[10px] text-[var(--color-muted-foreground)] block font-semibold truncate leading-none mt-0.5">({m.name})</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!m.isGoogle && <span className="text-[9px] font-bold bg-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[var(--color-muted-foreground)]">Khách</span>}
                {isOwner && m.uid !== user.uid && (
                  <button 
                    type="button"
                    onClick={() => setMemberToDelete(m)} 
                    className="w-7 h-7 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none flex items-center justify-center transition-all p-0 cursor-pointer"
                    aria-label={`Xóa thành viên ${m.name}`}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      <Modal isOpen={isOpenAdd} onClose={() => { setErrorMsg(''); setIsOpenAdd(false); }} title="Mời Bạn Lượn Cùng">
         <div className="gap-6 flex flex-col">
            <div>
              <label htmlFor="newmember-name" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Tên Thành Viên Mới</label>
              <input 
                id="newmember-name"
                name="memberName"
                autoComplete="name"
                placeholder="VD: Huy" 
                value={newMember} 
                onChange={e=>{ setErrorMsg(''); setNewMember(e.target.value); }} 
                className="candy-input w-full font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
              />
            </div>
            {errorMsg && (
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-red-400" aria-hidden="true" />
                {errorMsg}
              </div>
            )}
            <button 
              type="button"
              onClick={handleAddCustom} 
              className="candy-btn w-full mt-2 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none cursor-pointer"
            >
              Duyệt Nhập Đội
            </button>
         </div>
      </Modal>

      <ConfirmModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={executeRemoveMember}
        title="Xóa Thành Viên"
        message={`Bạn có chắc chắn muốn xóa thành viên "${memberToDelete?.name}" khỏi nhóm này không?`}
        confirmText="Xóa"
        isDanger={true}
      />
    </div>
  );
}

const formatPlanTime = (timeStr: string) => {
  if (!timeStr) return '';
  const hasDatePattern = /^\d{4}-\d{2}-\d{2}/.test(timeStr);
  if (!hasDatePattern) return timeStr;
  try {
    const d = new Date(timeStr);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return timeStr;
  }
};

function PlansSection({ roomId, room, members, user, getDisplayName, isOwner, onAddPlanClick }: any) {
  const plans = Object.values(room.plans || {}).reverse() as any[];

  const toggleVote = async (planId: string) => {
    const plan = room.plans[planId];
    const votes = plan.votes || {};
    const newVotes = { ...votes };
    if (newVotes[user.uid]) delete newVotes[user.uid];
    else newVotes[user.uid] = true;
    
    const db = (await import('firebase/database')).getDatabase();
    const ref = (await import('firebase/database')).ref;
    const update = (await import('firebase/database')).update;
    await update(ref(db, `rooms/${roomId}/plans/${planId}`), { votes: newVotes });
  };

  const removePlan = async (planId: string) => {
    const db = (await import('firebase/database')).getDatabase();
    const ref = (await import('firebase/database')).ref;
    const remove = (await import('firebase/database')).remove;
    await remove(ref(db, `rooms/${roomId}/plans/${planId}`));
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-heading font-bold text-[var(--color-foreground)] text-sm flex items-center gap-2">
           <MapPin size={16} /> Tới Đâu Rảnh?
        </h3>
        <button 
          type="button"
          onClick={onAddPlanClick} 
          className="w-8 h-8 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)] shadow-sm hover:border-[var(--color-border-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all active:scale-95 p-0 cursor-pointer"
          aria-label="Thêm kế hoạch mới"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="overflow-y-auto no-scrollbar flex flex-col gap-3 relative z-10 max-h-[300px]">
        {plans.length === 0 && <div className="text-center font-bold text-xs text-[var(--color-muted-foreground)] p-5 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-xl">Chưa có kế hoạch nào.</div>}
        {plans.map((p) => {
          const voteCount = Object.keys(p.votes || {}).length;
          const myVote = (p.votes || {})[user.uid];
          return (
            <div key={p.id} className="bg-[var(--color-card-solid)] p-4 relative group rounded-xl border border-[var(--color-border)] shadow-sm transition-all hover:border-[var(--color-border-hover)] flex flex-col">
              {(isOwner || p.creatorUid === user.uid) && (
                <button 
                  type="button"
                  onClick={() => removePlan(p.id)} 
                  className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center text-red-400 bg-red-500/10 border border-[var(--color-border)] rounded-full w-7 h-7 font-bold focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer"
                  aria-label={`Xóa kế hoạch ${p.title}`}
                >
                  <Trash2 size={12} aria-hidden="true" />
                </button>
              )}
              <h4 className="font-heading font-bold text-sm leading-tight mb-1.5 pr-6 text-[var(--color-foreground)]">{p.title}</h4>
              <div className="text-xs text-[var(--color-muted-foreground)] mb-3 font-semibold bg-[var(--color-muted)] p-2.5 rounded-lg border border-[var(--color-border)] flex flex-col gap-1.5">
                {p.time && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                    <span>{formatPlanTime(p.time)}</span>
                  </span>
                )}
                {p.note && (
                  <span className="flex items-start gap-1.5">
                    <FileText size={12} className="text-[var(--color-accent)] shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="whitespace-pre-wrap">{p.note}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-center text-sm">
                <button 
                  type="button"
                  onClick={() => toggleVote(p.id)} 
                  className={`py-1.5 px-3 flex flex-1 items-center justify-center gap-2 font-bold rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none cursor-pointer ${myVote ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-md' : 'bg-[var(--color-card-solid)] border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-foreground)]'}`}
                  aria-label={`Tham gia kế hoạch ${p.title}`}
                >
                  <span className="flex items-center gap-1.5">
                    Tham gia!
                    <ThumbsUp size={12} aria-hidden="true" />
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs border ${myVote ? 'bg-[var(--color-card-solid)]/20 border-white/30 text-white' : 'bg-[var(--color-muted)] border-[var(--color-border)] text-[var(--color-foreground)]'}`}>{voteCount}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatSection({ roomId, room, user, getDisplayName, onViewSettlement, onNavigate, onCreatePlan }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [msgToDelete, setMsgToDelete] = useState<any>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const plans = (Object.values(room.plans || {}) as any[]).filter((p: any) => p && typeof p === 'object');
  const pinnedPlan = plans[plans.length - 1];
  const expensesLength = room.expenses ? Object.keys(room.expenses).length : 0;

  useEffect(() => {
    const unsub = firebaseService.subscribeToChat(roomId, msgs => setMessages(msgs));
    return () => unsub();
  }, [roomId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (editingMessageId) {
      await firebaseService.updateChatMessage(roomId, editingMessageId, text);
      setEditingMessageId(null);
    } else {
      await firebaseService.writeChatMessage(roomId, user, text, 'user');
    }
    setText('');
  };

  const handleEdit = (m: any) => {
    setEditingMessageId(m.id);
    setText(m.text);
  };

  const executeDeleteMsg = async () => {
    if (msgToDelete) {
      await firebaseService.deleteChatMessage(roomId, msgToDelete.id);
      setMsgToDelete(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full relative z-10 w-full max-w-5xl mx-auto border-x border-[var(--color-border)] bg-[var(--color-card-solid)] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-foreground) 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 max-w-sm mx-auto flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-[2.2rem] bg-[var(--color-orange-light)] border border-[var(--color-border)] shadow-md flex items-center justify-center text-[var(--color-accent)] animate-bounce">
            <MessagesSquare size={36} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-[var(--color-foreground)] mb-2">Chưa có tin nhắn</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed max-w-xs mx-auto font-medium">
              Nhóm mới được thành lập! Hãy gửi lời chào mừng để kích hoạt phòng chat và bắt đầu chia sẻ chi tiêu cùng đồng bọn.
            </p>
          </div>
          <button 
            onClick={async () => {
              await firebaseService.writeChatMessage(roomId, user, "đã bắt đầu cuộc trò chuyện!", 'system');
            }} 
            className="candy-btn w-full text-sm font-semibold py-3 cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageSquarePlus size={16} aria-hidden="true" /> Bắt đầu trò chuyện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative z-10 w-full max-w-5xl mx-auto border-x border-[var(--color-border)] bg-[var(--color-card-solid)] overflow-hidden">
      {/* Telegram style Pinned Announcement Bar */}
      {pinnedPlan && (
        <div className="bg-[var(--color-orange-light)] border-b border-[var(--color-border)] px-4 py-2.5 hover:bg-[var(--color-orange-light)]/85 transition-colors flex items-center justify-between text-left shrink-0 z-30 select-none">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-[var(--color-accent)] font-bold text-[11px] shrink-0 bg-[var(--color-card-solid)] border border-[var(--color-border)] px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <Pin size={11} className="rotate-45" aria-hidden="true" /> Ghim
            </span>
            <div className="text-xs truncate flex flex-col md:flex-row md:items-center">
              <span className="font-bold text-[var(--color-foreground)] mr-1.5">{pinnedPlan.title}</span>
              {pinnedPlan.time && <span className="text-[var(--color-muted-foreground)] text-[11px] md:border-l md:border-[var(--color-border)] md:pl-1.5 md:ml-1.5">{formatPlanTime(pinnedPlan.time)}</span>}
              {pinnedPlan.note && <span className="text-[var(--color-muted-foreground)] font-medium text-[11px] truncate md:ml-1.5">— {pinnedPlan.note}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-accent)] font-bold shrink-0 pl-2">
            <span>+{plans.length > 1 ? plans.length - 1 : 0} ghim</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-4 max-h-full telegram-bg">
        {messages.map((m, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showAvatar = !prevMsg || prevMsg.uid !== m.uid || prevMsg.type !== m.type;

          if (m.type === 'system') return (
            <div key={m.id || index} className="text-center my-3">
               <span className="chat-bubble-system">
                 {m.displayName && <b className="text-[var(--color-accent)] mr-1">{getDisplayName(m.uid)}</b>}
                 {m.text}
               </span>
            </div>
          );
          if (m.type === 'settlement') {
            const billId = m.payload?.billId;
            const totalAmount = m.payload?.totalAmount || 0;
            const settledBy = m.payload?.settledBy || m.displayName;
            
            return (
              <button 
                key={m.id || index} 
                type="button"
                onClick={() => {
                  if (onViewSettlement) {
                    if (billId && room.settledBills?.[billId]) {
                      onViewSettlement(room.settledBills[billId], Screen.HOME);
                    } else {
                      // Phục hồi dự phòng nếu hóa đơn chưa tải xong trong room.settledBills
                      onViewSettlement({
                        id: billId || 'temp',
                        date: m.timestamp ? new Date(m.timestamp).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
                        expenses: room.expenses ? Object.values(room.expenses) : [],
                        transactions: m.payload?.transactions || [],
                        totalAmount: totalAmount,
                        settledBy: settledBy,
                      }, Screen.HOME);
                    }
                  }
                }}
                className="bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-900/50 p-4.5 text-sm my-4 text-center w-full max-w-xs sm:max-w-sm mx-auto flex flex-col items-center shadow-sm hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none cursor-pointer transition-all duration-200"
                aria-label="Xem chi tiết quyết toán"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-2.5 shadow-[0_2px_8px_rgba(34,197,94,0.3)] animate-pulse">
                   <CheckSquare size={18} aria-hidden="true" />
                </div>
                <span className="font-bold text-[var(--color-foreground)] text-sm flex items-center gap-1.5">
                  Đã Quyết Toán Xong <PartyPopper size={16} className="text-amber-500" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)] mt-1">Chốt bởi {settledBy}</span>
                {totalAmount > 0 && (
                  <div className="mt-2 font-heading font-extrabold text-base text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30 px-3 py-1 rounded-full border border-green-200/50 dark:border-green-900/30">
                    {formatVND(totalAmount)}
                  </div>
                )}
                <span className="text-[10px] text-green-500 font-bold mt-2.5 hover:underline flex items-center gap-1">
                  Xem chi tiết quyết toán <ArrowRight size={12} aria-hidden="true" />
                </span>
              </button>
            );
          }
          const isMe = m.uid === user.uid;
          return (
            <div key={m.id || index} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
              {showAvatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--color-border)] relative bg-[var(--color-card-solid)] shadow-sm mb-1">
                  {m.photoURL ? <img src={m.photoURL} alt="Ảnh đại diện người nhắn" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-heading font-medium text-xs bg-[var(--color-secondary)] text-white">{m.displayName?.charAt(0) || '?'}</div>}
                </div>
              ) : (
                <div className="w-8 shrink-0"></div>
              )}
              <div className="flex flex-col relative">
                 {showAvatar && !isMe && <div className="text-[10px] font-bold text-[var(--color-muted-foreground)] mb-1 ml-1">{getDisplayName(m.uid)}</div>}
                 
                 <div className={`px-4 py-2.5 max-w-[280px] sm:max-w-md break-words text-sm relative font-medium ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'} ${m.isDeleted ? 'opacity-50 italic' : ''}`}>
                   {m.text}
                 </div>
                 
                 {/* Message actions */}
                 {isMe && !m.isDeleted && (
                   <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <button 
                       type="button"
                       onClick={() => handleEdit(m)} 
                       className="w-7 h-7 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                       aria-label="Sửa tin nhắn"
                     >
                       <Edit2 size={11} aria-hidden="true" />
                     </button>
                     <button 
                       type="button"
                       onClick={() => setMsgToDelete(m)} 
                       className="w-7 h-7 rounded-full bg-[var(--color-card-solid)] border border-[var(--color-border)] text-red-500 hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                       aria-label="Thu hồi tin nhắn"
                     >
                       <Trash2 size={11} aria-hidden="true" />
                     </button>
                   </div>
                 )}
                 {m.isEdited && !m.isDeleted && <span className="text-[10px] text-[var(--color-muted-foreground)] mt-1 ml-1">Đã chỉnh sửa</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 relative z-20 flex flex-col shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card-solid)]">
        {editingMessageId && (
          <div className="absolute -top-9 left-4 right-4 bg-[var(--color-accent)] text-white text-xs font-bold py-1.5 px-4 flex justify-between items-center rounded-t-xl shadow-md border-t border-x border-[var(--color-border)]">
            <span className="flex items-center gap-1.5">
              <Edit2 size={12} aria-hidden="true" /> Sửa tin nhắn…
            </span>
            <button onClick={() => {setEditingMessageId(null); setText('');}} className="hover:text-white/80 transition-colors cursor-pointer">Hủy</button>
          </div>
        )}

        <div className="flex gap-2.5 items-center max-w-4xl w-full mx-auto relative">
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)} 
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shrink-0 ${
                showActionsMenu 
                  ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white rotate-45 scale-105 shadow-md' 
                  : 'bg-[var(--color-muted)] border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-foreground)]'
              }`}
              aria-label="Các tùy chọn tạo hóa đơn, quyết toán, chuyến đi"
              aria-expanded={showActionsMenu}
            >
               <Plus size={20} aria-hidden="true" />
            </button>

            <AnimatePresence>
              {showActionsMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30 cursor-default" 
                    onClick={() => setShowActionsMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-12 left-0 z-40 w-52 glass-card p-2 shadow-xl border border-[var(--color-border)] flex flex-col gap-1 min-w-[200px]"
                  >
                    <button 
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        onNavigate(Screen.ADD_EXPENSE);
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--color-accent)]/10 text-[var(--color-foreground)] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white shrink-0">
                        <Plus size={15} aria-hidden="true" />
                      </div>
                      Thêm Khổ Cực
                    </button>
                    
                    <button 
                      type="button"
                      disabled={expensesLength === 0}
                      onClick={() => {
                        setShowActionsMenu(false);
                        onNavigate(Screen.SETTLE_UP);
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--color-accent)]/10 text-[var(--color-foreground)] font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-[var(--color-quaternary)] flex items-center justify-center text-[var(--color-foreground)] shrink-0">
                        <CheckSquare size={14} aria-hidden="true" />
                      </div>
                      Đòi Tiền Nhau
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        onCreatePlan();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--color-accent)]/10 text-[var(--color-foreground)] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white shrink-0">
                        <MapPin size={14} aria-hidden="true" />
                      </div>
                      Tạo Chuyến Đi
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 relative flex items-center bg-[var(--color-muted)] rounded-full border border-[var(--color-border)] px-4 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-[var(--color-accent)]">
            <label htmlFor="chat-message-input" className="sr-only">Nhập tin nhắn</label>
            <input 
              id="chat-message-input"
              name="chatMessage"
              autoComplete="off"
              spellCheck={false}
              value={text} 
              onChange={e => setText(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent border-none outline-none py-2 text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 font-medium" 
              placeholder="Nhắn tin…" 
            />
          </div>
          <button 
            type="button"
            onClick={handleSend} 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all p-0 shrink-0 cursor-pointer ${editingMessageId ? 'bg-[var(--color-secondary)] shadow-[0_2px_8px_rgba(26,108,168,0.3)]' : 'bg-[var(--color-accent)] shadow-[0_2px_8px_rgba(36,129,204,0.3)]'}`}
            aria-label={editingMessageId ? "Lưu tin nhắn đã sửa" : "Gửi tin nhắn"}
          >
             <SendIcon size={16} className="ml-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!msgToDelete}
        onClose={() => setMsgToDelete(null)}
        onConfirm={executeDeleteMsg}
        title="Thu hồi tin nhắn"
        message="Bạn có chắc chắn muốn thu hồi tin nhắn này không?"
        confirmText="Thu hồi"
        isDanger={true}
      />
    </div>
  );
}
