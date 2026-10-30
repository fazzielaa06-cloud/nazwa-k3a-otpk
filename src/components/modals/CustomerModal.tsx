import React, { useState, useEffect } from 'react';
import { X, Building2, Check, AlertCircle } from 'lucide-react';
import { CustomerEMKL } from '../../types/terminal';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CustomerEMKL, 'id' | 'createdAt'>, existingId?: string) => Promise<void>;
  editData?: CustomerEMKL | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [npwp, setNpwp] = useState('');
  const [pic, setPic] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditStatus, setCreditStatus] = useState<CustomerEMKL['creditStatus']>('Good');
  const [activeShipments, setActiveShipments] = useState<number>(10);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setCode(editData.code);
      setName(editData.name);
      setNpwp(editData.npwp);
      setPic(editData.pic);
      setPhone(editData.phone);
      setEmail(editData.email);
      setAddress(editData.address);
      setCreditStatus(editData.creditStatus);
      setActiveShipments(editData.activeShipments);
    } else {
      setCode(`EMKL-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setNpwp('01.234.567.8-012.000');
      setPic('');
      setPhone('+62 812-');
      setEmail('');
      setAddress('Kawasan Pelabuhan, Jakarta Utara');
      setCreditStatus('Good');
      setActiveShipments(5);
    }
    setValidationError(null);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Nama perusahaan EMKL wajib diisi.');
      return;
    }
    if (!code.trim()) {
      setValidationError('Kode EMKL wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        npwp: npwp.trim(),
        pic: pic.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        creditStatus,
        activeShipments: Number(activeShipments),
      }, editData?.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Gagal menyimpan data EMKL.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Building2 className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {editData ? 'Edit Data Mitra EMKL' : 'Daftarkan Mitra EMKL / Shipper Baru'}
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Ekspedisi Muatan Kapal Laut • Verifikasi NPWP & Plafon Kredit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-800">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode EMKL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EMKL-MSA"
                required
                className="w-full px-3 py-2 text-sm font-mono font-bold uppercase rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Kredit / Billing</label>
              <select
                value={creditStatus}
                onChange={(e) => setCreditStatus(e.target.value as CustomerEMKL['creditStatus'])}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-sky-200 bg-sky-50/20"
              >
                <option value="Good">Good (Lancar / Plafon Aktif)</option>
                <option value="Warning">Warning (Mendekati Batas Jatuh Tempo)</option>
                <option value="Blocked">Blocked (Diblokir / Menunggak)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Perusahaan EMKL / Forwarder <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: PT Mitra Samudera Abadi"
              required
              className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-sky-200 bg-sky-50/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NPWP Perusahaan</label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                placeholder="01.234.567.8-012.000"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Person In Charge (PIC)</label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Nama Kontak Utama"
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812-..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email Billing/Ops</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@perusahaan.co.id"
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kantor</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Alamat lengkap kantor pusat atau perwakilan..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Kontainer Aktif di Terminal</label>
            <input
              type="number"
              value={activeShipments}
              onChange={(e) => setActiveShipments(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 bg-sky-50/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-sky-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-md shadow-sky-600/20 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editData ? 'Simpan Perubahan' : 'Daftarkan Mitra'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
