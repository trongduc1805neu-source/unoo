import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential,
  Unsubscribe
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  push, 
  update, 
  remove, 
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  orderByKey
} from 'firebase/database';
import { UserProfile, RoomDetails, Expense, SettledBill, TripPlan, ChatMessage } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  databaseURL: string;
  projectId: string;
  authDomain: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  
  public init(config: FirebaseConfig): boolean {
    if (getApps().length > 0) {
      if (getApp().options.apiKey === config.apiKey) {
        this.app = getApp();
        return true;
      }
    }
    
    try {
      this.app = initializeApp({
        apiKey: config.apiKey,
        databaseURL: config.databaseURL,
        projectId: config.projectId,
        authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId
      });
      return true;
    } catch (e) {
      console.error("Firebase init error", e);
      return false;
    }
  }

  public getIsInitialized(): boolean {
    if (getApps().length > 0) {
      this.app = getApp();
      return true;
    }
    return this.app !== null;
  }

  // Contacts / Friends
  public async sendFriendRequest(fromUid: string, toEmail: string, fromUser: any): Promise<{success: boolean, message?: string}> {
    if (!this.app) throw new Error("Firebase not initialized");
    const db = getDatabase(this.app);
    
    // Find user by email
    const usersRef = ref(db, 'users');
    const { equalTo } = await import('firebase/database');
    const q = query(usersRef, orderByChild('email'), equalTo(toEmail));
    const snapshot = await get(q);
    
    if (!snapshot.exists()) {
      return { success: false, message: 'Không tìm thấy người dùng với email này.' };
    }
    
    let targetUid = '';
    let targetData = null;
    snapshot.forEach(child => {
      targetUid = child.key as string;
      targetData = child.val();
    });
    
    if (targetUid === fromUid) {
      return { success: false, message: 'Không thể tự kết bạn với chính mình.' };
    }
    
    // Check if already friends
    const friendSnap = await get(ref(db, `users/${fromUid}/friends/${targetUid}`));
    if (friendSnap.exists()) {
      return { success: false, message: 'Đã là bạn bè.' };
    }
    
    // Send request
    const requestRef = ref(db, `friendRequests/${targetUid}/${fromUid}`);
    await set(requestRef, {
      from: fromUser,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    
    return { success: true, message: 'Đã gửi yêu cầu kết bạn.' };
  }
  
  public subscribeToFriendRequests(uid: string, callback: (requests: any[]) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    return onValue(ref(db, `friendRequests/${uid}`), (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const data = snapshot.val();
      const requests = Object.keys(data).map(key => ({
        uid: key,
        ...data[key]
      }));
      callback(requests);
    });
  }
  
  public async acceptFriendRequest(uid: string, fromUid: string, reqData: any, currentUser: any): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const updates: any = {};
    
    // Add to friends lists
    updates[`users/${uid}/friends/${fromUid}`] = {
      displayName: reqData.from?.displayName || 'Unknown',
      email: reqData.from?.email || '',
      photoURL: reqData.from?.photoURL || '',
      addedAt: serverTimestamp()
    };
    
    updates[`users/${fromUid}/friends/${uid}`] = {
      displayName: currentUser.displayName || 'Unknown',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '',
      addedAt: serverTimestamp()
    };
    
    // Remove request
    updates[`friendRequests/${uid}/${fromUid}`] = null;
    
    await update(ref(db), updates);
  }
  
  public async rejectFriendRequest(uid: string, fromUid: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await remove(ref(db, `friendRequests/${uid}/${fromUid}`));
  }
  
  public subscribeToFriends(uid: string, callback: (friends: any[]) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    return onValue(ref(db, `users/${uid}/friends`), (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const data = snapshot.val();
      const friends = Object.keys(data).map(key => ({
        uid: key,
        ...data[key]
      }));
      callback(friends);
    });
  }

  // Auth
  public async loginWithGoogle(): Promise<UserCredential> {
    if (!this.app) throw new Error("Firebase not initialized");
    const auth = getAuth(this.app);
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  public async logout(): Promise<void> {
    if (!this.app) return;
    const auth = getAuth(this.app);
    return signOut(auth);
  }

  public onAuthChanged(callback: (user: User | null) => void): Unsubscribe {
    if (!this.app) {
      callback(null);
      return () => {};
    }
    const auth = getAuth(this.app);
    return onAuthStateChanged(auth, callback);
  }

  // User Profile
  public async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.app) return null;
    const db = getDatabase(this.app);
    const snapshot = await get(ref(db, `users/${uid}`));
    return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
  }

  public async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await update(ref(db, `users/${uid}`), data);
  }

  // Rooms
  public async createRoom(uid: string, name: string, userProfile: any): Promise<string> {
    if (!this.app) throw new Error("Firebase not initialized");
    const db = getDatabase(this.app);
    const roomsRef = ref(db, 'rooms');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key as string;

    const email = (userProfile && userProfile.email) ? userProfile.email : '';
    const displayName = (userProfile && userProfile.displayName) ? userProfile.displayName : 'Người dùng ẩn danh';
    const photoURL = (userProfile && userProfile.photoURL) ? userProfile.photoURL : '';

    const roomData = {
      metadata: {
        name: name,
        ownerId: uid,
        createdAt: serverTimestamp()
      },
      members: {
        [uid]: {
          displayName: displayName,
          photoURL: photoURL,
          email: email,
          joinedAt: serverTimestamp()
        }
      }
    };

    const updates: any = {};
    updates[`rooms/${roomId}`] = roomData;
    updates[`users/${uid}/rooms/${roomId}`] = true;
    await update(ref(db), updates);
    return roomId;
  }

  public async updateRoomName(roomId: string, name: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await update(ref(db, `rooms/${roomId}/metadata`), { name });
  }

  public async deleteRoom(roomId: string, members: string[]): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const updates: any = {};
    members.forEach(uid => {
      updates[`users/${uid}/rooms/${roomId}`] = null;
    });
    updates[`rooms/${roomId}`] = null;
    await update(ref(db), updates);
  }

  public async leaveRoom(uid: string, roomId: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const updates: any = {};
    updates[`users/${uid}/rooms/${roomId}`] = null;
    updates[`rooms/${roomId}/members/${uid}`] = null;
    await update(ref(db), updates);
  }

  public async removeMember(roomId: string, uidToRemove: string): Promise<void> {
    // Exact same logic as leaveRoom but conceptually different, and maybe we will add more logic later
    if (!this.app) return;
    const db = getDatabase(this.app);
    const updates: any = {};
    updates[`users/${uidToRemove}/rooms/${roomId}`] = null;
    updates[`rooms/${roomId}/members/${uidToRemove}`] = null;
    await update(ref(db), updates);
  }

  public async requestJoinRoom(uid: string, roomId: string, userProfile: any): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    
    // Check if room exists
    const roomSnapshot = await get(ref(db, `rooms/${roomId}/metadata/name`));
    if (!roomSnapshot.exists()) {
      throw new Error("Phòng không tồn tại");
    }
    
    const roomName = roomSnapshot.val();
    
    // Add request to room
    await set(ref(db, `rooms/${roomId}/requests/${uid}`), {
      displayName: userProfile?.displayName || 'Người dùng ẩn danh',
      email: userProfile?.email || '',
      photoURL: userProfile?.photoURL || '',
      requestedAt: serverTimestamp()
    });

    // Add to user's pending requests
    await set(ref(db, `joinRequests/${uid}/${roomId}`), {
      roomName,
      requestedAt: serverTimestamp()
    });
  }

  public async approveRequest(roomId: string, requestUid: string, userData: any): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    
    const updates: any = {};
    updates[`rooms/${roomId}/members/${requestUid}`] = {
      displayName: userData.displayName,
      photoURL: userData.photoURL || '',
      email: userData.email,
      joinedAt: serverTimestamp()
    };
    updates[`rooms/${roomId}/requests/${requestUid}`] = null; // remove request
    updates[`users/${requestUid}/rooms/${roomId}`] = true;
    updates[`joinRequests/${requestUid}/${roomId}`] = null; // clean pending
    
    await update(ref(db), updates);
  }

  public async rejectRequest(roomId: string, requestUid: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    
    const updates: any = {};
    updates[`rooms/${roomId}/requests/${requestUid}`] = null; // remove request
    updates[`joinRequests/${requestUid}/${roomId}`] = null; // clean pending
    
    await update(ref(db), updates);
  }

  public subscribeToUserRooms(uid: string, callback: (rooms: any[]) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    
    let roomUnsubs: Unsubscribe[] = [];
    
    const roomsListenerUnsub = onValue(ref(db, `users/${uid}/rooms`), (snapshot) => {
      // Clean up previous listeners
      roomUnsubs.forEach(unsub => unsub());
      roomUnsubs = [];
      
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const roomIds = Object.keys(snapshot.val());
      const roomsMap: Record<string, any> = {};
      
      const updateRoomsList = () => {
        callback(Object.values(roomsMap));
      };
      
      roomIds.forEach(rId => {
        const roomUnsub = onValue(ref(db, `rooms/${rId}`), (roomSnap) => {
          if (roomSnap.exists()) {
            const roomData = roomSnap.val();
            
            // Lấy tin nhắn cuối cùng từ dữ liệu phòng chat
            const chatObj = roomData.chat || {};
            const rawMsgs = Array.isArray(chatObj) ? chatObj : Object.values(chatObj);
            const msgs = rawMsgs.filter((m: any) => m && typeof m === 'object') as ChatMessage[];
            let lastMessage = null;
            if (msgs.length > 0) {
              msgs.sort((a, b) => {
                const tA = typeof a.timestamp === 'number' ? a.timestamp : (a.timestamp && typeof a.timestamp === 'object' ? Date.now() : 0);
                const tB = typeof b.timestamp === 'number' ? b.timestamp : (b.timestamp && typeof b.timestamp === 'object' ? Date.now() : 0);
                return tA - tB;
              });
              lastMessage = msgs[msgs.length - 1];
            }
            
            roomsMap[rId] = {
              id: rId,
              name: roomData.metadata?.name || '',
              ownerId: roomData.metadata?.ownerId || '',
              createdAt: roomData.metadata?.createdAt || 0,
              lastMessage,
              settledBills: roomData.settledBills || null,
              members: roomData.members || null,
              customMembers: roomData.customMembers || null,
              nicknames: roomData.nicknames || null,
              customMembersBanks: roomData.customMembersBanks || null
            };
          } else {
            delete roomsMap[rId];
          }
          updateRoomsList();
        });
        roomUnsubs.push(roomUnsub);
      });
      
      if (roomIds.length === 0) {
        callback([]);
      }
    });
    
    return () => {
      roomsListenerUnsub();
      roomUnsubs.forEach(unsub => unsub());
    };
  }

  public subscribeToRoomDetails(roomId: string, onData: (d: RoomDetails) => void, onError: (e: Error) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    
    return onValue(ref(db, `rooms/${roomId}`), (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.val() as RoomDetails);
      } else {
        onError(new Error("Room not found"));
      }
    });
  }

  public subscribeToJoinRequests(uid: string, callback: (reqs: any[]) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    
    return onValue(ref(db, `joinRequests/${uid}`), (snapshot) => {
      if (snapshot.exists()) {
        const reqs = [];
        for (const [roomId, data] of Object.entries(snapshot.val())) {
          reqs.push({ roomId, ...(data as any) });
        }
        callback(reqs);
      } else {
        callback([]);
      }
    });
  }

  // Room Data Writers
  public async writeExpenses(roomId: string, expenses: Expense[]): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const expensesObj = expenses.reduce((acc, exp) => ({ ...acc, [exp.id]: exp }), {});
    await set(ref(db, `rooms/${roomId}/expenses`), expensesObj);
  }

  public async writeSettledBills(roomId: string, bills: SettledBill[]): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const billsObj = bills.reduce((acc, bill) => ({ ...acc, [bill.id]: bill }), {});
    await set(ref(db, `rooms/${roomId}/settledBills`), billsObj);
  }

  public async writeCustomMembers(roomId: string, members: string[]): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await set(ref(db, `rooms/${roomId}/customMembers`), members);
  }

  public async writeRoomPlans(roomId: string, plans: TripPlan[]): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const plansObj = plans.reduce((acc, plan) => ({ ...acc, [plan.id]: plan }), {});
    await set(ref(db, `rooms/${roomId}/plans`), plansObj);
  }

  public async writeRoomNickname(roomId: string, uidOrName: string, nickname: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    if (!nickname) {
      await remove(ref(db, `rooms/${roomId}/nicknames/${uidOrName}`));
    } else {
      await set(ref(db, `rooms/${roomId}/nicknames/${uidOrName}`), nickname);
    }
  }

  public async clearRoomData(roomId: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    
    const updates: any = {};
    updates[`rooms/${roomId}/expenses`] = null;
    updates[`rooms/${roomId}/settledBills`] = null;
    updates[`rooms/${roomId}/chat`] = null;
    // plans shouldn't be deleted necessarily, but prompt says "Xóa toàn bộ data"
    updates[`rooms/${roomId}/plans`] = null;
    
    await update(ref(db), updates);
  }

  // Chat
  public async writeChatMessage(roomId: string, user: any, text: string, type: 'user' | 'system' | 'settlement', payload?: any): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    
    const chatRef = push(ref(db, `rooms/${roomId}/chat`));
    await set(chatRef, {
      id: chatRef.key,
      uid: user.uid || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      text,
      type,
      payload: payload || null,
      timestamp: serverTimestamp()
    });
  }

  public async updateChatMessage(roomId: string, messageId: string, text: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await update(ref(db, `rooms/${roomId}/chat/${messageId}`), { 
      text, 
      isEdited: true, 
      lastEditedAt: serverTimestamp() 
    });
  }

  public async deleteChatMessage(roomId: string, messageId: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await update(ref(db, `rooms/${roomId}/chat/${messageId}`), { 
      isDeleted: true,
      text: "Tin nhắn đã bị thu hồi" 
    });
  }

  public subscribeToChat(roomId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    
    return onValue(ref(db, `rooms/${roomId}/chat`), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val) {
          const rawMsgs = Array.isArray(val) ? val : Object.values(val);
          const msgs = rawMsgs.filter((m: any) => m && typeof m === 'object') as ChatMessage[];
          msgs.sort((a, b) => {
            const tA = typeof a.timestamp === 'number' ? a.timestamp : (a.timestamp && typeof a.timestamp === 'object' ? Date.now() : 0);
            const tB = typeof b.timestamp === 'number' ? b.timestamp : (b.timestamp && typeof b.timestamp === 'object' ? Date.now() : 0);
            return tA - tB;
          });
          callback(msgs);
        } else {
          callback([]);
        }
      } else {
        callback([]);
      }
    });
  }

  public subscribeToUserSchedules(uid: string, callback: (schedules: any[]) => void): Unsubscribe {
    if (!this.app) return () => {};
    const db = getDatabase(this.app);
    return onValue(ref(db, `users/${uid}/schedules`), (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const data = snapshot.val();
      const schedules = Object.keys(data)
        .filter(key => data[key] && typeof data[key] === 'object')
        .map(key => ({
          id: key,
          ...data[key]
        }));
      schedules.sort((a, b) => {
        const tA = a.time ? new Date(a.time).getTime() : 0;
        const tB = b.time ? new Date(b.time).getTime() : 0;
        return tA - tB;
      });
      callback(schedules);
    });
  }

  public async addUserSchedule(uid: string, schedule: { title: string; note: string; time: string; location: string; budget: number }): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    const newScheduleRef = push(ref(db, `users/${uid}/schedules`));
    await set(newScheduleRef, {
      ...schedule,
      createdAt: serverTimestamp()
    });
  }

  public async deleteUserSchedule(uid: string, scheduleId: string): Promise<void> {
    if (!this.app) return;
    const db = getDatabase(this.app);
    await remove(ref(db, `users/${uid}/schedules/${scheduleId}`));
  }
}

export const firebaseService = new FirebaseService();
