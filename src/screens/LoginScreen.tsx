import { useState } from 'react';
import { firebaseService } from '../services/firebase';
import { motion } from 'motion/react';
import { AlertTriangle } from '../components/ui/Icons';

export default function LoginScreen({ isInitialized, onInitSuccess }: { isInitialized: boolean; onInitSuccess: () => void }) {
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      setLoginError('');
      await firebaseService.loginWithGoogle();
    } catch (e) {
      console.error(e);
      setLoginError('Đăng nhập thất bại! Hãy thử tài khoản Google khác.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-[#e8f4fc] to-[#dcecf7] dark:from-[#0e1621] dark:to-[#17212b] relative overflow-hidden">
      {/* Background radial decorations for premium look */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#2481CC]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#1A6CA8]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="w-full max-w-[400px] bg-[var(--color-card-solid)] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[var(--color-border)] p-8 md:p-10 flex flex-col items-center justify-center relative min-h-[420px] z-10"
      >
        <div className="w-full flex flex-col items-center flex-1 justify-center">
          {/* UNO Logo */}
          <div className="w-36 h-28 mb-6 shrink-0 flex items-center justify-center transition-all hover:scale-105 duration-300">
            <img src="/logo.svg" alt="UNO Logo" className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(237,28,36,0.3)]" />
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[var(--color-foreground)] text-center tracking-tight select-none">
            Đăng nhập vào Uno
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] text-center mt-2.5 mb-8 max-w-[280px] leading-relaxed font-medium select-none">
            Vui lòng tiếp tục bằng tài khoản Google của bạn để quản lý chi tiêu nhóm.
          </p>

          {loginError && (
            <div role="alert" aria-live="polite" className="w-full p-3 mb-6 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-1.5 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" aria-hidden="true" /> {loginError}
            </div>
          )}

          {/* Main Button */}
          <div className="w-full mt-2">
            {isInitialized ? (
              <button 
                onClick={handleLogin} 
                className="w-full h-[52px] rounded-2xl bg-[var(--color-card-solid)] hover:bg-[var(--color-muted)] border border-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none text-[var(--color-foreground)] font-bold text-[14px] uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Đăng nhập bằng Google
              </button>
            ) : (
              <div className="w-full h-[52px] rounded-2xl bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] text-sm font-bold animate-pulse">
                Đang thiết lập kết nối…
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
