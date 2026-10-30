import React, { useState } from 'react';
import { 
  Ship, 
  Anchor, 
  Container as ContainerIcon, 
  Truck, 
  KeyRound, 
  User as UserIcon, 
  Mail,
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { TerminalService } from '../services/terminalService';
import { User } from '../types/terminal';
import { useToast } from './Toast';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [email, setEmail] = useState('admin@terminal.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const { showToast } = useToast();

  const demoAccounts = TerminalService.getDemoAccounts();

  const handleLogin = async (
    e?: React.FormEvent, 
    customUser?: string, 
    customEmail?: string, 
    customPass?: string
  ) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const userToTry = customUser !== undefined ? customUser : username;
    const emailToTry = customEmail !== undefined ? customEmail : email;
    const passToTry = customPass !== undefined ? customPass : password;

    try {
      const res = await TerminalService.login(userToTry, emailToTry, passToTry);
      if (res.success && res.user) {
        showToast(`Selamat datang, ${res.user.name}!`, `Login berhasil sebagai ${res.user.role}.`, 'success');
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Autentikasi gagal.');
        showToast('Login Gagal', res.error || 'Periksa kembali Username, Email, dan Password Anda.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala sistem.';
      setErrorMsg(msg);
      showToast('Kendala Login', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demo: typeof demoAccounts[0]) => {
    setActiveHighlight(demo.id);
    setUsername(demo.username);
    setEmail(demo.email);
    setPassword(demo.passwordPlain);
    
    // Execute login quickly with feedback
    handleLogin(undefined, demo.username, demo.email, demo.passwordPlain);
  };

  const handleFillDemoOnly = (demo: typeof demoAccounts[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHighlight(demo.id);
    setUsername(demo.username);
    setEmail(demo.email);
    setPassword(demo.passwordPlain);
    showToast('Form Terisi', `Data demo ${demo.role} (${demo.name}) telah dimasukkan ke form.`, 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-white flex flex-col justify-between text-slate-800">
      {/* Top Header Bar */}
      <header className="w-full bg-white/95 backdrop-blur border-b border-sky-100 py-3.5 px-6 sm:px-10 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sky-950 text-lg tracking-tight flex items-center gap-2">
              PORTVESSEL <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold border border-sky-200">TOS v2.6</span>
            </h1>
            <p className="text-xs text-sky-600/80 font-medium">Terminal Operating System • Pelabuhan Petikemas</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-medium text-sky-800">
          <Database className="w-4 h-4 text-sky-600 animate-pulse" />
          <span>Database Transaksional Terhubung</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context & Port Feature Highlights */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 border border-sky-300 text-sky-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Sistem Operasional Pelabuhan Terpadu
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Portal Masuk Sistem <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-500">
                Terminal Petikemas
              </span>
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Silakan login dengan kredensial akun Anda: <strong>Username</strong>, <strong>Email</strong>, dan <strong>Password</strong>, atau gunakan fitur <strong>Login Cepat Demo</strong> yang tersedia langsung di form login.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white border border-sky-100 shadow-xs hover:border-sky-300 transition">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2 font-bold">
                  <Anchor className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">4 Slot Dermaga Aktif</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Monitoring LOA, draft, dan alokasi Quay Crane</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-sky-100 shadow-xs hover:border-sky-300 transition">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2 font-bold">
                  <ContainerIcon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Peta Yard Blok A-F</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Stacking tier 1-5, dry, reefer & dangerous goods</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-sky-100 shadow-xs hover:border-sky-300 transition">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2 font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Gate In/Out & EIR</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Timbang truk, segel fisik & cetak slip interkoneksi</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-sky-100 shadow-xs hover:border-sky-300 transition">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Strict Data Integrity</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Validasi ketat ISO & audit log transaksional</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
              <Database className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Sumber Tunggal Kebenaran:</span> Data tersimpan persisten secara transaksional pada Database Nyata (IndexedDB & REST API). Tanpa localStorage.
              </div>
            </div>
          </div>

          {/* Right Column: Complete Login Form Card with 3 Fields + Demo Quick Login */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-950/5 border border-sky-100">
              <div className="mb-5 pb-4 border-b border-sky-100 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Form Login Admin & Operator</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Masukkan Username, Email resmi, dan Password operasional
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold bg-sky-100 text-sky-800 rounded-lg border border-sky-200 shrink-0 font-mono">
                  Default View
                </span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Login Form with 3 Explicit Fields: Username, Email, and Password */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Field 1: Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    1. Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="contoh: admin"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-sky-50/20 text-slate-800 font-mono transition"
                    />
                  </div>
                </div>

                {/* Field 2: Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    2. Email Admin / Pengguna <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: admin@terminal.id"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-sky-50/20 text-slate-800 transition"
                    />
                  </div>
                </div>

                {/* Field 3: Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Kata Sandi / Password <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-sky-600 font-medium">Demo: admin123</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      required
                      className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-sky-50/20 text-slate-800 font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 active:scale-[0.99] transition shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard Operasional</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* User Demo Login Section in Form Login (Prompt Requirement) */}
              <div className="mt-6 pt-5 border-t border-sky-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                      User Demo Login (Klik Login Cepat)
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Pilih Akun Demo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {demoAccounts.map((demo) => {
                    let roleIcon = '👨‍✈️';
                    let roleBadgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
                    if (demo.role === 'Yard Planner') {
                      roleIcon = '🏗️';
                      roleBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                    } else if (demo.role === 'Berth Controller') {
                      roleIcon = '🚢';
                      roleBadgeColor = 'bg-teal-100 text-teal-800 border-teal-300';
                    } else if (demo.role === 'Gate Operator') {
                      roleIcon = '🚛';
                      roleBadgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
                    }

                    const isCurrent = activeHighlight === demo.id || (username === demo.username && email === demo.email);

                    return (
                      <div
                        key={demo.id}
                        className={`group relative flex flex-col justify-between p-3 rounded-2xl border transition duration-150 shadow-2xs hover:shadow-sm ${
                          isCurrent 
                            ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-300/60' 
                            : 'bg-white hover:bg-sky-50/40 border-sky-100 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl shrink-0 mt-0.5">{roleIcon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {demo.name}
                              </span>
                              {isCurrent && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                                {demo.role}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-500 font-mono mt-1 space-y-0.5 leading-tight">
                              <div>User: <span className="font-bold text-slate-800">{demo.username}</span></div>
                              <div className="truncate">Email: <span className="text-slate-700">{demo.email}</span></div>
                              <div>Pass: <span className="font-bold text-slate-800">{demo.passwordPlain}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="mt-2.5 pt-2 border-t border-sky-100/80 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickDemoLogin(demo)}
                            className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Klik Login Cepat</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleFillDemoOnly(demo, e)}
                            title="Hanya isi form tanpa langsung login"
                            className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                          >
                            Isi Form
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-sky-100 py-3 px-6 text-center text-xs text-slate-500">
        <p>
          PortVessel Container Terminal Operating System © {new Date().getFullYear()} • Standarisasi Pelabuhan Petikemas Indonesia • Inter Typography & Sky Blue
        </p>
      </footer>
    </div>
  );
};
