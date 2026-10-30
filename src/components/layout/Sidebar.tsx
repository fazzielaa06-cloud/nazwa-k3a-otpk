import React from 'react';
import { 
  BarChart3, 
  Container as ContainerIcon, 
  Ship, 
  Truck, 
  Layers, 
  Building2, 
  FileText, 
  MapPin, 
  X,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types/terminal';

export type NavTab = 
  | 'dashboard'
  | 'yard'
  | 'containers'
  | 'vessels'
  | 'gate'
  | 'stevedoring'
  | 'customers'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userRole: UserRole;
  counts: {
    containers: number;
    vessels: number;
    gate: number;
    stevedoring: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userRole,
  counts,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; category: string }[] = [
    {
      id: 'dashboard',
      label: 'Dasbor Analitik',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'UTAMA',
    },
    {
      id: 'yard',
      label: 'Peta Yard & Stacking 2D',
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Blok A-F',
      category: 'MONITORING',
    },
    {
      id: 'containers',
      label: 'Master Kontainer',
      icon: <ContainerIcon className="w-4 h-4" />,
      badge: counts.containers,
      category: 'MASTER DATA',
    },
    {
      id: 'vessels',
      label: 'Master Kapal & Berth',
      icon: <Ship className="w-4 h-4" />,
      badge: counts.vessels,
      category: 'MASTER DATA',
    },
    {
      id: 'customers',
      label: 'Mitra EMKL / Shipper',
      icon: <Building2 className="w-4 h-4" />,
      category: 'MASTER DATA',
    },
    {
      id: 'gate',
      label: 'Transaksi Gate & EIR',
      icon: <Truck className="w-4 h-4" />,
      badge: counts.gate,
      category: 'TRANSAKSI',
    },
    {
      id: 'stevedoring',
      label: 'Bongkar Muat Crane',
      icon: <Layers className="w-4 h-4" />,
      badge: counts.stevedoring,
      category: 'TRANSAKSI',
    },
    {
      id: 'reports',
      label: 'Laporan & Rekapitulasi',
      icon: <FileText className="w-4 h-4" />,
      badge: 'PDF',
      category: 'LAPORAN',
    },
  ];

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[61px] left-0 z-50 md:z-30 w-64 h-full md:h-[calc(100vh-61px)] bg-white border-r border-sky-100 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex items-center justify-between border-b border-sky-100 md:hidden">
          <span className="font-extrabold text-sm text-sky-950">MENU OPERASIONAL</span>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-1">
          {menuItems.map((item, idx) => {
            const isSelected = currentTab === item.id;
            const prevItem = menuItems[idx - 1];
            const isNewCategory = !prevItem || prevItem.category !== item.category;

            return (
              <React.Fragment key={item.id}>
                {isNewCategory && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-700 hover:bg-sky-50/70 hover:text-sky-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? 'text-white' : 'text-sky-600'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Sidebar Footer badge */}
        <div className="p-3.5 border-t border-sky-100 bg-sky-50/50">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-sky-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                Hak Akses: {userRole}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Level Operasional Otoritas
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
