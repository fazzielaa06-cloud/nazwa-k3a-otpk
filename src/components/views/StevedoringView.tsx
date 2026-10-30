import React, { useState } from 'react';
import { StevedoringJob } from '../../types/terminal';
import { 
  Plus, 
  Search, 
  Layers, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Zap,
  Download
} from 'lucide-react';

interface StevedoringViewProps {
  jobs: StevedoringJob[];
  onAddNew: () => void;
  onEdit: (job: StevedoringJob) => void;
  onDelete: (job: StevedoringJob) => void;
  onQuickComplete: (job: StevedoringJob) => void;
}

export const StevedoringView: React.FC<StevedoringViewProps> = ({
  jobs,
  onAddNew,
  onEdit,
  onDelete,
  onQuickComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = jobs.filter((j) => {
    const matchesSearch = 
      j.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.quayCraneId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || j.jobType === filterType;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = ['ID Job', 'Tipe Operasi', 'Nomor Kontainer', 'Kapal', 'Alat Berat / Crane', 'Lokasi Asal', 'Lokasi Tujuan', 'Operator', 'Cycle Time (Menit)', 'Status', 'Selesai Pada'];
    const rows = filtered.map(j => [
      j.id,
      j.jobType,
      j.containerNumber,
      `"${j.vesselName}"`,
      j.quayCraneId,
      `"${j.originLocation}"`,
      `"${j.destinationLocation}"`,
      `"${j.operator}"`,
      j.cycleTimeMinutes,
      j.status,
      j.completedAt || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tugas_Stevedoring_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Operasi Bongkar Muat & Shifting (Stevedoring)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen Quay Crane, RTG, Reach Stacker dan pemindahan kontainer antara kapal & lapangan
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
            <span>Tugas Bongkar Muat Baru</span>
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
            placeholder="Cari kontainer, kapal, crane, operator..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Jenis Tugas Stevedoring</option>
            <option value="DISCHARGE">DISCHARGE (Bongkar Kapal)</option>
            <option value="LOAD">LOAD (Muat ke Kapal)</option>
            <option value="SHIFTING">SHIFTING (Relokasi Yard)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-50/80 border-b border-sky-100 text-sky-950 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tipe Job</th>
                <th className="py-3 px-4">Nomor Kontainer</th>
                <th className="py-3 px-4">Kapal Terkait</th>
                <th className="py-3 px-4">Alat Berat / Crane</th>
                <th className="py-3 px-4">Pergerakan (Asal → Tujuan)</th>
                <th className="py-3 px-4">Operator & Cycle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada tugas stevedoring yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((j) => {
                  let jobBadge = 'bg-sky-100 text-sky-800 border-sky-300';
                  if (j.jobType === 'LOAD') jobBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  if (j.jobType === 'SHIFTING') jobBadge = 'bg-purple-100 text-purple-800 border-purple-300';

                  let statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                  if (j.status === 'Completed') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (j.status === 'Queued') statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (j.status === 'Aborted') statusBadge = 'bg-red-100 text-red-800 border-red-200';

                  return (
                    <tr key={j.id} className="hover:bg-sky-50/40 transition">
                      {/* Job Type */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${jobBadge}`}>
                          {j.jobType}
                        </span>
                      </td>

                      {/* Container */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-sm text-slate-900 block">
                          {j.containerNumber}
                        </span>
                      </td>

                      {/* Vessel */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {j.vesselName}
                        </span>
                      </td>

                      {/* Crane */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sky-900 block">
                          {j.quayCraneId}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {j.equipmentUsed}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-slate-500 truncate max-w-[180px]">
                          Dari: {j.originLocation}
                        </div>
                        <div className="text-sky-800 font-bold flex items-center gap-1 truncate max-w-[180px]">
                          <ArrowRight className="w-3 h-3 text-sky-600 shrink-0" />
                          <span>Ke: {j.destinationLocation}</span>
                        </div>
                      </td>

                      {/* Operator & Cycle */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">
                          {j.operator}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 block">
                          ⚡ {j.cycleTimeMinutes} mnt/box
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                          {j.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {j.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => onQuickComplete(j)}
                              title="Tandai Selesai"
                              className="px-2 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onEdit(j)}
                            title="Edit Job"
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(j)}
                            title="Hapus Job"
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
          <span>Menampilkan {filtered.length} tugas operasional crane terminal</span>
          <span className="font-semibold text-sky-800 font-mono">
            Rata-rata Cycle Time: 2.1 Menit / Box
          </span>
        </div>
      </div>
    </div>
  );
};
