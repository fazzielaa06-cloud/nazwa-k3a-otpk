import React, { useState } from 'react';
import { GateTransaction, GateTransactionType } from '../../types/terminal';
import { 
  Plus, 
  Search, 
  Truck, 
  Printer, 
  Edit3, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface GateTransactionsViewProps {
  transactions: GateTransaction[];
  onAddNew: () => void;
  onEdit: (tx: GateTransaction) => void;
  onDelete: (tx: GateTransaction) => void;
  onPrintEir: (tx: GateTransaction) => void;
}

export const GateTransactionsView: React.FC<GateTransactionsViewProps> = ({
  transactions,
  onAddNew,
  onEdit,
  onDelete,
  onPrintEir,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = transactions.filter((t) => {
    const matchesSearch = 
      t.eirNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.emklCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = ['Nomor EIR', 'Waktu', 'Jenis Transaksi', 'Nomor Kontainer', 'No Polisi Truk', 'Supir', 'No HP', 'EMKL', 'Segel', 'Inspeksi Fisik', 'Timbang Gross (kg)', 'Tara Truk (kg)', 'Netto (kg)', 'Alokasi Yard', 'Jalur Gate', 'Petugas', 'Status'];
    const rows = filtered.map(t => [
      t.eirNumber,
      t.timestamp,
      t.type,
      t.containerNumber,
      t.truckNumber,
      `"${t.driverName}"`,
      t.driverPhone,
      `"${t.emklCompany}"`,
      t.sealNumber,
      `"${t.physicalInspection}"`,
      t.weightGross,
      t.weightTruckTare,
      t.weightNetContainer,
      `"${t.assignedYardLocation}"`,
      t.gateLane,
      `"${t.operatorName}"`,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transaksi_Gate_EIR_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Transaksi Pintu Gerbang & EIR (Gate In / Gate Out)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan jembatan timbang truk, inspeksi fisik segel & Equipment Interchange Receipt
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
            <span>Entri Transaksi Gate Baru</span>
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
            placeholder="Cari no EIR, nomor box, plat nomor, supir..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Jenis Transaksi Gate</option>
            <option value="GATE_IN_IMPORT">Gate In - Bongkar Impor</option>
            <option value="GATE_IN_EXPORT">Gate In - Muatan Ekspor</option>
            <option value="GATE_OUT_IMPORT">Gate Out - Impor Keluar</option>
            <option value="GATE_OUT_EMPTY">Gate Out - Empty Depo</option>
            <option value="GATE_OUT_EXPORT">Gate Out - Ekspor Batal</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-50/80 border-b border-sky-100 text-sky-950 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nomor EIR & Waktu</th>
                <th className="py-3 px-4">Jenis Transaksi</th>
                <th className="py-3 px-4">Nomor Petikemas</th>
                <th className="py-3 px-4">Truk & Pengemudi</th>
                <th className="py-3 px-4">Hasil Timbangan</th>
                <th className="py-3 px-4">Segel & Fisik</th>
                <th className="py-3 px-4">Lokasi Yard / Tujuan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi EIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ada transaksi gerbang yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isInbound = t.type.startsWith('GATE_IN');
                  let typeBadge = isInbound 
                    ? 'bg-sky-100 text-sky-800 border-sky-300' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300';

                  let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (t.status === 'In Yard') statusBadge = 'bg-sky-100 text-sky-800 border-sky-200';
                  if (t.status === 'Rejected') statusBadge = 'bg-red-100 text-red-800 border-red-200';

                  return (
                    <tr key={t.id} className="hover:bg-sky-50/40 transition">
                      {/* EIR & Time */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-sm text-slate-900 block">
                          {t.eirNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {t.timestamp.slice(0, 16)} WIB
                        </span>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeBadge}`}>
                          {t.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {t.gateLane}
                        </span>
                      </td>

                      {/* Container Number */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sm text-sky-950 block">
                          {t.containerNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                          {t.emklCompany}
                        </span>
                      </td>

                      {/* Truck & Driver */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {t.truckNumber}
                        </span>
                        <span className="text-[11px] text-slate-600 block">
                          {t.driverName}
                        </span>
                      </td>

                      {/* Weight Breakdown */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-bold text-slate-800 block">
                          Gross: {t.weightGross.toLocaleString('id-ID')} kg
                        </span>
                        <span className="text-[10px] text-sky-700 block">
                          Netto: {t.weightNetContainer.toLocaleString('id-ID')} kg
                        </span>
                      </td>

                      {/* Seal & Inspection */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-800 block">
                          {t.sealNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {t.physicalInspection}
                        </span>
                      </td>

                      {/* Yard Location */}
                      <td className="py-3 px-4 text-xs font-mono font-bold text-sky-900">
                        {t.assignedYardLocation}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                          {t.status}
                        </span>
                      </td>

                      {/* Action & Print EIR */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPrintEir(t)}
                            title="Cetak EIR Digital"
                            className="px-2.5 py-1 text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(t)}
                            title="Edit Data Transaksi"
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(t)}
                            title="Hapus Transaksi"
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
          <span>Menampilkan {filtered.length} riwayat transaksi pintu gerbang</span>
          <span className="font-semibold text-indigo-900">
            Terhubung Langsung dengan Kamera OCR & Sensor Jembatan Timbang
          </span>
        </div>
      </div>
    </div>
  );
};
