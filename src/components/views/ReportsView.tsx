import React, { useState } from 'react';
import { Container, Vessel, GateTransaction, TerminalKPIs } from '../../types/terminal';
import { 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  BarChart3, 
  CheckCircle2,
  Ship,
  Truck,
  Layers,
  Clock
} from 'lucide-react';

interface ReportsViewProps {
  containers: Container[];
  vessels: Vessel[];
  gateTransactions: GateTransaction[];
  kpis: TerminalKPIs;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  containers,
  vessels,
  gateTransactions,
  kpis,
}) => {
  const [reportType, setReportType] = useState<'YARD_THROUGHPUT' | 'DWELLING_TIME' | 'BERTH_PRODUCTIVITY' | 'GATE_EIR'>('YARD_THROUGHPUT');
  const [startDate, setStartDate] = useState('2026-10-20');
  const [endDate, setEndDate] = useState('2026-10-28');
  const [shippingLineFilter, setShippingLineFilter] = useState('ALL');

  const lines = Array.from(new Set(containers.map(c => c.shippingLine)));

  // Filtered containers
  const filteredContainers = containers.filter(c => {
    return shippingLineFilter === 'ALL' || c.shippingLine === shippingLineFilter;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let filename = `Laporan_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csvContent = '';

    if (reportType === 'YARD_THROUGHPUT' || reportType === 'DWELLING_TIME') {
      const headers = ['Nomor Kontainer', 'Ukuran', 'Tipe', 'Status', 'Shipping Line', 'Lokasi Yard', 'Berat Kotor (kg)', 'Dwelling Time (Hari)', 'Bea Cukai'];
      const rows = filteredContainers.map(c => [
        c.containerNumber,
        c.size,
        c.type,
        c.status,
        `"${c.shippingLine}"`,
        `"${c.yardLocation.block}-${c.yardLocation.bay}-${c.yardLocation.row}-${c.yardLocation.tier}"`,
        c.weightGross,
        c.dwellDays,
        c.customsStatus,
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    } else if (reportType === 'BERTH_PRODUCTIVITY') {
      const headers = ['Nama Kapal', 'Call Sign', 'Dermaga', 'Quay Crane', 'ETA', 'ETD', 'Status', 'Total Bongkar', 'Total Muat', 'BPH'];
      const rows = vessels.map(v => [
        `"${v.vesselName}"`,
        v.callSign,
        v.berthSlot,
        `"${v.quayCranesAssigned.join('; ')}"`,
        v.eta,
        v.etd,
        v.status,
        v.totalDischargeTEU,
        v.totalLoadTEU,
        v.bph,
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    } else {
      const headers = ['No EIR', 'Waktu', 'Jenis', 'Kontainer', 'No Truk', 'Supir', 'EMKL', 'Gross', 'Netto', 'Alokasi Yard'];
      const rows = gateTransactions.map(t => [
        t.eirNumber,
        t.timestamp,
        t.type,
        t.containerNumber,
        t.truckNumber,
        `"${t.driverName}"`,
        `"${t.emklCompany}"`,
        t.weightGross,
        t.weightNetContainer,
        `"${t.assignedYardLocation}"`,
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Report Selector (Hidden when printing) */}
      <div className="no-print bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              Pusat Laporan & Rekapitulasi Operasional Pelabuhan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate laporan audit, dwelling time, produktivitas dermaga, dan arus gerbang peti kemas
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan Resmi (PDF)</span>
            </button>
          </div>
        </div>

        {/* Report Selector Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-sky-100">
          <button
            onClick={() => setReportType('YARD_THROUGHPUT')}
            className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
              reportType === 'YARD_THROUGHPUT'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white hover:bg-sky-50/60 text-slate-700 border-sky-100'
            }`}
          >
            <span className="block text-xs font-bold">1. Arus & Okupansi Yard</span>
            <span className={`text-[11px] block mt-0.5 ${reportType === 'YARD_THROUGHPUT' ? 'text-sky-100' : 'text-slate-500'}`}>
              Rekap throughput & kapasitas blok
            </span>
          </button>

          <button
            onClick={() => setReportType('DWELLING_TIME')}
            className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
              reportType === 'DWELLING_TIME'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white hover:bg-sky-50/60 text-slate-700 border-sky-100'
            }`}
          >
            <span className="block text-xs font-bold">2. Analisis Dwelling Time</span>
            <span className={`text-[11px] block mt-0.5 ${reportType === 'DWELLING_TIME' ? 'text-sky-100' : 'text-slate-500'}`}>
              Lama inap & jalur bea cukai
            </span>
          </button>

          <button
            onClick={() => setReportType('BERTH_PRODUCTIVITY')}
            className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
              reportType === 'BERTH_PRODUCTIVITY'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white hover:bg-sky-50/60 text-slate-700 border-sky-100'
            }`}
          >
            <span className="block text-xs font-bold">3. Kinerja Dermaga & BPH</span>
            <span className={`text-[11px] block mt-0.5 ${reportType === 'BERTH_PRODUCTIVITY' ? 'text-sky-100' : 'text-slate-500'}`}>
              Quay Crane Box Per Hour
            </span>
          </button>

          <button
            onClick={() => setReportType('GATE_EIR')}
            className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
              reportType === 'GATE_EIR'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white hover:bg-sky-50/60 text-slate-700 border-sky-100'
            }`}
          >
            <span className="block text-xs font-bold">4. Rekap Transaksi Gate EIR</span>
            <span className={`text-[11px] block mt-0.5 ${reportType === 'GATE_EIR' ? 'text-sky-100' : 'text-slate-500'}`}>
              Jembatan timbang & supir truk
            </span>
          </button>
        </div>

        {/* Parameter Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Periode Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 bg-sky-50/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Periode Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 bg-sky-50/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filter Shipping Line</label>
            <select
              value={shippingLineFilter}
              onChange={(e) => setShippingLineFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 bg-sky-50/20 font-medium"
            >
              <option value="ALL">Semua Operator / Shipping Line</option>
              {lines.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Printable Report Document Container */}
      <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-sm text-slate-800 space-y-6">
        {/* Official Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              <Ship className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                PORTVESSEL CONTAINER TERMINAL INDONESIA
              </h1>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                LAPORAN RESMI KINERJA OPERASIONAL PELABUHAN PETIKEMAS
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Nomor: RPT/TOS/OPS/{new Date().getFullYear()}/X/084 • Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 uppercase font-mono">
              Status: Verified Final
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Periode: {startDate} s/d {endDate}
            </p>
          </div>
        </div>

        {/* Executive Summary Metrics Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Populasi Box</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">{filteredContainers.length} Kontainer</span>
            <span className="text-[10px] text-slate-500 block">Setara {kpis.totalTEU} TEU</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tingkat Okupansi Yard</span>
            <span className="text-lg font-extrabold text-sky-700 font-mono">{kpis.yardOccupancyRate}%</span>
            <span className="text-[10px] text-slate-500 block">Kapasitas 3.500 TEU</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Dwelling Time</span>
            <span className="text-lg font-extrabold text-emerald-700 font-mono">{kpis.avgDwellingDays} Hari</span>
            <span className="text-[10px] text-slate-500 block">Target Nasional &lt; 3.0 Hari</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Crane Gross Moves</span>
            <span className="text-lg font-extrabold text-teal-700 font-mono">{kpis.averageGMPH} BPH</span>
            <span className="text-[10px] text-slate-500 block">6 Unit Quay Crane</span>
          </div>
        </div>

        {/* Report Content Section based on selected tab */}
        {reportType === 'YARD_THROUGHPUT' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Tabel Rekapitulasi Alokasi Lapangan Penumpukan (Yard Block Distribution)
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3 border-b">Blok Yard</th>
                  <th className="py-2.5 px-3 border-b">Karakteristik Muatan</th>
                  <th className="py-2.5 px-3 border-b text-center">Jumlah Box</th>
                  <th className="py-2.5 px-3 border-b text-center">Estimasi TEU</th>
                  <th className="py-2.5 px-3 border-b text-center">Tingkat Terisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {['A', 'B', 'C', 'D', 'E', 'F'].map((blk) => {
                  const items = filteredContainers.filter(c => c.yardLocation.block === blk);
                  let desc = 'Dry Import Standard/HC';
                  if (blk === 'B') desc = 'Reefer Cold Chain Storage (-20°C)';
                  if (blk === 'C') desc = 'General Export Stacking Yard';
                  if (blk === 'D') desc = 'Special Cargo (Flat Rack & Tank)';
                  if (blk === 'E') desc = 'Empty Container Depo';
                  if (blk === 'F') desc = 'Dangerous Goods (IMDG Hazmat)';

                  const teu = items.reduce((acc, curr) => acc + (curr.size === '20ft' ? 1 : 2), 0);
                  const maxCap = 480;
                  const pct = Math.round((teu / maxCap) * 100);

                  return (
                    <tr key={blk} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-sky-900 font-mono">BLOK {blk}</td>
                      <td className="py-2.5 px-3">{desc}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{items.length} Box</td>
                      <td className="py-2.5 px-3 text-center font-mono">{teu} TEU</td>
                      <td className="py-2.5 px-3 text-center font-mono">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'DWELLING_TIME' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Daftar Kontainer dengan Lama Inap (Dwelling Time Monitoring)
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3 border-b">No. Kontainer</th>
                  <th className="py-2.5 px-3 border-b">Ukuran / Tipe</th>
                  <th className="py-2.5 px-3 border-b">Shipping Line</th>
                  <th className="py-2.5 px-3 border-b">Status Bea Cukai</th>
                  <th className="py-2.5 px-3 border-b">Lokasi Yard</th>
                  <th className="py-2.5 px-3 border-b text-center">Dwelling Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredContainers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.containerNumber}</td>
                    <td className="py-2.5 px-3">{c.size} {c.type}</td>
                    <td className="py-2.5 px-3">{c.shippingLine}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-800">{c.customsStatus}</td>
                    <td className="py-2.5 px-3 font-mono">Blok {c.yardLocation.block}-{c.yardLocation.bay}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={c.dwellDays >= 5 ? 'text-red-600' : 'text-slate-800'}>
                        {c.dwellDays} Hari
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'BERTH_PRODUCTIVITY' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Laporan Produktivitas Tambatan & Crane (Berth Moves Per Hour)
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3 border-b">Nama Kapal</th>
                  <th className="py-2.5 px-3 border-b">Slot Dermaga</th>
                  <th className="py-2.5 px-3 border-b">Quay Crane</th>
                  <th className="py-2.5 px-3 border-b text-center">Target Bongkar/Muat</th>
                  <th className="py-2.5 px-3 border-b text-center">Realisasi (TEU)</th>
                  <th className="py-2.5 px-3 border-b text-center">Gross BPH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {vessels.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{v.vesselName} ({v.callSign})</td>
                    <td className="py-2.5 px-3 font-bold text-sky-800">{v.berthSlot}</td>
                    <td className="py-2.5 px-3 font-mono">{v.quayCranesAssigned.join(', ') || '-'}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{v.totalDischargeTEU + v.totalLoadTEU} TEU</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {v.dischargedCount + v.loadedCount} TEU
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-900">{v.bph} BPH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'GATE_EIR' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">
              Laporan Transaksi Gerbang & Penimbangan Truk (Equipment Interchange Receipt)
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold text-slate-800 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3 border-b">No. EIR</th>
                  <th className="py-2.5 px-3 border-b">Waktu</th>
                  <th className="py-2.5 px-3 border-b">Jenis Gate</th>
                  <th className="py-2.5 px-3 border-b">No. Box & Truk</th>
                  <th className="py-2.5 px-3 border-b">EMKL / Trucking</th>
                  <th className="py-2.5 px-3 border-b text-right">Netto Kontainer</th>
                  <th className="py-2.5 px-3 border-b">Inspeksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {gateTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{t.eirNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{t.timestamp.slice(0, 16)}</td>
                    <td className="py-2.5 px-3 font-semibold text-sky-800">{t.type}</td>
                    <td className="py-2.5 px-3 font-mono">{t.containerNumber} ({t.truckNumber})</td>
                    <td className="py-2.5 px-3">{t.emklCompany}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {t.weightNetContainer.toLocaleString('id-ID')} kg
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium">{t.physicalInspection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Document End Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs text-center">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-14">
              Disiapkan Oleh:<br />
              <strong>Foreman Operasional & Terminal Planner</strong>
            </p>
            <div className="border-t border-slate-400 mx-10 pt-1 font-bold text-slate-800">
              Hendra Gunawan (Yard Planner)
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-14">
              Mengetahui & Menyetujui:<br />
              <strong>General Manager Operasional Terminal</strong>
            </p>
            <div className="border-t border-slate-400 mx-10 pt-1 font-bold text-slate-800">
              Budi Santoso, S.T. (TOS Super Admin)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
