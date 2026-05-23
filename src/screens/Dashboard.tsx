import { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { firebaseService } from '../services/firebase';
import { BoxArrowRight, BoxArrowInRight, PlusLg, People, Search, QrCode, ChatDots, ChatDotsFill, PeopleFill, ClockHistory, PersonFill, CheckLg, XLg, Calendar2, Calendar2Fill, LogOut, Users, MessageCircle, Contact, Clock, User as UserIcon, Check, X, MapPin, DollarSign, Trash2, Sun, Moon, ChevronLeft, ChevronRight, Calendar, List, Sparkles, CheckSquare, ArrowRight, FileText, CheckCircle2, AlertTriangle, Info, PartyPopper } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ALL_BANKS, formatVND } from '../constants';

export default function Dashboard({ user, profile, myRooms, pendingRequests, onSelectRoom, activeRoomId, activeTab, setActiveTab }: any) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('uno-theme', 'light');
      setIsDark(false);
      showToast('Đã chuyển sang giao diện Sáng', 'info');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('uno-theme', 'dark');
      setIsDark(true);
      showToast('Đã chuyển sang giao diện Tối', 'success');
    }
  };
  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const [selectedHistoryBill, setSelectedHistoryBill] = useState<any>(null);
  const [historyQrTx, setHistoryQrTx] = useState<{ tx: any; bill: any } | null>(null);

  const getRoomMembers = (bill: any) => {
    const list: any[] = [];
    if (bill.roomMembers) {
      Object.entries(bill.roomMembers).forEach(([uid, data]: [string, any]) => {
        if (data && typeof data === 'object') {
          const customBank = bill.roomCustomMembersBanks?.[uid] || {};
          list.push({ isGoogle: true, uid, ...data, name: data.displayName || 'Thành viên', ...customBank });
        }
      });
    }
    if (bill.roomCustomMembers) {
      const customMembersArray = Array.isArray(bill.roomCustomMembers)
        ? bill.roomCustomMembers
        : Object.values(bill.roomCustomMembers);
      customMembersArray.forEach((name: any) => {
        if (name && typeof name === 'string') {
          const customBank = bill.roomCustomMembersBanks?.[name] || {};
          list.push({ isGoogle: false, uid: name, name, ...customBank });
        }
      });
    }
    return list;
  };

  const getDisplayNameForBill = (nameOrUid: string, bill: any) => {
    if (bill.roomNicknames?.[nameOrUid]) return bill.roomNicknames[nameOrUid];
    const roomMembers = getRoomMembers(bill);
    const m = roomMembers.find((x: any) => x.uid === nameOrUid || x.name === nameOrUid);
    return m ? m.name : nameOrUid;
  };

  const allSettledBills = useMemo(() => {
    const list: any[] = [];
    if (Array.isArray(myRooms)) {
      myRooms.forEach((room: any) => {
        if (room && room.settledBills) {
          Object.entries(room.settledBills).forEach(([billId, bill]: [string, any]) => {
            if (bill && typeof bill === 'object') {
              list.push({
                ...bill,
                id: billId,
                roomId: room.id,
                roomName: room.name,
                roomMembers: room.members,
                roomCustomMembers: room.customMembers,
                roomNicknames: room.nicknames,
                roomCustomMembersBanks: room.customMembersBanks
              });
            }
          });
        }
      });
    }
    return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  }, [myRooms]);

  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Profile inline state
  const [name, setName] = useState(profile?.displayName || '');
  const [bankId, setBankId] = useState(profile?.bankId || '');
  const [accNum, setAccNum] = useState(profile?.accountNumber || '');

  // Friends state
  const [friendEmail, setFriendEmail] = useState('');
  const [isSendingFriendReq, setIsSendingFriendReq] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendReqs, setFriendReqs] = useState<any[]>([]);

  // Play schedules state
  const [schedules, setSchedules] = useState<any[]>([]);
  const allSchedules = useMemo(() => {
    const list: any[] = [];
    if (Array.isArray(schedules)) {
      schedules.forEach((s: any) => {
        list.push({ ...s, isGroup: false });
      });
    }
    if (Array.isArray(myRooms)) {
      myRooms.forEach((room: any) => {
        if (room && room.plans) {
          Object.entries(room.plans).forEach(([planId, plan]: [string, any]) => {
            if (plan && typeof plan === 'object' && plan.time) {
              list.push({
                id: planId,
                title: plan.title,
                time: plan.time,
                note: plan.note || '',
                createdBy: plan.createdBy || '',
                creatorUid: plan.creatorUid || '',
                votes: plan.votes || {},
                roomId: room.id,
                roomName: room.name,
                isGroup: true,
                location: 'Trong phòng chat nhóm',
                budget: 0
              });
            }
          });
        }
      });
    }
    return list;
  }, [schedules, myRooms]);
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newNote, setNewNote] = useState('');

  // Calendar states
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Format today's date as YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Format Date object to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(formatDateString(today));
  };

  // Helper to generate monthly grid (starts on Monday)
  const generateCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth(); // 0-11
    
    const firstDayOfMonth = new Date(year, month, 1);
    let dayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    // Shift so Mon is index 0
    const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const days: { date: Date; isCurrentMonth: boolean; dateString: string }[] = [];
    
    // Previous month filling days
    for (let i = startOffset; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: formatDateString(prevDate)
      });
    }
    
    // Current month days
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currDate = new Date(year, month, i);
      days.push({
        date: currDate,
        isCurrentMonth: true,
        dateString: formatDateString(currDate)
      });
    }
    
    // Next month filling days to fill a 6-week layout (42 days)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: formatDateString(nextDate)
      });
    }
    
    return days;
  };

  // Group schedules by YYYY-MM-DD
  const schedulesByDate = useMemo(() => {
    return allSchedules.reduce((acc: { [key: string]: any[] }, s) => {
      if (s.time) {
        const dateKey = s.time.split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(s);
      }
      return acc;
    }, {});
  }, [allSchedules]);

  // Retrieve sorted schedules for a specific date
  const getSchedulesForDate = (dateStr: string) => {
    const list = schedulesByDate[dateStr] || [];
    return [...list].sort((a, b) => a.time.localeCompare(b.time));
  };

  // Prefilled modal open helper
  const openNewScheduleModal = (prefilledDate?: string) => {
    if (prefilledDate) {
      setNewTime(`${prefilledDate}T18:00`);
    } else {
      const todayString = selectedDate || getTodayString();
      setNewTime(`${todayString}T18:00`);
    }
    setIsNewScheduleOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'priority' | 'other'>('priority');

  useEffect(() => {
    if (!user) return;
    const unsubReqs = firebaseService.subscribeToFriendRequests(user.uid, setFriendReqs);
    const unsubFriends = firebaseService.subscribeToFriends(user.uid, setFriends);
    const unsubSchedules = firebaseService.subscribeToUserSchedules(user.uid, setSchedules);
    return () => {
      unsubReqs();
      unsubFriends();
      unsubSchedules();
    };
  }, [user]);

  const handleSendFriendRequest = async () => {
    if (!friendEmail) return;
    if (!user || !profile) return;
    setIsSendingFriendReq(true);
    try {
      const res = await firebaseService.sendFriendRequest(user.uid, friendEmail, profile);
      showToast(res.message, res.success ? 'success' : 'error');
      if (res.success) setFriendEmail('');
    } catch (e) {
      showToast("Lỗi khi gửi yêu cầu kết giao đồng bọn.", "error");
    } finally {
      setIsSendingFriendReq(false);
    }
  };

  const handleAcceptFriend = async (req: any) => {
    await firebaseService.acceptFriendRequest(user.uid, req.uid, req, profile);
    showToast(`Đã nhận kết giao với ${req.displayName}!`, 'success');
  };

  const handleRejectFriend = async (reqUid: string) => {
    await firebaseService.rejectFriendRequest(user.uid, reqUid);
    showToast("Đã từ chối lời kết bạn.", "info");
  };

  const handleLogout = async () => {
    await firebaseService.logout();
  };

  const handleSaveProfile = async () => {
    let bName = '';
    if (bankId) {
      bName = ALL_BANKS.find(b => b.bin === bankId)?.name || '';
    }
    await firebaseService.updateUserProfile(profile.uid, {
      displayName: name,
      bankId,
      accountNumber: accNum,
      bankName: bName
    });
    showToast('Hồ sơ của bạn đã được lưu chuẩn chỉnh!', 'success');
  };

  const handleAddSchedule = async () => {
    if (!newTitle || !newTime) {
      showToast('Vui lòng nhập Tên cuộc chơi và Chọn Thời gian diễn ra nhé!', 'error');
      return;
    }
    try {
      await firebaseService.addUserSchedule(user.uid, {
        title: newTitle,
        time: newTime,
        location: newLocation || 'Không chỉ định',
        budget: Number(newBudget) || 0,
        note: newNote || ''
      });
      setNewTitle('');
      setNewTime('');
      setNewLocation('');
      setNewBudget('');
      setNewNote('');
      setIsNewScheduleOpen(false);
      showToast('Tạo lịch trình cuộc vui thành công!', 'success');
    } catch (e) {
      showToast('Lỗi khi thêm lịch trình.', 'error');
    }
  };

  const executeDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    try {
      if (scheduleToDelete.isGroup) {
        const db = (await import('firebase/database')).getDatabase();
        const ref = (await import('firebase/database')).ref;
        const remove = (await import('firebase/database')).remove;
        await remove(ref(db, `rooms/${scheduleToDelete.roomId}/plans/${scheduleToDelete.id}`));
        
        await firebaseService.writeChatMessage(scheduleToDelete.roomId, user, `đã huỷ kế hoạch chuyến đi: "${scheduleToDelete.title}"`, 'system');
        showToast('Đã dẹp bỏ kế hoạch nhóm thành công!', 'info');
      } else {
        await firebaseService.deleteUserSchedule(user.uid, scheduleToDelete.id);
        showToast('Đã dẹp bỏ cuộc hẹn ăn chơi này thành công!', 'info');
      }
    } catch (e) {
      showToast('Lỗi khi dẹp bỏ cuộc hẹn dạo chơi.', 'error');
    } finally {
      setScheduleToDelete(null);
    }
  };

  // Filter and Category setup
  const filteredRooms = myRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const priorityRooms = filteredRooms.filter(r => r.lastMessage || r.id === activeRoomId);
  const otherRooms = filteredRooms.filter(r => !r.lastMessage && r.id !== activeRoomId);
  const displayedRooms = filterCategory === 'priority' 
    ? (priorityRooms.length > 0 ? priorityRooms : filteredRooms)
    : (priorityRooms.length > 0 ? otherRooms : []);

  return (
    <div className="flex flex-col md:flex-row h-full bg-[var(--color-card)] relative z-10 w-full overflow-hidden">
      
      {/* Leftmost narrow sidebar - ONLY shown on PC (md and up) */}
      <div className="hidden md:flex w-16 bg-cta-gradient text-slate-300 flex-shrink-0 h-full flex-col items-center justify-between py-6 border-r border-white/10">
        {/* Top: Navigation & Branding */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white tracking-wider text-xl shadow-inner select-none">
            U
          </div>

          {/* Nav Icons */}
          <div className="flex flex-col gap-4 w-full px-2">
            <button 
              onClick={() => setActiveTab('messages')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative mx-auto focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${activeTab === 'messages' ? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 hover:text-white text-slate-300'}`}
              title="Nhóm / Tin nhắn"
              aria-label="Nhóm / Tin nhắn"
            >
              {activeTab === 'messages' ? <ChatDotsFill size={22} aria-hidden="true" /> : <ChatDots size={22} aria-hidden="true" />}
              {pendingRequests.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('schedules')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 relative mx-auto focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${activeTab === 'schedules' ? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 hover:text-white text-slate-300'}`}
              title="Lịch trình cuộc chơi"
              aria-label="Lịch trình cuộc chơi"
            >
              {activeTab === 'schedules' ? <Calendar2Fill size={22} aria-hidden="true" /> : <Calendar2 size={22} aria-hidden="true" />}
            </button>

            <button 
              onClick={() => setActiveTab('history')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${activeTab === 'history' ? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 hover:text-white text-slate-300'}`}
              title="Lịch sử quyết toán"
              aria-label="Lịch sử quyết toán"
            >
              <ClockHistory size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bottom: Settings / Profile (Avatar replaces logout button) */}
        <div className="flex flex-col gap-3 w-full px-2 pb-2 items-center">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-11 h-11 rounded-full overflow-hidden border-2 relative transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${
              activeTab === 'profile' 
                ? 'border-[var(--color-orange)] shadow-[0_0_10px_rgba(36,129,204,0.5)]' 
                : 'border-white/20'
            }`}
            title="Cài đặt cá nhân"
            aria-label="Cài đặt cá nhân"
          >
            <img 
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
              alt="Ảnh đại diện của bạn" 
              className="w-full h-full object-cover" 
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-[#0e1621]"></span>
          </button>
        </div>
      </div>


      {/* Main sidebar content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Search Area */}
        {activeTab === 'messages' && (
          <div className="bg-[var(--color-card-solid)] p-4 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 relative z-20">
            <div className="flex-1 mr-3.5 flex items-center bg-[var(--color-muted)] rounded-full px-4 h-10.5 group transition-all border border-transparent focus-within:border-[var(--color-accent)]/30 focus-within:bg-[var(--color-card-solid)]">
              <label htmlFor="searchQuery" className="sr-only">Tìm kiếm nhóm</label>
              <Search size={18} aria-hidden="true" className="mr-2 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--color-accent)] transition-colors" />
              <input 
                id="searchQuery"
                name="searchQuery"
                placeholder="Tìm kiếm nhóm…" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="bg-transparent border-none outline-none text-sm placeholder:text-[var(--color-muted-foreground)]/75 w-full text-[var(--color-foreground)]" 
              />
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button onClick={() => setIsJoinOpen(true)} className="w-10.5 h-10.5 flex items-center justify-center bg-[var(--color-muted)] rounded-full border border-[var(--color-border)] hover:bg-[var(--color-border)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all p-0 text-[var(--color-foreground)] cursor-pointer" aria-label="Xin vào nhóm" title="Xin vào nhóm"><BoxArrowInRight size={20} aria-hidden="true" /></button>
              <button onClick={() => setIsNewRoomOpen(true)} className="w-10.5 h-10.5 flex items-center justify-center bg-[var(--color-accent)] text-white rounded-full transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none p-0 shadow-[0_2px_8px_rgba(36,129,204,0.25)] hover:shadow-[0_4px_12px_rgba(36,129,204,0.35)] cursor-pointer" aria-label="Tạo nhóm mới" title="Tạo nhóm mới"><PlusLg size={20} aria-hidden="true" /></button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[var(--color-background)] relative">
          
          {activeTab === 'messages' && (
            <>
              {/* Category tabs like Zalo PC: 'Ưu tiên', 'Khác' */}
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-card-solid)] border-b border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)] select-none shrink-0 sticky top-0 z-10">
                <div className="flex gap-4 font-bold">
                  <button 
                    onClick={() => setFilterCategory('priority')} 
                    className={`pb-1 border-b-2 transition-all ${filterCategory === 'priority' ? 'border-[var(--color-orange)] text-[var(--color-foreground)]' : 'border-transparent hover:text-[var(--color-foreground)]'}`}
                  >
                    Ưu tiên
                  </button>
                  <button 
                    onClick={() => setFilterCategory('other')} 
                    className={`pb-1 border-b-2 transition-all ${filterCategory === 'other' ? 'border-[var(--color-orange)] text-[var(--color-foreground)]' : 'border-transparent hover:text-[var(--color-foreground)]'}`}
                  >
                    Khác
                  </button>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--color-foreground)] font-semibold">
                  <span>Phân loại</span>
                  <span className="text-[10px]">▼</span>
                </div>
              </div>

              {/* Banner Lịch Sử Quyết Toán */}
              <div className="px-3 pt-3 pb-1 shrink-0">
                <button
                  onClick={() => setActiveTab('history')}
                  className="w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-sm cursor-pointer group hover:-translate-y-0.5 min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <ClockHistory size={18} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-[var(--color-foreground)] truncate">Lịch sử quyết toán các nhóm</h4>
                      <p className="text-[10px] text-[var(--color-muted-foreground)] font-semibold mt-0.5 truncate">Tra cứu tổng nợ nần & VietQR nhận tiền</p>
                    </div>
                  </div>
                  <span className="text-emerald-500 group-hover:translate-x-1 transition-transform select-none pr-1 shrink-0">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </button>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="text-center p-8 mt-4 mx-4 rounded-[2rem] border border-[var(--color-border)] shadow-sm bg-[var(--color-card-solid)]">
                  <p className="text-[var(--color-muted-foreground)]">Chưa có nhóm nào khớp.</p>
                  <p className="text-sm mt-1">Bấm (+) phía trên để tạo mời hoặc xin vào.</p>
                </div>
              ) : displayedRooms.length === 0 ? (
                <div className="text-center p-8 mt-4 mx-4 rounded-[2rem] border border-[var(--color-border)] shadow-sm bg-[var(--color-card-solid)]">
                  <p className="text-[var(--color-muted-foreground)]">Không có mục nào trong danh mục "{filterCategory === 'priority' ? 'Ưu tiên' : 'Khác'}".</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-2">
                  {displayedRooms.map((r, i) => {
                    const bgGradients = [
                      'bg-gradient-to-tr from-blue-500 to-sky-400 text-white',
                      'bg-gradient-to-tr from-emerald-500 to-green-400 text-white',
                      'bg-gradient-to-tr from-amber-500 to-orange-400 text-white',
                      'bg-gradient-to-tr from-rose-500 to-pink-400 text-white',
                      'bg-gradient-to-tr from-violet-500 to-purple-400 text-white',
                    ];
                    const isActive = r.id === activeRoomId;
                    const accentClass = bgGradients[i % bgGradients.length];
                    let timeStr = '';
                    let lastMsgText = 'Chưa có tin nhắn…';
                    if (r.lastMessage) {
                       const d = new Date(r.lastMessage.timestamp);
                       timeStr = `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
                       if (r.lastMessage.type === 'settlement') {
                         lastMsgText = 'Đã quyết toán xong!';
                       } else {
                         lastMsgText = r.lastMessage.uid === user.uid ? `Bạn: ${r.lastMessage.text}` : `${r.lastMessage.displayName?.split(' ')?.pop() || 'Ai đó'}: ${r.lastMessage.text}`;
                       }
                    }
                    
                    return (
                      <button 
                        key={r.id} 
                        onClick={() => onSelectRoom(r.id)}
                        className={`w-full text-left p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${isActive ? 'border-[var(--color-border)] bg-[var(--color-card-solid)] shadow-sm' : 'border-transparent hover:border-[var(--color-border)] hover:bg-white/5'} mb-1`}
                      >
                        <div className={`w-11.5 h-11.5 rounded-full flex items-center justify-center font-heading text-base font-bold shrink-0 ${accentClass}`}>
                          {r.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-0.5">
                            <h3 className="font-bold text-[14px] truncate text-[var(--color-foreground)] pr-2">{r.name}</h3>
                            <span className="text-[10px] text-[var(--color-muted-foreground)] shrink-0 font-bold">{timeStr}</span>
                          </div>
                          <div className="flex items-center text-[12.5px] text-[var(--color-muted-foreground)] truncate">
                            <span className="truncate font-medium">{lastMsgText}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {pendingRequests.length > 0 && (
                <div className="mt-4 p-4 border-t border-[var(--color-border)]">
                   <h3 className="font-heading text-[var(--color-foreground)] text-lg mb-3">Yêu Cầu Chờ Duyệt</h3>
                   <div className="flex flex-col gap-2">
                     {pendingRequests.map((p: any) => (
                        <div key={p.roomId} className="p-4 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-2xl shadow-sm flex items-center justify-between">
                           <span className="font-medium text-sm">{p.roomName}</span>
                           <span className="text-xs text-[var(--color-muted-foreground)]">Đang đợi…</span>
                        </div>
                     ))}
                   </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'schedules' && (
            <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
                <div>
                  <h2 className="text-3xl font-heading text-[var(--color-foreground)] flex items-center gap-2">
                    <Calendar2 size={28} className="text-[var(--color-accent)] animate-pulse" /> Lịch Trình Các Cuộc Chơi
                  </h2>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1 font-medium">
                    Quản lý và lên lịch các cuộc họp mặt, chuyến du hí dã ngoại vui nhộn cùng nhóm bạn
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  {/* View switcher */}
                  <div className="bg-[var(--color-muted)] p-0.5 rounded-full flex border border-[var(--color-border)]">
                    <button
                      onClick={() => setScheduleViewMode('calendar')}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        scheduleViewMode === 'calendar'
                          ? 'bg-[var(--color-accent)] text-white shadow-sm'
                          : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                      }`}
                      title="Chế độ xem Lịch"
                    >
                      <Calendar size={18} />
                    </button>
                    <button
                      onClick={() => setScheduleViewMode('list')}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        scheduleViewMode === 'list'
                          ? 'bg-[var(--color-accent)] text-white shadow-sm'
                          : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                      }`}
                      title="Chế độ xem Danh sách"
                    >
                      <List size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => openNewScheduleModal()} 
                    className="candy-btn flex items-center justify-center gap-2 text-sm shrink-0"
                  >
                    <PlusLg size={16} /> Lên Kế Hoạch
                  </button>
                </div>
              </div>

              {scheduleViewMode === 'list' ? (
                // LIST VIEW MODE
                allSchedules.length === 0 ? (
                  <div className="text-center py-16 px-6 bg-[var(--color-card-solid)] rounded-[2.5rem] border border-[var(--color-border)] shadow-sm flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)]">
                      <Calendar2 size={32} />
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-lg text-[var(--color-foreground)]">Chưa có kế hoạch ăn chơi nào!</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1 max-w-sm mx-auto">
                        Đừng đợi ngày mai, hãy bắt đầu lên lịch các cung đường phượt, bữa nhậu hay dã ngoại ngay hôm nay!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSchedules.map((s: any) => {
                      const planDate = new Date(s.time);
                      const isUpcoming = planDate.getTime() >= Date.now();
                      
                      // Format beautifully
                      const formattedDate = planDate.toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      });
                      const formattedTime = planDate.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      // Countdown text or label
                      let labelText = '';
                      if (isUpcoming) {
                        const diffTime = Math.abs(planDate.getTime() - Date.now());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        labelText = diffDays === 1 ? 'Ngày mai' : `Còn ${diffDays} ngày`;
                      } else {
                        labelText = 'Đã diễn ra';
                      }

                      const roomObj = s.isGroup ? myRooms.find((r: any) => r.id === s.roomId) : null;
                      const isRoomOwner = roomObj?.metadata?.ownerId === user.uid;
                      const canDelete = !s.isGroup || isRoomOwner || s.creatorUid === user.uid;

                      return (
                        <div 
                          key={s.id} 
                          onClick={() => {
                            if (s.isGroup) {
                              onSelectRoom(s.roomId);
                              setActiveTab('messages');
                            }
                          }}
                          className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 p-6 flex flex-col justify-between ${
                            s.isGroup ? 'cursor-pointer' : ''
                          } ${
                            isUpcoming 
                              ? 'bg-[var(--color-card-solid)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:shadow-md' 
                              : 'bg-[var(--color-muted)]/50 border-[var(--color-border)]/70 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {/* Top corner status bubble */}
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            {s.isGroup && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-100/90 text-indigo-800 flex items-center gap-1">
                                <People size={10} />
                                Nhóm: {s.roomName}
                              </span>
                            )}
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                              isUpcoming 
                                ? 'bg-emerald-100/90 text-emerald-800' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {labelText}
                            </span>
                            {canDelete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScheduleToDelete(s);
                                }}
                                className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-red-500 opacity-100 group-hover:opacity-100 transition-opacity"
                                title="Xóa lịch trình"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <div className="flex-1 pr-16 mb-4">
                            <h3 className="font-heading font-medium text-lg leading-snug text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-accent)]">
                              {s.title}
                            </h3>
                            
                            {s.note ? (
                              <p className="text-xs text-[var(--color-muted-foreground)] mt-2 line-clamp-3 italic whitespace-pre-line bg-[var(--color-muted)]/45 p-2.5 rounded-xl border border-[var(--color-border)]/40">
                                "{s.note}"
                              </p>
                            ) : (
                              <p className="text-xs text-[var(--color-muted-foreground)]/70 mt-2 italic">
                                Chưa viết ghi chú nào cho hoạt động này.
                              </p>
                            )}

                            {s.isGroup && (
                              <div className="text-[10.5px] font-bold text-[var(--color-muted-foreground)] mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-xl border border-indigo-100/30 w-fit">
                                <span>Lập bởi: <b>{s.createdBy}</b></span>
                                <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                                <span>Đã tham gia: <b>{Object.keys(s.votes || {}).length}</b></span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-[var(--color-border)]/80 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)] font-medium">
                              <Clock size={14} className="text-[var(--color-accent)]" />
                              <span>{formattedTime} • {formattedDate}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)] font-medium truncate max-w-[65%]">
                                <MapPin size={14} className="text-red-500 shrink-0" />
                                <span className="truncate">{s.location || 'Bất kỳ đâu'}</span>
                              </div>

                              {s.budget > 0 && (
                                <div className="flex items-center gap-1 text-[11px] shrink-0 font-bold text-white bg-[var(--color-accent)] px-2.5 py-0.5 rounded-full shadow-sm">
                                  <span>{formatVND(s.budget)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                // CALENDAR VIEW MODE
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Left: Monthly Calendar */}
                  <div className="flex-1 min-w-0">
                    {/* Month selector */}
                    <div className="flex items-center justify-between gap-4 mb-4 bg-[var(--color-card-solid)] border border-[var(--color-border)] p-3.5 rounded-[2rem] shadow-sm">
                      <div className="flex items-center gap-2 pl-1">
                        <Calendar2 size={20} className="text-[var(--color-accent)]" />
                        <h3 className="font-heading font-bold text-[16px] text-[var(--color-foreground)] capitalize">
                          {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={prevMonth}
                          className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:bg-[var(--color-muted)] text-[var(--color-foreground)] transition-colors cursor-pointer"
                          title="Tháng trước"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button 
                          onClick={goToToday}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-[var(--color-muted)] text-[var(--color-accent)] transition-colors cursor-pointer"
                        >
                          Hôm nay
                        </button>
                        <button 
                          onClick={nextMonth}
                          className="w-8.5 h-8.5 rounded-full flex items-center justify-center hover:bg-[var(--color-muted)] text-[var(--color-foreground)] transition-colors cursor-pointer"
                          title="Tháng sau"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-[2rem] p-4.5 shadow-sm">
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                          <div key={d} className="text-center font-bold text-xs py-2 text-[var(--color-muted-foreground)] border-b border-[var(--color-border)] select-none">
                            {d}
                          </div>
                        ))}
                        
                        {generateCalendarDays(currentMonth).map(day => {
                          const daySchedules = getSchedulesForDate(day.dateString);
                          const isSelected = day.dateString === selectedDate;
                          const isToday = day.dateString === getTodayString();
                          const hasSchedules = daySchedules.length > 0;
                          
                          return (
                            <div
                              key={day.dateString}
                              onClick={() => setSelectedDate(day.dateString)}
                              className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                                day.isCurrentMonth
                                  ? 'bg-[var(--color-card-solid)] border-[var(--color-border)] text-[var(--color-foreground)]'
                                  : 'bg-[var(--color-muted)]/20 border-[var(--color-border)]/30 text-[var(--color-muted-foreground)]/40'
                              } ${
                                isSelected
                                  ? 'ring-2 ring-[var(--color-accent)] border-transparent shadow-[0_4px_12px_rgba(36,129,204,0.12)] bg-[var(--color-accent)]/5'
                                  : 'hover:border-[var(--color-accent)]/30 hover:bg-white/5'
                              } ${
                                isToday
                                  ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                                  : ''
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className={`text-[12.5px] sm:text-sm font-bold ${
                                  isToday
                                    ? 'w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm text-xs'
                                    : isSelected
                                      ? 'text-[var(--color-accent)] font-extrabold'
                                      : ''
                                }`}>
                                  {day.date.getDate()}
                                </span>
                                {hasSchedules && (
                                  <span className="text-[10px] font-extrabold text-white bg-[var(--color-accent)] px-1.5 py-0.5 rounded-full sm:hidden shrink-0 min-w-4 text-center">
                                    {daySchedules.length}
                                  </span>
                                )}
                              </div>
                              
                              {/* Desktop labels */}
                              <div className="hidden sm:flex flex-col gap-1 mt-1.5 overflow-hidden w-full">
                                {daySchedules.slice(0, 2).map((s: any) => {
                                  const planDate = new Date(s.time);
                                  const timeStr = planDate.toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                  return (
                                    <div
                                      key={s.id}
                                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full ${
                                        s.isGroup 
                                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10' 
                                          : 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                                      }`}
                                      title={`${s.isGroup ? `[${s.roomName}] ` : ''}${s.title}`}
                                    >
                                      {timeStr} {s.title}
                                    </div>
                                  );
                                })}
                                {daySchedules.length > 2 && (
                                  <div className="text-[9px] font-bold text-[var(--color-muted-foreground)] text-right pr-0.5">
                                    +{daySchedules.length - 2} kèo
                                  </div>
                                )}
                              </div>
                              
                              {/* Mobile dot indicator */}
                              {hasSchedules && (
                                <div className="sm:hidden flex justify-center gap-0.5 mt-1 select-none">
                                  {daySchedules.slice(0, 3).map((s: any) => (
                                    <span 
                                      key={s.id} 
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        s.isGroup ? 'bg-indigo-500' : 'bg-[var(--color-accent)]'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Selected Date Details */}
                  <div className="w-full lg:w-[360px] shrink-0">
                    {(() => {
                      const selectedDateSchedules = getSchedulesForDate(selectedDate);
                      const parsedSelectedDate = new Date(selectedDate);
                      const formattedSelectedDate = isNaN(parsedSelectedDate.getTime()) 
                        ? 'Ngày không xác định' 
                        : parsedSelectedDate.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                      
                      return (
                        <div className="bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-[2rem] p-5 shadow-sm flex flex-col h-full justify-between min-h-[300px]">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-[var(--color-border)]">
                              <div>
                                <h4 className="font-heading font-bold text-[11px] text-[var(--color-muted-foreground)] uppercase tracking-wider">Lịch trình ngày</h4>
                                <p className="font-bold text-[14px] text-[var(--color-foreground)] capitalize mt-0.5">{formattedSelectedDate}</p>
                              </div>
                              <button 
                                onClick={() => openNewScheduleModal(selectedDate)}
                                className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] text-[var(--color-accent)] flex items-center justify-center hover:text-white transition-all scale-105 active:scale-95 cursor-pointer shrink-0"
                                title="Lên kế hoạch cho ngày này"
                              >
                                <PlusLg size={16} />
                              </button>
                            </div>

                            {selectedDateSchedules.length === 0 ? (
                              <div className="text-center py-10 px-4 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)]">
                                  <Sparkles size={20} className="text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-xs text-[var(--color-muted-foreground)] font-bold">Chưa có kèo nào trong ngày này!</p>
                                  <button 
                                    on                              <div className="flex flex-col gap-3 max-h-[350px] lg:max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
                                {selectedDateSchedules.map((s: any) => {
                                  const planDate = new Date(s.time);
                                  const timeStr = planDate.toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                  const isUpcoming = planDate.getTime() >= Date.now();
                                  
                                  const roomObj = s.isGroup ? myRooms.find((r: any) => r.id === s.roomId) : null;
                                  const isRoomOwner = roomObj?.metadata?.ownerId === user.uid;
                                  const canDelete = !s.isGroup || isRoomOwner || s.creatorUid === user.uid;

                                  return (
                                    <div 
                                      key={s.id} 
                                      onClick={() => {
                                        if (s.isGroup) {
                                          onSelectRoom(s.roomId);
                                          setActiveTab('messages');
                                        }
                                      }}
                                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 relative overflow-hidden group ${
                                        s.isGroup ? 'cursor-pointer' : ''
                                      } ${
                                        isUpcoming 
                                          ? 'bg-[var(--color-background)] border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:shadow-sm' 
                                          : 'bg-[var(--color-muted)]/40 border-[var(--color-border)]/50 opacity-80'
                                      }`}
                                    >
                                      {s.isGroup && (
                                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100/90 text-indigo-800 flex items-center gap-1 w-fit">
                                          <People size={9} />
                                          Nhóm: {s.roomName}
                                        </span>
                                      )}
                                      
                                      {canDelete && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setScheduleToDelete(s);
                                          }}
                                          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-rose-500/10 text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors"
                                          title="Hủy lịch trình"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}

                                      <div className="pr-6">
                                        <h5 className="font-bold text-[14px] text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                                          {s.title}
                                        </h5>
                                        {s.note && (
                                          <p className="text-[11.5px] text-[var(--color-muted-foreground)] bg-[var(--color-card)]/50 p-2.5 rounded-xl border border-[var(--color-border)]/45 mt-2 italic whitespace-pre-line leading-relaxed">
                                            "{s.note}"
                                          </p>
                                        )}
                                      </div>

                                      {s.isGroup && (
                                        <div className="text-[10px] font-bold text-[var(--color-muted-foreground)] mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                          <span>Lập bởi: <b>{s.createdBy}</b></span>
                                          <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                                          <span>Đã tham gia: <b>{Object.keys(s.votes || {}).length}</b></span>
                                        </div>
                                      )}

                                      <div className="flex flex-col gap-1.5 mt-1.5 pt-2.5 border-t border-[var(--color-border)]/40 text-[11px] text-[var(--color-muted-foreground)] font-semibold">
                                        <div className="flex items-center gap-1.5">
                                          <Clock size={12} className="text-[var(--color-accent)] shrink-0" />
                                          <span>Bắt đầu lúc: {timeStr}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                                            <MapPin size={12} className="text-red-500 shrink-0" />
                                            <span className="truncate">{s.location || 'Địa điểm linh hoạt'}</span>
                                          </div>
                                          {s.budget > 0 && (
                                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border border-emerald-500/20">
                                              {formatVND(s.budget)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>ed-full text-[10px] font-extrabold shrink-0 border border-emerald-500/20">
                                              {formatVND(s.budget)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          {selectedDateSchedules.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[var(--color-muted-foreground)] bg-[var(--color-muted)]/20 p-3 rounded-2xl shrink-0">
                              <span>Tổng chi ngày này:</span>
                              <span className="text-[var(--color-accent)] text-sm">
                                {formatVND(
                                  selectedDateSchedules.reduce((sum, s) => sum + (s.budget || 0), 0)
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 max-w-4xl mx-auto w-full bg-transparent">
              <div className="border-b border-[var(--color-border)] pb-4 mb-6">
                <h2 className="text-3xl font-heading text-[var(--color-foreground)] flex items-center gap-2">
                  <ClockHistory size={28} className="text-[var(--color-accent)] animate-pulse" /> Lịch Sử Quyết Toán
                </h2>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1 font-medium">
                  Xem lại toàn bộ lịch sử chốt hóa đơn, nợ nần và giao dịch chuyển khoản VietQR của các nhóm
                </p>
              </div>

              {allSettledBills.length === 0 ? (
                <div className="text-center py-16 px-6 bg-[var(--color-card-solid)] rounded-[2.5rem] border border-[var(--color-border)] shadow-sm flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)]">
                    <ClockHistory size={32} />
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-lg text-[var(--color-foreground)]">Chưa có lịch sử quyết toán</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1 max-w-sm mx-auto font-medium">
                      Khi có hóa đơn được quyết toán trong các phòng chat, lịch sử sẽ xuất hiện tại đây.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto no-scrollbar">
                  {allSettledBills.map((bill: any) => {
                    const totalExpensesCount = bill.expenses ? Object.keys(bill.expenses).length : 0;
                    return (
                      <button 
                        key={bill.id}
                        onClick={() => setSelectedHistoryBill(bill)}
                        className="w-full text-left group bg-[var(--color-card-solid)] p-5 rounded-[2rem] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 text-white flex items-center justify-center font-heading text-base font-bold shrink-0 shadow-sm">
                            {bill.roomName.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[15px] text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                              {bill.roomName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-[var(--color-muted-foreground)] font-semibold">
                              <span>Chốt bởi: <b className="text-[var(--color-foreground)]">{bill.settledBy || 'Ẩn danh'}</b></span>
                              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                              <span>{bill.date}</span>
                              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
                              <span className="bg-[var(--color-orange-light)] text-[var(--color-accent)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">{totalExpensesCount} khoản chi</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-border)]/50">
                          <div className="text-right flex flex-col">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-foreground)]">Tổng tiền</span>
                            <span className="font-heading font-extrabold text-base text-[var(--color-accent)] mt-0.5">
                              {formatVND(bill.totalAmount)}
                            </span>
                          </div>
                          
                          <span className="text-xs font-bold text-[var(--color-accent)] group-hover:translate-x-1 transition-transform flex items-center gap-1 select-none">
                            Xem chi tiết <ArrowRight size={14} aria-hidden="true" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-6 max-w-2xl mx-auto w-full">
              <h2 className="text-3xl font-heading text-[var(--color-foreground)] mb-6 flex items-center gap-2">
                <UserIcon size={28} /> Cá Nhân
              </h2>
              
              <div className="glass-card p-6 mb-6 flex items-center gap-4">
                 <div className="w-16 h-16 rounded-[1rem] bg-[var(--color-muted)] overflow-hidden shrink-0">
                    <img src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt="avt" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col">
                   <h3 className="font-medium text-lg text-[var(--color-foreground)]">{profile?.displayName}</h3>
                   <span className="text-sm text-[var(--color-muted-foreground)]">{profile?.email}</span>
                 </div>
              </div>

              {/* iOS / Telegram style Theme Switcher */}
              <div className="glass-card p-6 mb-6 flex items-center justify-between border border-[var(--color-border)]">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-foreground)] shrink-0">
                     {isDark ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
                   </div>
                   <div>
                     <h4 className="font-bold text-[var(--color-foreground)] text-sm">Giao diện tối</h4>
                     <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Chuyển sang tông màu tối sang trọng</p>
                   </div>
                 </div>
                 <button 
                   onClick={toggleTheme}
                   className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none flex items-center cursor-pointer ${
                     isDark ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                   }`}
                   aria-label="Toggle Theme"
                 >
                   <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-all duration-200"></span>
                 </button>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="profile-name" className="block text-sm text-[var(--color-muted-foreground)] mb-2">Tên hiển thị</label>
                  <input id="profile-name" name="displayName" autoComplete="name" spellCheck={false} value={name} onChange={e => setName(e.target.value)} className="candy-input w-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" />
                </div>
                <div>
                  <label htmlFor="profile-bank" className="block text-sm text-[var(--color-muted-foreground)] mb-2">Ngân hàng (Để nhận tiền trả)</label>
                  <select id="profile-bank" name="bankId" autoComplete="off" value={bankId} onChange={e => setBankId(e.target.value)} className="candy-input w-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" style={{ webkitAppearance: 'none' }}>
                    <option value="">-- Chọn ngân hàng --</option>
                    {ALL_BANKS.map(b => <option key={b.bin} value={b.bin}>{b.code} - {b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-account" className="block text-sm text-[var(--color-muted-foreground)] mb-2">Số Tài Khoản</label>
                  <input id="profile-account" name="accountNumber" autoComplete="off" inputMode="numeric" spellCheck={false} value={accNum} onChange={e => setAccNum(e.target.value)} className="candy-input w-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" />
                </div>
                <div className="flex flex-col gap-3 mt-4 border-t border-[var(--color-border)] pt-6">
                  <button onClick={handleSaveProfile} className="candy-btn w-full text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Lưu Hồ Sơ</button>
                  <button onClick={handleLogout} className="candy-btn candy-btn-secondary w-full text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center justify-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
                    <LogOut size={16} aria-hidden="true"/> Đăng Xuất
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation - Mobile Only (hidden on md and above) */}
        <div className="flex md:hidden items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-card-solid)]/90 backdrop-blur-md shrink-0 pt-3 pb-5 px-2 z-20 relative">
          <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center gap-1 w-16 transition-all cursor-pointer ${activeTab === 'messages' ? 'text-[var(--color-accent)] scale-105' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}>
            <MessageCircle size={22} className={activeTab === 'messages' ? "fill-current text-[var(--color-accent)]" : ""} />
            <span className="text-[10.5px] font-bold mt-1">Nhóm</span>
          </button>
          <button onClick={() => setActiveTab('schedules')} className={`flex flex-col items-center gap-1 w-16 transition-all cursor-pointer ${activeTab === 'schedules' ? 'text-[var(--color-accent)] scale-105' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}>
            {activeTab === 'schedules' ? <Calendar2Fill size={22} className="text-[var(--color-accent)]" /> : <Calendar2 size={22} />}
            <span className="text-[10.5px] font-bold mt-1">Lịch trình</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 w-16 transition-all cursor-pointer ${activeTab === 'history' ? 'text-[var(--color-accent)] scale-105' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}>
            <Clock size={22} className={activeTab === 'history' ? "fill-current text-[var(--color-accent)] animate-none" : ""} />
            <span className="text-[10px] font-bold mt-1 text-center whitespace-nowrap">L/s Quyết toán</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 w-16 transition-all cursor-pointer ${activeTab === 'profile' ? 'text-[var(--color-accent)] scale-105' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}>
            <UserIcon size={22} className={activeTab === 'profile' ? "fill-current text-[var(--color-accent)]" : ""} />
            <span className="text-[10.5px] font-bold mt-1">Cá nhân</span>
          </button>
        </div>

      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div 
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] max-w-sm w-[90%] flex items-center gap-3 p-4 rounded-xl border-2 shadow-xl bg-[var(--color-card)] transition-all duration-300 pointer-events-none" 
          style={{
            borderColor: toast.type === 'success' ? 'var(--color-green)' : toast.type === 'error' ? 'var(--color-orange)' : 'var(--color-blue)',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)'
          }}
        >
          <div className="shrink-0 flex items-center justify-center">
            {toast.type === 'success' && <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" aria-hidden="true" />}
            {toast.type === 'error' && <AlertTriangle className="w-5.5 h-5.5 text-amber-500" aria-hidden="true" />}
            {toast.type === 'info' && <Info className="w-5.5 h-5.5 text-sky-500" aria-hidden="true" />}
          </div>
          <div className="text-xs font-bold text-[var(--color-foreground)] leading-tight">
            {toast.message}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={executeDeleteSchedule}
        title="Dẹp Cuộc Hẹn?"
        message="Anh em đã thống nhất hủy kèo này rồi đúng không? Lịch trình này sẽ bị bôi xóa vĩnh viễn!"
        confirmText="Duyệt Hủy Lịch"
        isDanger={true}
      />

      <NewRoomModal isOpen={isNewRoomOpen} onClose={() => setIsNewRoomOpen(false)} uid={user.uid} profile={profile} showToast={showToast} />
      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} uid={user.uid} profile={profile} showToast={showToast} />

      {/* New Play Schedule Modal */}
      <Modal isOpen={isNewScheduleOpen} onClose={() => setIsNewScheduleOpen(false)} title="Lên Kế Hoạch Cuộc Chơi">
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label htmlFor="schedule-title" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5">Tên cuộc chơi là gì? <span className="text-red-500">*</span></label>
            <input 
              id="schedule-title"
              name="scheduleTitle"
              autoComplete="off"
              placeholder="VD: Đi phượt Ba Vì, Lẩu sắng cuối tuần" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              className="candy-input w-full text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>

          <div>
            <label htmlFor="schedule-time" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5">Thời gian bắt đầu <span className="text-red-500">*</span></label>
            <input 
              id="schedule-time"
              name="scheduleTime"
              type="datetime-local" 
              value={newTime} 
              onChange={e => setNewTime(e.target.value)} 
              className="candy-input w-full text-sm font-semibold bg-[var(--color-background)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>

          <div>
            <label htmlFor="schedule-location" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5">Địa điểm tụ họp</label>
            <input 
              id="schedule-location"
              name="scheduleLocation"
              autoComplete="off"
              placeholder="VD: Cổng Công viên Thống Nhất" 
              value={newLocation} 
              onChange={e => setNewLocation(e.target.value)} 
              className="candy-input w-full text-sm focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>

          <div>
            <label htmlFor="schedule-budget" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5 font-semibold">Chi phí dự kiến (VNĐ)</label>
            <input 
              id="schedule-budget"
              name="scheduleBudget"
              autoComplete="off"
              inputMode="numeric"
              type="number"
              placeholder="0" 
              value={newBudget} 
              onChange={e => setNewBudget(e.target.value)} 
              className="candy-input w-full text-sm text-[var(--color-accent)] font-bold text-right focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
            {Number(newBudget) > 0 && (
              <span className="block text-right text-[11px] font-bold text-emerald-600 mt-1">
                {formatVND(Number(newBudget))}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="schedule-note" className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5">Ghi chú cuộc hẹn / Ý tưởng ăn chơi</label>
            <textarea 
              id="schedule-note"
              name="scheduleNote"
              placeholder="Ăn mồi ngon, hát hò bét nhè, rạp phim…" 
              value={newNote} 
              onChange={e => setNewNote(e.target.value)} 
              className="candy-input w-full text-sm min-h-[80px] py-2 resize-none animate-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            />
          </div>

          <button onClick={handleAddSchedule} className="candy-btn w-full mt-4 text-sm py-2.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
            Lên Lịch Ngay
          </button>
        </div>
      </Modal>

      {selectedHistoryBill && (
        <Modal 
          isOpen={!!selectedHistoryBill} 
          onClose={() => setSelectedHistoryBill(null)} 
          title="Chi Tiết Quyết Toán"
        >
          <HistoryBillDetailModal 
            bill={selectedHistoryBill} 
            onClose={() => setSelectedHistoryBill(null)} 
            getDisplayName={(uid: string) => getDisplayNameForBill(uid, selectedHistoryBill)}
            setQrTx={setHistoryQrTx}
          />
        </Modal>
      )}

      {historyQrTx && (
        <HistoryQRModal 
          tx={historyQrTx.tx} 
          bill={historyQrTx.bill}
          onClose={() => setHistoryQrTx(null)} 
          getDisplayName={(uid: string) => getDisplayNameForBill(uid, historyQrTx.bill)}
          members={getRoomMembers(historyQrTx.bill)}
        />
      )}
    </div>
  );
}

function NewRoomModal({ isOpen, onClose, uid, profile }: any) {
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleCreate = async () => {
    if (!name) return;
    setErrorMsg('');
    try {
      await firebaseService.createRoom(uid, name, profile || {});
      setName('');
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mở Nhóm Mới">
      <div className="flex flex-col gap-6">
        <div>
           <label htmlFor="newroom-name" className="block text-sm text-[var(--color-muted-foreground)] mb-2">Tên Nhóm / Tên sổ chi tiêu</label>
           <input id="newroom-name" name="roomName" autoComplete="off" placeholder="VD: Đà Lạt 2024 hoặc Cá nhân" value={name} onChange={e => setName(e.target.value)} className="candy-input w-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" />
           <p className="text-xs text-[var(--color-muted-foreground)] mt-2 italic">Mẹo: Bạn hoàn toàn có thể tạo nhóm 1 mình để tự quản lý chi tiêu cá nhân.</p>
        </div>
        {errorMsg && (
           <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-sm">
              Lỗi: {errorMsg}
           </div>
        )}
        <button onClick={handleCreate} className="candy-btn w-full mt-2 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Duyệt Nhóm!</button>
      </div>
    </Modal>
  );
}

function JoinRoomModal({ isOpen, onClose, uid, profile, showToast }: any) {
  const [roomId, setRoomId] = useState('');
  
  const handleJoin = async () => {
    if (!roomId) return;
    try {
      await firebaseService.requestJoinRoom(uid, roomId, profile || {});
      setRoomId('');
      if (showToast) {
        showToast('Đã gửi yêu cầu gõ cửa, hãy đợi chủ phòng mở cửa nhé!', 'success');
      }
      onClose();
    } catch(e: any) {
      if (showToast) {
        showToast(e.message || 'Lỗi gửi yêu cầu', 'error');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xin Vào Nhóm">
      <div className="flex flex-col gap-6">
        <div>
           <label htmlFor="joinroom-id" className="block text-sm text-[var(--color-muted-foreground)] mb-2">Mã Cửa Nhóm</label>
           <input id="joinroom-id" name="roomId" autoComplete="off" placeholder="Gõ mã vào đây…" value={roomId} onChange={e => setRoomId(e.target.value)} className="candy-input text-lg text-center w-full focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" />
        </div>
        <button onClick={handleJoin} className="candy-btn w-full mt-2 text-lg focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Gõ Cửa Nhóm</button>
      </div>
    </Modal>
  );
}

function HistoryBillDetailModal({ bill, onClose, getDisplayName, setQrTx }: any) {
  const transactions = (bill.transactions || []).filter((t: any) => t && typeof t === 'object');
  const expenses = bill.expenses ? Object.values(bill.expenses).filter((e: any) => e && typeof e === 'object') : [];

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="glass-card p-6 text-center overflow-hidden bg-[var(--color-muted)] relative border border-[var(--color-border)] rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent pointer-events-none"></div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">Tổng tiền quyết toán</div>
        <div className="text-3xl font-extrabold text-[var(--color-accent)] drop-shadow-sm">{formatVND(bill.totalAmount)}</div>
        <div className="text-[10px] font-semibold text-[var(--color-muted-foreground)] mt-2">
          Nhóm: <span className="text-[var(--color-foreground)]">{bill.roomName}</span> • Chốt bởi: <span className="text-[var(--color-foreground)]">{bill.settledBy}</span> • {bill.date}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
          <CheckSquare size={16} className="text-[var(--color-quaternary)]" aria-hidden="true" /> Giao dịch thanh toán (Ai nợ ai?)
        </h3>
        
        {transactions.length === 0 ? (
          <div className="text-center p-6 bg-[var(--color-muted)]/50 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-muted-foreground)]">
             Không có giao dịch nợ nần nào.
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {transactions.map((t: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center gap-3 bg-[var(--color-card-solid)] p-3 rounded-xl border border-[var(--color-border)] hover:-translate-y-0.5 transition-all">
                <div className="flex-1 flex items-center gap-1.5 text-xs font-bold truncate">
                  <span className="text-[var(--color-muted-foreground)] truncate max-w-[40%]">{getDisplayName(t.from)}</span>
                  <div className="flex items-center text-[var(--color-quaternary)] px-1 shrink-0">
                    <ArrowRight size={12} strokeWidth={3} aria-hidden="true"/>
                  </div>
                  <span className="text-[var(--color-foreground)] truncate max-w-[40%]">{getDisplayName(t.to)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-2.5 py-1 rounded-lg">
                    {formatVND(t.amount)}
                  </span>
                  <button 
                    onClick={() => setQrTx({ tx: t, bill })}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white transition-colors shadow-sm bg-[var(--color-card-solid)] text-[var(--color-foreground)] shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" 
                    title="Mã QR Chuyển Khoản"
                    aria-label="Mã QR Chuyển Khoản"
                  >
                    <QrCode size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-[var(--color-accent)]" aria-hidden="true" /> Các khoản chi tiêu đã chốt ({expenses.length})
        </h3>
        
        {expenses.length === 0 ? (
          <div className="text-center p-6 bg-[var(--color-muted)]/50 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-muted-foreground)]">
             Không có khoản chi nào trong hóa đơn này.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {expenses.map((e: any, idx: number) => (
              <div key={e.id || idx} className="p-3 bg-[var(--color-card-solid)] border border-[var(--color-border)] rounded-xl flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[var(--color-foreground)] truncate">{e.itemName}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted-foreground)] font-semibold mt-1">
                    <span>Trả: {e.payers ? 'Nhiều người' : getDisplayName(e.payer)}</span>
                    <span>•</span>
                    <span>{new Date(e.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <span className="font-bold text-xs text-[var(--color-accent)] shrink-0">
                  {formatVND(e.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onClose} className="candy-btn candy-btn-secondary w-full mt-4 py-2.5 text-xs bg-[var(--color-card-solid)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Đóng Cửa Sổ</button>
    </div>
  );
}

function HistoryQRModal({ tx, bill, onClose, getDisplayName, members }: any) {
  const receiver = members.find((m:any) => m.uid === tx.to);
  const infoMissing = !receiver || !receiver.bankId || !receiver.accountNumber;

  const [isEditing, setIsEditing] = useState(infoMissing);
  const [bankId, setBankId] = useState(receiver?.bankId || '');
  const [accNum, setAccNum] = useState(receiver?.accountNumber || '');
  const [isSaving, setIsSaving] = useState(false);

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

      await update(ref(db, `rooms/${bill.roomId}/customMembersBanks/${tx.to}`), {
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

  return (
    <Modal isOpen={true} onClose={onClose} title="Chuyển Khoản VietQR">
      <div className="flex flex-col items-center text-center">
         <div className="text-xs font-bold mb-6 mt-4 w-full">
           <div className="flex justify-between border-b border-[var(--color-border)] py-2.5">
             <span className="text-[var(--color-muted-foreground)] ">Từ:</span> <span className="text-[var(--color-foreground)]">{getDisplayName(tx.from)}</span>
           </div>
           <div className="flex justify-between border-b border-[var(--color-border)] py-2.5">
             <span className="text-[var(--color-muted-foreground)] ">Đến:</span> <span className="text-[var(--color-foreground)]">{getDisplayName(tx.to)}</span>
           </div>
           <div className="bg-[var(--color-card-solid)] border border-[var(--color-border)] inline-block mt-4 px-6 py-3 rounded-2xl shadow-sm">
             <span className="text-[var(--color-accent)] text-2xl font-bold">{formatVND(tx.amount)}</span>
           </div>
         </div>
         
         {isEditing ? (
           <div className="w-full bg-[var(--color-muted)] p-4.5 rounded-2xl border border-[var(--color-border)] text-left flex flex-col gap-3.5 mt-1">
             <h4 className="text-[11px] font-bold text-[var(--color-foreground)] mb-0.5">Cài Đặt / Override Tài Khoản Nhận</h4>
             
             <div>
               <label htmlFor="history-bank" className="block text-[9px] font-bold text-[var(--color-muted-foreground)] mb-1 uppercase">Ngân hàng</label>
               <select 
                 id="history-bank"
                 name="bankId"
                 autoComplete="off"
                 value={bankId} 
                 onChange={e => setBankId(e.target.value)} 
                 className="candy-input w-full py-2 h-[42px] text-xs bg-[var(--card-solid)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
               >
                 <option value="">-- Chọn ngân hàng --</option>
                 {ALL_BANKS.map(b => (
                   <option key={b.bin} value={b.bin}>{b.code} - {b.name}</option>
                 ))}
               </select>
             </div>

             <div>
               <label htmlFor="history-acc" className="block text-[9px] font-bold text-[var(--color-muted-foreground)] mb-1 uppercase">Số tài khoản nhận</label>
               <input 
                 id="history-acc"
                 name="accountNumber"
                 autoComplete="off"
                 inputMode="numeric"
                 type="text" 
                 placeholder="Nhập số thẻ hoặc tài khoản nhận…" 
                 value={accNum} 
                 onChange={e => setAccNum(e.target.value.replace(/[^0-9]/g, ''))} 
                 className="candy-input w-full font-bold py-2 text-xs focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
               />
             </div>

             <div className="flex gap-2 mt-1">
               <button 
                 onClick={handleSaveBank} 
                 disabled={isSaving || !bankId || !accNum.trim()} 
                 className="candy-btn text-[11px] flex-1 min-h-[36px] items-center justify-center p-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
               >
                 {isSaving ? "Đang lưu..." : "Lưu & Hiện QR"}
               </button>
               {!infoMissing && (
                 <button 
                   onClick={() => setIsEditing(false)} 
                   className="candy-btn candy-btn-secondary text-[11px] flex-1 min-h-[36px] bg-[var(--color-card-solid)] p-0 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                 >
                   Hủy sửa
                 </button>
               )}
             </div>
           </div>
         ) : (
           <>
             <div className="bg-[var(--color-card-solid)] p-3 rounded-2xl mt-1 border border-[var(--color-border)] shadow-sm relative group overflow-hidden">
               <img src={qrUrl} alt={`Mã QR VietQR chuyển khoản thanh toán ${formatVND(tx.amount)} từ ${getDisplayName(tx.from)} tới ${getDisplayName(tx.to)}`} className="w-[240px] h-auto object-cover rounded-xl border border-[var(--color-border)]" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                 <span className="text-white text-[10px] font-semibold select-none bg-black/60 px-2.5 py-1.5 rounded-full pointer-events-none">Quét bằng ứng dụng ngân hàng</span>
               </div>
             </div>
             <div className="mt-4 flex flex-col gap-1 items-center bg-[var(--color-muted)] border border-[var(--color-border)] w-full py-3.5 rounded-xl relative">
               <p className="text-[9px] font-bold text-[var(--color-muted-foreground)]">{receiver?.bankName || receiver?.bankId}</p>
               <p className="text-base font-bold text-[var(--color-foreground)]">{receiver?.accountNumber}</p>
               <button 
                 onClick={() => setIsEditing(true)} 
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-accent)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
               >
                 Sửa đổi 🛠️
               </button>
             </div>
           </>
         )}
         
         <button onClick={onClose} className="candy-btn candy-btn-secondary w-full mt-6 py-2.5 text-xs bg-[var(--color-card-solid)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">Đóng Cửa Sổ</button>
      </div>
    </Modal>
  );
}

