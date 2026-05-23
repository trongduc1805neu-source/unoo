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
          {/* Telegram logo - Sky blue gradient circle with white paper plane */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#2aabee] to-[#229ed9] flex items-center justify-center shadow-lg transition-all hover:scale-105 duration-300 mb-6 shrink-0">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-12 h-12 fill-white relative left-[-2px] top-[1px]">
              <path d="M19.9 4.7L2.4 11.4c-.6.2-.6.6-.1.8l4.5 1.4 10.4-6.6c.5-.3.9-.1.5.2l-8.4 7.6-.3 4.5c.4 0 .6-.2.8-.4l2.1-2 4.4 3.2c.8.4 1.4.2 1.6-.7l2.9-13.6c.3-1.1-.4-1.6-1.2-1.2z" />
            </svg>
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
                className="w-full h-[52px] rounded-2xl bg-[#2481CC] hover:bg-[#2075b8] focus-visible:ring-2 focus-visible:ring-[#2481CC] focus-visible:outline-none text-white font-bold text-[14px] uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-white">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24z"/>
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
