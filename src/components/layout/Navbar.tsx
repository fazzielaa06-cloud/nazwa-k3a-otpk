import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Database, 
  LogOut, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  Menu, 
  X,
  Bell
} from 'lucide-react';
import { User } from '../../types/terminal';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onResetData: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onResetData,
  onToggleSidebar,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-sky-100 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  PORTVESSEL
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  TOS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Terminal Petikemas Tanjung Priok / Perak Standards
              </p>
            </div>
          </div>
        </div>

        {/* Center: Real-Time Seaport Clock & DB Status badge */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="font-mono font-bold">{timeStr}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[11px]">{user.terminalShift}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>DB Persisten (No localStorage)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Right: Reset Data, User Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onResetData}
            title="Reset ke Data Standar Awal"
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Card */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-sky-100">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-sky-200 object-cover shadow-2xs"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] font-medium text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-200">
                {user.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Keluar / Logout"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
