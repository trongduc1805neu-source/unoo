import { useState, useEffect } from 'react';
import { firebaseService } from './services/firebase';
import { User } from 'firebase/auth';
import { UserProfile, RoomDetails, Screen } from './types';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import ActiveRoom from './screens/ActiveRoom';
import { Loader2, MessageSquare } from './components/ui/Icons';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => localStorage.getItem('uno_active_room_id'));
  const [activeRoomDetails, setActiveRoomDetails] = useState<RoomDetails | null>(null);
  
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [myPendingRequests, setMyPendingRequests] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'schedules' | 'history' | 'profile'>('messages');

  // Khởi tạo theme (Light/Dark Mode)
  useEffect(() => {
    const savedTheme = localStorage.getItem('uno-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Init Firebase
  useEffect(() => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };

    if (firebaseService.init(config)) {
      setIsInitialized(true);
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    if (!isInitialized) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const unsub = firebaseService.onAuthChanged(async (u) => {
      try {
        setUser(u);
        if (u) {
          const p = await firebaseService.getUserProfile(u.uid);
          if (p) {
            setProfile(p);
          } else {
            // Setup basic profile
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Người dùng ẩn danh',
              photoURL: u.photoURL || '',
              email: u.email || ''
            };
            await firebaseService.updateUserProfile(u.uid, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
          setActiveRoomId(null);
          localStorage.removeItem('uno_active_room_id');
        }
      } catch (err) {
        console.error("Error setting up user profile:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, [isInitialized]);

  // Read Rooms for User
  useEffect(() => {
    if (!user) return;
    const unsubR = firebaseService.subscribeToUserRooms(user.uid, (rooms) => setMyRooms(rooms));
    const unsubReq = firebaseService.subscribeToJoinRequests(user.uid, (reqs) => setMyPendingRequests(reqs));
    
    return () => {
      unsubR();
      unsubReq();
    };
  }, [user]);

  // Read Active Room Info
  useEffect(() => {
    if (!activeRoomId) {
      setActiveRoomDetails(null);
      return;
    }
    
    const unsub = firebaseService.subscribeToRoomDetails(
      activeRoomId, 
      (details) => setActiveRoomDetails(details),
      (err) => {
        console.error(err);
        setActiveRoomId(null);
        localStorage.removeItem('uno_active_room_id');
      }
    );
    
    return () => unsub();
  }, [activeRoomId]);

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    localStorage.setItem('uno_active_room_id', roomId);
  };

  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    localStorage.removeItem('uno_active_room_id');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 relative overflow-hidden bg-[var(--color-background)]">
        <div className="ambient-orb w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-16 h-16 bg-[var(--color-accent)]/10 rounded-full border border-[var(--color-accent)]/20 shadow-[0_0_20px_rgba(14, 165, 233, 0.2)] flex items-center justify-center animate-pulse">
           <Loader2 aria-hidden="true" className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
        </div>
        <h2 className="font-heading text-lg text-[var(--color-foreground)] relative z-10">Đang tải…</h2>
      </div>
    );
  }

  if (!user || (!isInitialized && !user)) {
    return (
      <LoginScreen 
        isInitialized={isInitialized} 
        onInitSuccess={() => setIsInitialized(true)} 
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[var(--color-background)] overflow-hidden">
      {/* Sidebar - Left column */}
      <div className={`h-full border-r border-[var(--color-border)] bg-[var(--color-card)] 
        ${activeTab === 'messages' 
          ? 'w-full md:w-[384px] md:min-w-[384px] lg:w-[420px] lg:min-w-[420px] flex-shrink-0' 
          : 'flex-1 w-full'
        } 
        ${activeRoomId && activeRoomDetails && activeTab === 'messages' ? 'hidden md:block' : 'block'}`}
      >
        <Dashboard 
          user={user} 
          profile={profile} 
          myRooms={myRooms} 
          pendingRequests={myPendingRequests}
          onSelectRoom={handleSelectRoom}
          activeRoomId={activeRoomId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 overflow-hidden h-full relative ${
        activeTab !== 'messages' 
          ? 'hidden' 
          : (!activeRoomId || !activeRoomDetails ? 'hidden md:flex items-center justify-center bg-[var(--color-muted)]' : 'block')
      }`}>
        {!activeRoomId || !activeRoomDetails ? (
           <div className="text-center p-8 max-w-md mx-auto flex flex-col items-center justify-center h-full">
             <div className="w-24 h-24 mb-6 bg-[var(--color-card)] rounded-[2rem] border border-[var(--color-border)] shadow-[0_4px_12px_rgba(36,129,204,0.06)] flex items-center justify-center animate-pulse">
                <MessageSquare className="w-10 h-10 text-[var(--color-accent)]" aria-hidden="true" />
             </div>
             <h2 className="text-2xl font-heading font-bold text-[var(--color-foreground)] mb-2">Chưa chọn nhóm</h2>
             <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">
               Chọn một nhóm bên thanh công cụ hoặc tạo nhóm mới để bắt đầu chia sẻ chi tiêu.
             </p>
           </div>
        ) : (
          <ActiveRoom 
            user={user} 
            profile={profile}
            roomDetails={activeRoomDetails} 
            roomId={activeRoomId} 
            onLeaveRoom={handleLeaveRoom} 
          />
        )}
      </div>
    </div>
  );
}
