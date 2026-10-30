import React, { useState } from 'react';
import { Vessel, VesselStatus } from '../../types/terminal';
import { 
  Plus, 
  Search, 
  Anchor, 
  Edit3, 
  Trash2, 
  Ship, 
  Download, 
  Clock, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface MasterVesselsViewProps {
  vessels: Vessel[];
  onAddNew: () => void;
  onEdit: (vessel: Vessel) => void;
  onDelete: (vessel: Vessel) => void;
}

export const MasterVesselsView: React.FC<MasterVesselsViewProps> = ({
  vessels,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = vessels.filter((v) => {
    const matchesSearch = 
      v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.shippingAgent.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Nama Kapal', 'Call Sign', 'IMO', 'Bendera', 'LOA (m)', 'Draft (m)', 'Slot Dermaga', 'Quay Cranes', 'ETA', 'ETD', 'Status', 'Total Bongkar (TEU)', 'Realisasi Bongkar', 'Total Muat (TEU)', 'Realisasi Muat', 'Agen', 'BPH'];
    const rows = filtered.map(v => [
      `"${v.vesselName}"`,
      v.callSign,
      v.imoNumber,
      `"${v.flag}"`,
      v.loa,
      v.draft,
      v.berthSlot,
      `"${v.quayCranesAssigned.join('; ')}"`,
      v.eta,
      v.etd,
      v.status,
      v.totalDischargeTEU,
      v.dischargedCount,
      v.totalLoadTEU,
      v.loadedCount,
      `"${v.shippingAgent}"`,
      v.bph,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Kapal_Dermaga_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            Master Kapal & Tambatan Dermaga (Berth Planning)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen jadwal kedatangan kapal (ETA/ETD), alokasi dermaga & Quay Crane pelabuhan
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Kapal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-sky-100 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama kapal, call sign, agen..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Status (Berthed/Approaching/dll)</option>
            <option value="Berthed">Berthed (Sedang Sandar)</option>
            <option value="Approaching">Approaching (Menuju Dermaga)</option>
            <option value="Anchored">Anchored (Labuh Luar)</option>
            <option value="Operations Finished">Operations Finished (Selesai)</option>
            <option value="Departed">Departed (Berlayar)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-50/80 border-b border-sky-100 text-sky-950 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nama Kapal & Bendera</th>
                <th className="py-3 px-4">Dimensi (LOA/Draft)</th>
                <th className="py-3 px-4">Slot Dermaga</th>
                <th className="py-3 px-4">Quay Crane</th>
                <th className="py-3 px-4">Jadwal (ETA / ETD)</th>
                <th className="py-3 px-4">Bongkar & Muat</th>
                <th className="py-3 px-4 text-center">BPH</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ada data kapal yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  let statusBadge = 'bg-teal-100 text-teal-800 border-teal-200';
                  if (v.status === 'Approaching') statusBadge = 'bg-sky-100 text-sky-800 border-sky-200';
                  if (v.status === 'Anchored') statusBadge = 'bg-amber-100 text-amber-800 border-amber-200';
                  if (v.status === 'Departed') statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';

                  const totalWork = v.totalDischargeTEU + v.totalLoadTEU;
                  const finishedWork = v.dischargedCount + v.loadedCount;
                  const pct = totalWork > 0 ? Math.round((finishedWork / totalWork) * 100) : 0;

                  return (
                    <tr key={v.id} className="hover:bg-sky-50/40 transition">
                      {/* Vessel Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4 text-sky-700 shrink-0" />
                          <span className="font-bold text-sm text-slate-900">
                            {v.vesselName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                          Call Sign: {v.callSign} • IMO: {v.imoNumber || '-'} • {v.flag}
                        </span>
                      </td>

                      {/* Dimensions */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-800 block">
                          LOA: {v.loa} m
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Draft: {v.draft} m • Beam: {v.beam} m
                        </span>
                      </td>

                      {/* Berth Slot */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-sky-900 font-mono text-xs block">
                          {v.berthSlot}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Agen: {v.shippingAgent}
                        </span>
                      </td>

                      {/* Quay Cranes */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {v.quayCranesAssigned.length > 0 ? (
                            v.quayCranesAssigned.map((crane) => (
                              <span
                                key={crane}
                                className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-mono font-bold"
                              >
                                {crane}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum dialokasikan</span>
                          )}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-slate-800">
                          <span className="text-slate-400 font-sans">ETA:</span> {v.eta}
                        </div>
                        <div className="text-slate-500">
                          <span className="text-slate-400 font-sans">ETD:</span> {v.etd}
                        </div>
                      </td>

                      {/* Stevedoring Progress */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-700 mb-1">
                          <span>Progress: {pct}%</span>
                          <span>{finishedWork}/{totalWork} TEU</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-teal-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Bongkar: {v.dischargedCount}/{v.totalDischargeTEU} • Muat: {v.loadedCount}/{v.totalLoadTEU}
                        </span>
                      </td>

                      {/* BPH */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-sky-800">
                        {v.bph > 0 ? `${v.bph}` : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusBadge}`}>
                          {v.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(v)}
                            title="Edit Data Kapal"
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(v)}
                            title="Hapus Kapal"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3.5 bg-sky-50/50 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filtered.length} jadwal kapal di dermaga dan area labuh luar</span>
          <span className="font-semibold text-teal-800">
            Dermaga 01 - 04 Beroperasi 24 Jam Nonstop
          </span>
        </div>
      </div>
    </div>
  );
};
