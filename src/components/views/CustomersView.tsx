import React, { useState } from 'react';
import { CustomerEMKL } from '../../types/terminal';
import { 
  Plus, 
  Search, 
  Building2, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Download,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface CustomersViewProps {
  customers: CustomerEMKL[];
  onAddNew: () => void;
  onEdit: (customer: CustomerEMKL) => void;
  onDelete: (customer: CustomerEMKL) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCredit, setFilterCredit] = useState<string>('ALL');

  const filtered = customers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.npwp.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCredit = filterCredit === 'ALL' || c.creditStatus === filterCredit;
    return matchesSearch && matchesCredit;
  });

  const exportCSV = () => {
    const headers = ['Kode EMKL', 'Nama Perusahaan', 'NPWP', 'PIC', 'Telepon', 'Email', 'Alamat', 'Status Kredit', 'Pengiriman Aktif'];
    const rows = filtered.map(c => [
      c.code,
      `"${c.name}"`,
      c.npwp,
      `"${c.pic}"`,
      c.phone,
      c.email,
      `"${c.address}"`,
      c.creditStatus,
      c.activeShipments,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Mitra_EMKL_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Master Mitra EMKL & Perusahaan Ekspedisi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen pelanggan, forwarder, kepatuhan perpajakan (NPWP) dan status plafon kredit
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
            <span>Daftarkan Mitra Baru</span>
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
            placeholder="Cari kode, nama EMKL, PIC, NPWP..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={filterCredit}
            onChange={(e) => setFilterCredit(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
          >
            <option value="ALL">Semua Status Kredit</option>
            <option value="Good">Good (Lancar)</option>
            <option value="Warning">Warning (Peringatan Jatuh Tempo)</option>
            <option value="Blocked">Blocked (Diblokir)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-50/80 border-b border-sky-100 text-sky-950 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Kode & Nama Perusahaan</th>
                <th className="py-3 px-4">NPWP Resmi</th>
                <th className="py-3 px-4">Kontak PIC & Telp</th>
                <th className="py-3 px-4">Email Operasional</th>
                <th className="py-3 px-4">Alamat Kantor</th>
                <th className="py-3 px-4 text-center">Kontainer Aktif</th>
                <th className="py-3 px-4">Status Kredit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada mitra EMKL yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  let creditBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (c.creditStatus === 'Warning') creditBadge = 'bg-amber-100 text-amber-800 border-amber-200';
                  if (c.creditStatus === 'Blocked') creditBadge = 'bg-red-100 text-red-800 border-red-200';

                  return (
                    <tr key={c.id} className="hover:bg-sky-50/40 transition">
                      {/* Name & Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <span className="font-bold text-sm text-slate-900">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-sky-700 block mt-0.5">
                          {c.code}
                        </span>
                      </td>

                      {/* NPWP */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {c.npwp}
                      </td>

                      {/* PIC & Phone */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {c.pic}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {c.phone}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {c.email}
                      </td>

                      {/* Address */}
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                        {c.address}
                      </td>

                      {/* Active shipments */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-sky-800">
                        {c.activeShipments} Box
                      </td>

                      {/* Credit Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${creditBadge}`}>
                          {c.creditStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(c)}
                            title="Edit Data EMKL"
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(c)}
                            title="Hapus Data EMKL"
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
          <span>Menampilkan {filtered.length} mitra ekspedisi muatan kapal laut</span>
          <span className="font-semibold text-sky-800">
            Terintegrasi dengan INSW (Indonesia National Single Window)
          </span>
        </div>
      </div>
    </div>
  );
};
