import { useState, useMemo, useEffect } from 'react';
import { UserProfile, RoomDetails, Screen } from '../types';
import { ArrowLeft, Bell, Gear, Edit2, Trash2, Plus, Wallet, Info, LogOut, ExclamationCircle } from '../components/ui/Icons';
import { firebaseService } from '../services/firebase';
import HomeScreen from './HomeScreen';
// Import other screens...
import AddExpenseWizard from './AddExpenseWizard';
import SettleUpScreen from './SettleUpScreen';
import HistoryScreen from './HistoryScreen';
import { motion, AnimatePresence } from 'motion/react';
import ExpensesListScreen from './ExpensesListScreen';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Modal } from '../components/ui/Modal';

export default function ActiveRoom({ user, profile, roomDetails, roomId, onLeaveRoom }: any) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const [activeBill, setActiveBill] = useState<any>(null); // For history detail
  const [historyDetailBackScreen, setHistoryDetailBackScreen] = useState<Screen>(Screen.HISTORY);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [roomAction, setRoomAction] = useState<null | 'DELETE' | 'LEAVE'>(null);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [tempRoomName, setTempRoomName] = useState('');

  // Reset screen states when switching rooms
  useEffect(() => {
    setCurrentScreen(Screen.HOME);
    setShowRightSidebar(false);
    setIsSettingsOpen(false);
    setIsApprovalsOpen(false);
    setRoomAction(null);
  }, [roomId]);

  const requestsCount = roomDetails.requests ? Object.keys(roomDetails.requests).length : 0;
  const isOwner = roomDetails.metadata.ownerId === user.uid;

  const executeEditRoomName = async () => {
    if (tempRoomName && tempRoomName.trim() !== "") {
      await firebaseService.updateRoomName(roomId, tempRoomName.trim());
      setIsEditNameOpen(false);
    }
  };

  const executeDeleteRoom = async () => {
    const allMembersData: string[] = [];
    if (roomDetails.members) {
      Object.keys(roomDetails.members).forEach(uid => allMembersData.push(uid));
    }
    await firebaseService.deleteRoom(roomId, allMembersData);
    onLeaveRoom();
  };
  
  const executeLeaveRoom = async () => {
    await firebaseService.leaveRoom(user.uid, roomId);
    onLeaveRoom();
  };

  const allMembersData = useMemo(() => {
    const list: any[] = [];
    if (roomDetails.members) {
      Object.entries(roomDetails.members).forEach(([uid, data]: [string, any]) => {
        const customBank = roomDetails.customMembersBanks?.[uid] || {};
        list.push({ isGoogle: true, uid, ...data, name: data.displayName, ...customBank });
      });
    }
    if (roomDetails.customMembers) {
      roomDetails.customMembers.forEach((name: string) => {
        const customBank = roomDetails.customMembersBanks?.[name] || {};
        list.push({ isGoogle: false, uid: name, name, ...customBank });
      });
    }
    return list;
  }, [roomDetails]);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden relative bg-[var(--color-muted)]">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-10 w-48 h-48 bg-[var(--color-tertiary)] rounded-full -z-0 opacity-20 blur-3xl"></div>
      
      {/* Header Panel */}
      <div className="bg-[var(--color-card-solid)] border-b border-[var(--color-border)] p-3 px-4 flex justify-between items-center shrink-0 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onLeaveRoom} 
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-muted)]/80 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all p-0"
            aria-label="Quay lại danh sách nhóm"
          >
            <ArrowLeft size={16} className="mr-0.5" aria-hidden="true" />
          </button>
          
          <div className="flex flex-col text-left select-none">
            <h1 className="text-base font-heading font-bold text-[var(--color-foreground)] leading-tight">
              {roomDetails.metadata.name}
            </h1>
            <span className="text-[11px] text-[var(--color-muted-foreground)] font-semibold mt-0.5">
              {allMembersData.length} thành viên • Mã: {roomId}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className={`w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all cursor-pointer p-0 relative ${
                isSettingsOpen || showRightSidebar 
                  ? 'bg-[var(--color-accent)] text-white shadow-sm' 
                  : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]'
              }`}
              title="Thông tin & tùy chọn nhóm"
            >
              <ExclamationCircle size={18} aria-hidden="true" />
              {requestsCount > 0 && isOwner && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] ring-2 ring-[var(--color-card-solid)] animate-bounce">
                  {requestsCount}
                </span>
              )}
            </button>
            
            {isSettingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}></div>
                <div className="absolute right-0 top-11 w-52 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-2xl shadow-xl z-50 overflow-hidden py-2 flex flex-col gap-1 p-2">
                  <button 
                    type="button"
                    onClick={() => { setIsSettingsOpen(false); setShowRightSidebar(!showRightSidebar); }} 
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--color-accent)]/10 focus-visible:bg-[var(--color-accent)]/10 focus-visible:outline-none font-bold text-xs flex items-center gap-2.5 text-[var(--color-foreground)] transition-colors cursor-pointer"
                  >
                    <Info size={14} aria-hidden="true" /> {showRightSidebar ? "Đóng thông tin nhóm" : "Xem thông tin nhóm"}
                  </button>

                  {isOwner && (
                    <button 
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); setTempRoomName(roomDetails.metadata.name || ''); setIsEditNameOpen(true); }} 
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--color-accent)]/10 focus-visible:bg-[var(--color-accent)]/10 focus-visible:outline-none font-bold text-xs flex items-center gap-2.5 text-[var(--color-foreground)] transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} aria-hidden="true" /> Đổi tên nhóm
                    </button>
                  )}

                  {isOwner && (
                    <button 
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); setIsApprovalsOpen(true); }} 
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--color-accent)]/10 focus-visible:bg-[var(--color-accent)]/10 focus-visible:outline-none font-bold text-xs flex items-center gap-2.5 text-[var(--color-foreground)] transition-colors cursor-pointer relative"
                    >
                      <Bell size={14} aria-hidden="true" /> Duyệt thành viên mới
                      {requestsCount > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px]">
                          {requestsCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => { setIsSettingsOpen(false); setRoomAction('LEAVE'); }} 
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-500/10 focus-visible:bg-rose-500/10 focus-visible:outline-none text-red-500 font-bold text-xs flex items-center gap-2.5 border-t border-[var(--color-border)]/50 pt-2 cursor-pointer"
                  >
                    <LogOut size={14} aria-hidden="true" /> Rời nhóm
                  </button>

                  {isOwner && (
                    <button 
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); setRoomAction('DELETE'); }} 
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-500/10 focus-visible:bg-rose-500/10 focus-visible:outline-none text-red-500 font-bold text-xs flex items-center gap-2.5 border-t border-[var(--color-border)]/50 pt-2 cursor-pointer"
                    >
                      <Trash2 size={14} aria-hidden="true" /> Xóa nhóm
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-0 relative z-10">

        <AnimatePresence mode="wait">
          {currentScreen === Screen.HOME && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="h-full w-full">
              <HomeScreen 
                roomId={roomId}
                room={roomDetails} 
                members={allMembersData} 
                user={user} 
                profile={profile}
                onNavigate={setCurrentScreen} 
                showRightSidebar={showRightSidebar}
                setShowRightSidebar={setShowRightSidebar}
                onViewSettlement={(bill: any, fromScreen: Screen) => {
                  setActiveBill(bill);
                  setHistoryDetailBackScreen(fromScreen);
                  setCurrentScreen(Screen.HISTORY_DETAIL);
                }}
              />
            </motion.div>
          )}
          
          {currentScreen === Screen.ADD_EXPENSE && (
            <motion.div key="add_expense" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="h-full w-full">
              <AddExpenseWizard
                roomId={roomId}
                members={allMembersData}
                user={user}
                onClose={() => setCurrentScreen(Screen.HOME)}
              />
            </motion.div>
          )}

          {currentScreen === Screen.SETTLE_UP && (
            <motion.div key="settle_up" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="h-full w-full">
              <SettleUpScreen
                roomId={roomId}
                room={roomDetails}
                members={allMembersData}
                user={user}
                isHistoryView={false}
                onClose={() => setCurrentScreen(Screen.HOME)}
              />
            </motion.div>
          )}

          {currentScreen === Screen.HISTORY && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="h-full w-full">
              <HistoryScreen
                roomId={roomId}
                room={roomDetails}
                isOwner={isOwner}
                onViewBill={(bill: any) => { 
                  setActiveBill(bill); 
                  setHistoryDetailBackScreen(Screen.HISTORY);
                  setCurrentScreen(Screen.HISTORY_DETAIL); 
                }}
                onClose={() => setCurrentScreen(Screen.HOME)}
              />
            </motion.div>
          )}

          {currentScreen === Screen.HISTORY_DETAIL && (
            <motion.div key="history_detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="h-full w-full">
              <SettleUpScreen
                 roomId={roomId}
                 room={roomDetails}
                 members={allMembersData}
                 user={user}
                 isHistoryView={true}
                 historyBill={activeBill}
                 onClose={() => setCurrentScreen(historyDetailBackScreen)}
              />
            </motion.div>
          )}

          {currentScreen === Screen.EXPENSES_LIST && (
            <motion.div key="expenses_list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="h-full w-full">
               <ExpensesListScreen
                 roomId={roomId}
                 room={roomDetails}
                 user={user}
                 getDisplayName={(uid: string) => {
                   const nicknames = roomDetails.nicknames || {};
                   if (nicknames[uid]) return nicknames[uid];
                   const m = allMembersData.find((x: any) => x.uid === uid || x.name === uid);
                   return m ? m.name : uid;
                 }}
                 onClose={() => setCurrentScreen(Screen.HOME)}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={roomAction === 'DELETE'}
        onClose={() => setRoomAction(null)}
        onConfirm={executeDeleteRoom}
        title="Xóa nhóm?"
        message="Hành động này không thể hoàn tác. Toàn bộ dữ liệu chi tiêu, chat và thành viên sẽ bị mất!"
        confirmText="Xóa nhóm"
        isDanger={true}
      />
      <ConfirmModal
        isOpen={roomAction === 'LEAVE'}
        onClose={() => setRoomAction(null)}
        onConfirm={executeLeaveRoom}
        title="Rời nhóm?"
        message="Bạn có chắc chắn muốn rời nhóm này? Bạn sẽ không thấy dữ liệu nhóm nữa cho tới khi được thêm lại."
        confirmText="Rời khỏi"
        isDanger={true}
      />

      {/* Approvals Modal for Owner */}
      {isApprovalsOpen && (
        <RoomApprovalsModal 
          isOpen={isApprovalsOpen} 
          onClose={() => setIsApprovalsOpen(false)}
          roomId={roomId}
          requests={roomDetails.requests}
        />
      )}

      {/* Beautiful Modal for room name edit */}
      <Modal isOpen={isEditNameOpen} onClose={() => setIsEditNameOpen(false)} title="Sửa Tên Nhóm">
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="editroom-name" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Tên nhóm mới</label>
            <input 
              id="editroom-name"
              name="roomName"
              autoComplete="off"
              placeholder="VD: Cung đường mây phượt" 
              value={tempRoomName} 
              onChange={e => setTempRoomName(e.target.value)} 
              className="candy-input w-full font-bold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
              autoFocus
            />
          </div>
          <button 
            type="button"
            onClick={executeEditRoomName} 
            className="candy-btn w-full mt-2 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
          >
            Cập Nhật
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Inlined RoomApprovalsModal to save steps

function RoomApprovalsModal({ isOpen, onClose, roomId, requests }: any) {
  const reqList = Object.entries(requests || {});

  const handleApprove = async (uid: string, data: any) => {
    await firebaseService.approveRequest(roomId, uid, data);
  };

  const handleReject = async (uid: string) => {
    await firebaseService.rejectRequest(roomId, uid);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tiếng Gõ Cửa (Yêu Cầu)">
      {reqList.length === 0 ? (
        <p className="text-center font-bold  text-[var(--color-muted-foreground)] p-8 bg-[var(--color-muted)] border  border-[var(--color-border)] rounded-xl">Chưa có ai gõ cửa ngoài kia.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reqList.map(([uid, data]: any) => (
            <div key={uid} className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full border border-[var(--color-border)] overflow-hidden shadow-sm bg-[var(--color-card-solid)]">
                  <img src={data.photoURL} alt="Ảnh đại diện người yêu cầu" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-heading font-bold text-[var(--color-foreground)]">{data.displayName}</div>
                  <div className="text-xs text-[var(--color-muted-foreground)]  font-semibold mt-0.5">{data.email}</div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  type="button"
                  onClick={() => handleApprove(uid, data)} 
                  className="candy-btn flex-1 text-xs px-4 min-h-[36px] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                >
                  Duyệt Vào
                </button>
                <button 
                  type="button"
                  onClick={() => handleReject(uid)} 
                  className="candy-btn candy-btn-secondary flex-1 text-xs px-4 min-h-[36px] bg-[var(--color-card-solid)] border border-[var(--color-border)] hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none text-red-400 hover:text-red-300"
                >
                  Từ Chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
