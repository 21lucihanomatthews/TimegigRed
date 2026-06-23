import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, CheckCircle2, ShieldCheck, ChevronRight, Eye, EyeOff, KeyRound, HelpCircle, ArrowLeft } from 'lucide-react';
import { useUser } from '../UserContext';

type AuthMode = 'login' | 'register' | 'recovery' | 'forgot-password';

const AuthScreen: React.FC = () => {
  const { register, login, recoveryLogin, checkIdDocumentsRegistered } = useUser();
  const [mode, setMode] = useState<AuthMode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-check for existing ID documents
  React.useEffect(() => {
    if (mode === 'register' && email.length > 5 && email.includes('@')) {
      const timer = setTimeout(async () => {
        try {
          const isRegistered = await checkIdDocumentsRegistered(email);
          if (isRegistered) {
            setError('ID documents already registered. Please login.');
            setTimeout(() => {
              setMode('login');
              setError(null);
            }, 2500);
          }
        } catch (err) {
          console.error('Check failed', err);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [email, mode, checkIdDocumentsRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!acceptedTerms) {
          throw new Error('Please accept the terms and conditions.');
        }
        if (pin.length !== 4) {
          throw new Error('Recovery PIN must be 4 digits.');
        }
        await register(email, password, pin);
      } else if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'recovery') {
        if (pin.length !== 4) {
          throw new Error('Recovery PIN must be 4 digits.');
        }
        await recoveryLogin(email, pin);
      }
    } catch (err: any) {
      setError(err.message || 'Action failed.');
      if (err.message?.includes('ID documents already registered')) {
        setTimeout(() => setMode('login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-blue-50 p-8 md:p-10 relative overflow-hidden"
      >
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="relative text-center mb-8">
           <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl mb-6 transition-all transform ${mode === 'register' ? 'bg-blue-600 shadow-blue-600/20 -rotate-6' : mode === 'login' ? 'bg-emerald-600 shadow-emerald-600/20 rotate-6' : 'bg-amber-500 shadow-amber-500/20 rotate-0'}`}>
            {mode === 'recovery' ? <KeyRound className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase mb-2">
            {mode === 'register' ? 'Create Account' : mode === 'login' ? 'Welcome Back' : 'Account Recovery'}
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            {mode === 'register' ? 'Join the community today.' : mode === 'login' ? 'Login to your account.' : 'Enter your email and 4-digit PIN.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-semibold placeholder:text-gray-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {mode !== 'recovery' && (
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-12 text-gray-900 font-semibold placeholder:text-gray-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'recovery') && (
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between items-center mr-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">4-Digit PIN</label>
                {mode === 'register' && (
                  <div className="group relative">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                      Create a 4-digit code to recover your account if you forget your password.
                    </div>
                  </div>
                )}
              </div>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <input 
                  type="text" 
                  maxLength={4}
                  pattern="\d{4}"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-semibold placeholder:text-gray-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-all tracking-[0.5em]"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="px-1 flex items-start gap-3 select-none cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-gray-100 border-gray-200'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 text-white transition-opacity ${acceptedTerms ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                I accept the <span className="text-blue-600 font-bold hover:underline">Terms & Conditions</span>.
              </p>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isLoading || (mode === 'register' && !acceptedTerms)}
            className={`w-full group rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${
              (mode !== 'register' || acceptedTerms) 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'register' ? 'Create Account' : mode === 'login' ? 'Sign In' : 'Recover Account'}
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center">
          {mode === 'login' ? (
            <>
              <p className="text-xs text-gray-400 font-medium tracking-tight">
                Don't have an account? <span onClick={() => setMode('register')} className="text-blue-600 font-bold cursor-pointer hover:underline">Register Now</span>
              </p>
              <button 
                onClick={() => setMode('recovery')}
                className="text-xs text-gray-400 font-bold hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-1 mx-auto"
              >
                Forgotten Password?
              </button>
            </>
          ) : mode === 'register' ? (
            <p className="text-xs text-gray-400 font-medium tracking-tight">
              Already have an account? <span onClick={() => setMode('login')} className="text-blue-600 font-bold cursor-pointer hover:underline">Log in</span>
            </p>
          ) : (
            <button 
              onClick={() => setMode('login')}
              className="text-xs text-gray-400 font-bold hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
