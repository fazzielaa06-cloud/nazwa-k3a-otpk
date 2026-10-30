import React, { useState } from 'react';
import { Container, ContainerStatus, ContainerSize } from '../../types/terminal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  ThermometerSnowflake,
  Layers,
  MapPin
} from 'lucide-react';

interface MasterContainersViewProps {
  containers: Container[];
  onAddNew: () => void;
  onEdit: (container: Container) => void;
  onDelete: (container: Container) => void;
  onViewYard: (container: Container) => void;
}

export const MasterContainersView: React.FC<MasterContainersViewProps> = ({
  containers,
  onAddNew,
  onEdit,
  onDelete,
  onViewYard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSize, setFilterSize] = useState<string>('ALL');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');

  // Filtered list
  const filtered = containers.filter(c => {
    const matchesSearch = 
      c.containerNumber.includes(searchTerm.toUpperCase()) ||
      c.shippingLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.consignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commodity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSize = filterSize === 'ALL' || c.size === filterSize;
    const matchesBlock = filterBlock === 'ALL' || c.yardLocation.block === filterBlock;

    return matchesSearch && matchesStatus && matchesSize && matchesBlock;
  });

  const exportCSV = () => {
    const headers = ['Nomor Kontainer', 'Ukuran', 'Tipe', 'Tinggi', 'Status', 'Berat Kotor (kg)', 'Berat Netto (kg)', 'Shipping Line', 'Segel', 'Blok Yard', 'Bay', 'Row', 'Tier', 'Komoditas', 'Bea Cukai', 'Dwell Days'];
    const rows = filtered.map(c => [
      c.containerNumber,
      c.size,
      c.type,
      c.height,
      c.status,
      c.weightGross,
      c.weightNet,
      `"${c.shippingLine}"`,
      c.sealNumber,
      c.yardLocation.block,
      c.yardLocation.bay,
      c.yardLocation.row,
      c.yardLocation.tier,
      `"${c.commodity}"`,
      c.customsStatus,
      c.dwellDays,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Kontainer_TOS_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
            Master Data Petikemas (Containers)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen inventaris kontainer di terminal pelabuhan • Standar ISO 6346
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
            <span>Tambah Kontainer Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-sky-100 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor box, shipper, pelayaran..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Status (Import/Export/Empty)</option>
            <option value="Import">Import (Bongkar)</option>
            <option value="Export">Export (Muat)</option>
            <option value="Transhipment">Transhipment</option>
            <option value="Empty">Empty (Kosong)</option>
          </select>
        </div>

        {/* Size Filter */}
        <div>
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Ukuran (20/40/45ft)</option>
            <option value="20ft">20 Feet (1 TEU)</option>
            <option value="40ft">40 Feet (2 TEU)</option>
            <option value="45ft">45 Feet (2.25 TEU)</option>
          </select>
        </div>

        {/* Yard Block Filter */}
        <div>
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Blok Yard (A - F)</option>
            <option value="A">Blok A (Dry Import)</option>
            <option value="B">Blok B (Reefer Cold)</option>
            <option value="C">Blok C (Export)</option>
            <option value="D">Blok D (OOG / Tank)</option>
            <option value="E">Blok E (Empty)</option>
            <option value="F">Blok F (Hazmat DG)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-50/80 border-b border-sky-100 text-sky-950 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nomor Kontainer</th>
                <th className="py-3 px-4">Spesifikasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Lokasi Yard (Slot)</th>
                <th className="py-3 px-4">Berat Kotor</th>
                <th className="py-3 px-4">Pelayaran & Shipper</th>
                <th className="py-3 px-4">Bea Cukai</th>
                <th className="py-3 px-4 text-center">Inap</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ada kontainer yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  let statusBg = 'bg-sky-100 text-sky-800 border-sky-200';
                  if (c.status === 'Export') statusBg = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (c.status === 'Empty') statusBg = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (c.status === 'Transhipment') statusBg = 'bg-purple-100 text-purple-800 border-purple-200';

                  let customsBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (c.customsStatus === 'Red Line Inspection') customsBadge = 'bg-red-50 text-red-700 border-red-200';
                  if (c.customsStatus === 'Yellow Line') customsBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (c.customsStatus === 'Hold') customsBadge = 'bg-purple-50 text-purple-700 border-purple-200';

                  return (
                    <tr key={c.id} className="hover:bg-sky-50/40 transition">
                      {/* Container Number */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-sky-950">
                            {c.containerNumber}
                          </span>
                          {c.isDangerousGoods && (
                            <span title="Dangerous Goods (IMDG)" className="text-amber-600 bg-amber-50 p-0.5 rounded">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {c.type === 'Reefer' && (
                            <span title="Reefer Container" className="text-cyan-600 bg-cyan-50 p-0.5 rounded">
                              <ThermometerSnowflake className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Seal: {c.sealNumber || 'NO-SEAL'}
                        </span>
                      </td>

                      {/* Specs */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {c.size} {c.type}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {c.height} • {c.isoCode || '22G1'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusBg}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Yard Location */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onViewYard(c)}
                          className="group flex items-center gap-1.5 text-xs font-mono font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition" />
                          <span>
                            {c.yardLocation.block}-{String(c.yardLocation.bay).padStart(2, '0')}-{String(c.yardLocation.row).padStart(2, '0')}-T{c.yardLocation.tier}
                          </span>
                        </button>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-800 block">
                          {c.weightGross.toLocaleString('id-ID')} kg
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Net: {c.weightNet.toLocaleString('id-ID')} kg
                        </span>
                      </td>

                      {/* Shipping Line & Consignee */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-[150px]">
                          {c.shippingLine}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                          {c.consignee}
                        </span>
                      </td>

                      {/* Customs */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${customsBadge}`}>
                          {c.customsStatus}
                        </span>
                      </td>

                      {/* Dwell Days */}
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={c.dwellDays > 5 ? 'text-amber-600' : 'text-slate-700'}>
                          {c.dwellDays} hr
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(c)}
                            title="Edit Data Kontainer"
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(c)}
                            title="Hapus Kontainer"
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

        {/* Table Summary Footer */}
        <div className="px-5 py-3.5 bg-sky-50/50 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filtered.length} dari total {containers.length} kontainer aktif di database</span>
          <span className="font-mono font-semibold text-sky-800">
            Total Berat: {(filtered.reduce((sum, c) => sum + c.weightGross, 0) / 1000).toLocaleString('id-ID')} Tonase
          </span>
        </div>
      </div>
    </div>
  );
};
