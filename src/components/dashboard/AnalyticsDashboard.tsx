import React from 'react';
import { 
  Ship, 
  Container as ContainerIcon, 
  Truck, 
  Clock, 
  TrendingUp, 
  Anchor, 
  Layers, 
  Activity, 
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Container, Vessel, GateTransaction, TerminalKPIs, AuditLog } from '../../types/terminal';

interface AnalyticsDashboardProps {
  kpis: TerminalKPIs;
  containers: Container[];
  vessels: Vessel[];
  gateTransactions: GateTransaction[];
  auditLogs: AuditLog[];
  onNavigateTab: (tab: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  kpis,
  containers,
  vessels,
  gateTransactions,
  auditLogs,
  onNavigateTab,
}) => {
  // Container breakdown
  const importCount = containers.filter(c => c.status === 'Import').length;
  const exportCount = containers.filter(c => c.status === 'Export').length;
  const emptyCount = containers.filter(c => c.status === 'Empty').length;
  const transhipmentCount = containers.filter(c => c.status === 'Transhipment').length;

  const count20 = containers.filter(c => c.size === '20ft').length;
  const count40 = containers.filter(c => c.size === '40ft').length;
  const count45 = containers.filter(c => c.size === '45ft').length;

  // Customs distribution
  const customsCleared = containers.filter(c => c.customsStatus === 'SPPB Cleared').length;
  const customsInspection = containers.filter(c => c.customsStatus === 'Red Line Inspection').length;
  const customsYellow = containers.filter(c => c.customsStatus === 'Yellow Line').length;
  const customsHold = containers.filter(c => c.customsStatus === 'Hold').length;

  // 7-day trend simulation
  const throughputDays = [
    { day: 'Kamis', inTEU: 420, outTEU: 380 },
    { day: 'Jumat', inTEU: 490, outTEU: 440 },
    { day: 'Sabtu', inTEU: 530, outTEU: 510 },
    { day: 'Minggu', inTEU: 390, outTEU: 340 },
    { day: 'Senin', inTEU: 580, outTEU: 520 },
    { day: 'Selasa', inTEU: 620, outTEU: 590 },
    { day: 'Hari Ini', inTEU: 650, outTEU: 610 },
  ];

  const berthedVessels = vessels.filter(v => v.status === 'Berthed');

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Yard Occupancy */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs hover:border-sky-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Okupansi Lapangan (Yard)
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <ContainerIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.yardOccupancyRate}%
            </span>
            <span className="text-xs text-sky-700 font-semibold font-mono">
              {kpis.totalTEU} / {kpis.yardCapacityTEU} TEU
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-sky-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                kpis.yardOccupancyRate > 80 ? 'bg-amber-500' : 'bg-sky-600'
              }`}
              style={{ width: `${Math.min(100, kpis.yardOccupancyRate)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Kapasitas lapangan beroperasi normal
          </p>
        </div>

        {/* Metric 2: Active Berth Slots */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs hover:border-sky-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kapal di Dermaga (Berth)
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.activeVessels}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Kapal Bersandar • {kpis.vesselsInQueue} Antre
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {['D01', 'D02', 'D03', 'D04'].map((slot, i) => {
              const occupied = berthedVessels.length > i;
              return (
                <span
                  key={slot}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    occupied 
                      ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {slot}: {occupied ? 'OCCUPIED' : 'FREE'}
                </span>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Anchor className="w-3.5 h-3.5 text-teal-600" />
            Dermaga 01 & 02 kapasitas kontainer besar
          </p>
        </div>

        {/* Metric 3: Gate Throughput */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs hover:border-sky-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Arus Gerbang Truk (Today)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.todayGateInCount + kpis.todayGateOutCount}
            </span>
            <span className="text-xs text-indigo-700 font-semibold font-mono">
              Truk / Box Hari Ini
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
            <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-800">
              In: <strong>{kpis.todayGateInCount}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800">
              Out: <strong>{kpis.todayGateOutCount}</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            Waktu rata-rata gerbang: 2.4 menit / truk
          </p>
        </div>

        {/* Metric 4: Dwelling Time & Productivity */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs hover:border-sky-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dwelling Time & Crane BPH
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.avgDwellingDays}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              Hari Rata-rata Inap
            </span>
          </div>
          <div className="mt-3 p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Produktivitas Crane:</span>
            <span className="font-bold text-emerald-800 font-mono">{kpis.averageGMPH} BPH (Box/Jam)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Sesuai target standar pelabuhan nasional (&lt; 3.0 hari)
          </p>
        </div>
      </div>

      {/* Real-time Berth Slot Visualizer */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Visualisasi Tambatan Dermaga (Berth Operations Line)
              </h3>
              <p className="text-xs text-slate-500">
                Panjang Kade 950 Meter • 6 Unit Super Post Panamax Quay Crane (QC-01 s/d QC-06)
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('vessels')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition"
          >
            Lihat Jadwal Kapal Lengkap →
          </button>
        </div>

        {/* 4 Berth Slots Graphic */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {['Dermaga 01', 'Dermaga 02', 'Dermaga 03', 'Dermaga 04'].map((berthName) => {
            const ship = vessels.find(v => v.berthSlot === berthName && v.status === 'Berthed');
            const totalWork = (ship?.totalDischargeTEU || 0) + (ship?.totalLoadTEU || 0);
            const finishedWork = (ship?.dischargedCount || 0) + (ship?.loadedCount || 0);
            const progress = totalWork > 0 ? Math.round((finishedWork / totalWork) * 100) : 0;

            return (
              <div
                key={berthName}
                className={`p-4 rounded-2xl border transition ${
                  ship
                    ? 'bg-sky-50/60 border-sky-300 shadow-xs'
                    : 'bg-slate-50/80 border-dashed border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-950 uppercase">{berthName}</span>
                  {ship ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      SANDAR AKTIF
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                      TERSEDIA (KOSONG)
                    </span>
                  )}
                </div>

                {ship ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {ship.vesselName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-1 font-mono">
                      <span>LOA: {ship.loa} m</span>
                      <span>Draft: {ship.draft} m</span>
                      <span>BPH: {ship.bph}</span>
                      <span>Crane: {ship.quayCranesAssigned.join(', ') || '-'}</span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                        <span>Realisasi Stevedoring:</span>
                        <span>{progress}% ({finishedWork}/{totalWork} TEU)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-sky-600 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 py-6 text-center text-xs text-slate-400">
                    Slot siap menerima sandar kapal feeder / mother vessel berikutnya
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphical Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Throughput Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  Tren Arus Petikemas Mingguan (Throughput TEU)
                </h3>
                <p className="text-xs text-slate-500">Perbandingan Gate In (Masuk) vs Gate Out (Keluar)</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="w-3 h-3 rounded bg-sky-500 inline-block"></span> Gate In
                </span>
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span> Gate Out
                </span>
              </div>
            </div>

            {/* SVG Visual Bars */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              {throughputDays.map((item, idx) => {
                const maxVal = 700;
                const inHeight = (item.inTEU / maxVal) * 100;
                const outHeight = (item.outTEU / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Gate In Bar */}
                      <div 
                        style={{ height: `${inHeight}%` }} 
                        className="w-3.5 sm:w-5 bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-md transition-all duration-300 group-hover:brightness-110 relative"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded font-mono pointer-events-none whitespace-nowrap z-20">
                          {item.inTEU} TEU
                        </span>
                      </div>

                      {/* Gate Out Bar */}
                      <div 
                        style={{ height: `${outHeight}%` }} 
                        className="w-3.5 sm:w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-300 group-hover:brightness-110 relative"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded font-mono pointer-events-none whitespace-nowrap z-20">
                          {item.outTEU} TEU
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 truncate">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Throughput tertinggi minggu ini tercatat pada hari Selasa (1.210 TEU).</span>
            <button 
              onClick={() => onNavigateTab('reports')}
              className="text-sky-600 font-bold hover:underline"
            >
              Unduh Rekapitulasi Laporan →
            </button>
          </div>
        </div>

        {/* Right: Distribution Breakdown Panels */}
        <div className="lg:col-span-5 space-y-4">
          {/* Panel 1: Status Distribution */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Distribusi Status Petikemas di Yard</span>
              <span className="text-xs text-sky-600 font-mono font-bold">{containers.length} Total Box</span>
            </h4>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Bongkar Impor (Import FCL/LCL)</span>
                  <span className="font-bold text-sky-800 font-mono">{importCount} box ({containers.length ? Math.round((importCount / containers.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full" 
                    style={{ width: `${containers.length ? (importCount / containers.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Muatan Ekspor (Export Outbound)</span>
                  <span className="font-bold text-emerald-800 font-mono">{exportCount} box ({containers.length ? Math.round((exportCount / containers.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${containers.length ? (exportCount / containers.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Petikemas Kosong (Empty Depo)</span>
                  <span className="font-bold text-slate-700 font-mono">{emptyCount} box ({containers.length ? Math.round((emptyCount / containers.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-slate-400 h-full rounded-full" 
                    style={{ width: `${containers.length ? (emptyCount / containers.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Transhipment (Pindah Kapal)</span>
                  <span className="font-bold text-purple-800 font-mono">{transhipmentCount} box ({containers.length ? Math.round((transhipmentCount / containers.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full" 
                    style={{ width: `${containers.length ? (transhipmentCount / containers.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Customs Inspection Overview */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Status Kepabeanan (Bea Cukai)</span>
              <span className="text-xs text-slate-500">Karantina & Jalur</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">SPPB Hijau (Clear)</span>
                <span className="text-base font-extrabold text-emerald-900 font-mono">{customsCleared} Box</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Jalur Kuning (Dok)</span>
                <span className="text-base font-extrabold text-amber-900 font-mono">{customsYellow} Box</span>
              </div>

              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                <span className="text-[10px] font-bold text-red-800 uppercase block">Jalur Merah (Fisik)</span>
                <span className="text-base font-extrabold text-red-900 font-mono">{customsInspection} Box</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">Hold / Karantina</span>
                <span className="text-base font-extrabold text-purple-900 font-mono">{customsHold} Box</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Audit Trail & Operational Log */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">
              Audit Trail & Catatan Transaksi Sistem Terakhir
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            Real-Time Persistent Event Log
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
          {auditLogs.slice(0, 8).map((log) => {
            let badgeBg = 'bg-sky-100 text-sky-800';
            if (log.action === 'GATE_IN' || log.action === 'CREATE') badgeBg = 'bg-emerald-100 text-emerald-800';
            if (log.action === 'DELETE') badgeBg = 'bg-red-100 text-red-800';
            if (log.action === 'GATE_OUT') badgeBg = 'bg-indigo-100 text-indigo-800';

            return (
              <div key={log.id} className="py-2.5 flex items-start gap-3 text-xs">
                <span className="font-mono text-slate-400 shrink-0 mt-0.5">{log.timestamp.slice(11, 19)}</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] shrink-0 ${badgeBg}`}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-900 mr-2">{log.userName}:</span>
                  <span className="text-slate-600">{log.details}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase">
                  {log.module}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
