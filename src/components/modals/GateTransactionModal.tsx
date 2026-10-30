import React, { useState, useEffect } from 'react';
import { X, Truck, Check, AlertCircle } from 'lucide-react';
import { GateTransaction, GateTransactionType } from '../../types/terminal';
import { validateContainerNumber } from '../../services/terminalService';

interface GateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<GateTransaction, 'id' | 'eirNumber' | 'timestamp'>, existingId?: string) => Promise<void>;
  editData?: GateTransaction | null;
  containersList: { id: string; containerNumber: string; size: string; status: string }[];
  customersList: { id: string; name: string }[];
}

export const GateTransactionModal: React.FC<GateTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  containersList,
  customersList,
}) => {
  const [type, setType] = useState<GateTransactionType>('GATE_IN_IMPORT');
  const [containerNumber, setContainerNumber] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [emklCompany, setEmklCompany] = useState('');
  const [doNumber, setDoNumber] = useState('');
  const [sp2Number, setSp2Number] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [physicalInspection, setPhysicalInspection] = useState<GateTransaction['physicalInspection']>('Baik & Utuh');
  const [weightGross, setWeightGross] = useState<number>(36000);
  const [weightTruckTare, setWeightTruckTare] = useState<number>(12000);
  const [assignedYardLocation, setAssignedYardLocation] = useState('Blok A - Bay 04 - Row 02 - Tier 03');
  const [gateLane, setGateLane] = useState<GateTransaction['gateLane']>('Gate 01 (Inbound)');
  const [status, setStatus] = useState<GateTransaction['status']>('In Yard');
  const [operatorName, setOperatorName] = useState('Agus Pratama');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setContainerNumber(editData.containerNumber);
      setTruckNumber(editData.truckNumber);
      setDriverName(editData.driverName);
      setDriverPhone(editData.driverPhone);
      setDriverLicense(editData.driverLicense);
      setEmklCompany(editData.emklCompany);
      setDoNumber(editData.doNumber || '');
      setSp2Number(editData.sp2Number || '');
      setSealNumber(editData.sealNumber);
      setPhysicalInspection(editData.physicalInspection);
      setWeightGross(editData.weightGross);
      setWeightTruckTare(editData.weightTruckTare);
      setAssignedYardLocation(editData.assignedYardLocation);
      setGateLane(editData.gateLane);
      setStatus(editData.status);
      setOperatorName(editData.operatorName);
    } else {
      setType('GATE_IN_IMPORT');
      setContainerNumber(containersList[0]?.containerNumber || '');
      setTruckNumber('B 9821 UY');
      setDriverName('M. Syafi\'i');
      setDriverPhone('0812-8899-7711');
      setDriverLicense('SIM B2 Umum 9821039841');
      setEmklCompany(customersList[0]?.name || 'PT Mitra Samudera Abadi');
      setDoNumber(`DO/JKT/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`);
      setSp2Number(`SP2/TOS/${Math.floor(10000 + Math.random() * 90000)}`);
      setSealNumber(`SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setPhysicalInspection('Baik & Utuh');
      setWeightGross(38000);
      setWeightTruckTare(12200);
      setAssignedYardLocation('Blok A - Bay 06 - Row 02 - Tier 02');
      setGateLane('Gate 01 (Inbound)');
      setStatus('In Yard');
      setOperatorName('Agus Pratama');
    }
    setValidationError(null);
  }, [editData, isOpen, containersList, customersList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const val = validateContainerNumber(containerNumber);
    if (!val.valid) {
      setValidationError(val.message || 'Nomor kontainer tidak valid.');
      return;
    }

    if (!truckNumber.trim()) {
      setValidationError('Nomor polisi truk wajib diisi.');
      return;
    }

    if (!driverName.trim()) {
      setValidationError('Nama pengemudi truk wajib diisi.');
      return;
    }

    if (weightGross <= weightTruckTare) {
      setValidationError('Berat kotor timbangan (Gross) harus lebih besar dari berat tara truk!');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        type,
        containerNumber: containerNumber.trim().toUpperCase(),
        truckNumber: truckNumber.trim().toUpperCase(),
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        driverLicense: driverLicense.trim(),
        emklCompany: emklCompany.trim(),
        doNumber: doNumber.trim() || undefined,
        sp2Number: sp2Number.trim() || undefined,
        sealNumber: sealNumber.trim() || 'NO-SEAL',
        physicalInspection,
        weightGross: Number(weightGross),
        weightTruckTare: Number(weightTruckTare),
        weightNetContainer: Math.max(0, Number(weightGross) - Number(weightTruckTare)),
        assignedYardLocation: assignedYardLocation.trim(),
        gateLane,
        status,
        operatorName: operatorName.trim() || 'Gate Operator',
      }, editData?.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Gagal memproses transaksi gerbang.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Truck className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {editData ? 'Edit Transaksi Gate EIR' : 'Entri Transaksi Gate In / Gate Out'}
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Pemeriksaan Fisik • Penimbangan Truk • Equipment Interchange Receipt (EIR)
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Transaksi Gerbang</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as GateTransactionType;
                  setType(newType);
                  if (newType.startsWith('GATE_IN')) {
                    setGateLane('Gate 01 (Inbound)');
                    setStatus('In Yard');
                  } else {
                    setGateLane('Gate 03 (Outbound)');
                    setStatus('Completed');
                  }
                }}
                className="w-full px-3 py-2 text-sm font-bold text-sky-900 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/30"
              >
                <option value="GATE_IN_IMPORT">GATE IN - Bongkar Impor (Masuk Yard)</option>
                <option value="GATE_IN_EXPORT">GATE IN - Muatan Ekspor (Masuk Yard)</option>
                <option value="GATE_OUT_IMPORT">GATE OUT - Pengeluaran Impor (Keluar Terminal)</option>
                <option value="GATE_OUT_EMPTY">GATE OUT - Petikemas Kosong (Depo Eksternal)</option>
                <option value="GATE_OUT_EXPORT">GATE OUT - Ekspor Batal / Relokasi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gate Lane / Jalur Gerbang</label>
              <select
                value={gateLane}
                onChange={(e) => setGateLane(e.target.value as GateTransaction['gateLane'])}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              >
                <option value="Gate 01 (Inbound)">Gate 01 (Inbound Barat)</option>
                <option value="Gate 02 (Inbound)">Gate 02 (Inbound Timur)</option>
                <option value="Gate 03 (Outbound)">Gate 03 (Outbound Utama)</option>
                <option value="Gate 04 (Outbound)">Gate 04 (Outbound Khusus Empty)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Petikemas (ISO 6346) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                placeholder="Contoh: MSKU9281745"
                required
                className="w-full px-3 py-2 text-sm font-mono font-bold uppercase rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Polisi Truk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value.toUpperCase())}
                placeholder="Contoh: B 9283 UY"
                required
                className="w-full px-3 py-2 text-sm font-mono font-bold uppercase rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Supir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Nama Pengemudi"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. HP Supir</label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor SIM Supir</label>
              <input
                type="text"
                value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value)}
                placeholder="SIM B2 Umum ..."
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Perusahaan EMKL / Trucking</label>
              <input
                type="text"
                value={emklCompany}
                onChange={(e) => setEmklCompany(e.target.value)}
                placeholder="PT Mitra Samudera..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor DO / Booking</label>
              <input
                type="text"
                value={doNumber}
                onChange={(e) => setDoNumber(e.target.value)}
                placeholder="DO/2026/..."
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Segel (Seal No.)</label>
              <input
                type="text"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                placeholder="ML-ID-99214"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-sky-900">
              Jembatan Timbang & Pengecekan Fisik
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Timbang Total (Gross kg)</label>
                <input
                  type="number"
                  value={weightGross}
                  onChange={(e) => setWeightGross(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-sky-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tara Truk (kg)</label>
                <input
                  type="number"
                  value={weightTruckTare}
                  onChange={(e) => setWeightTruckTare(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-sky-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Netto Muatan Kontainer</label>
                <div className="w-full px-3 py-1.5 text-xs font-mono font-bold text-sky-800 bg-sky-100/70 rounded-lg border border-sky-200">
                  {Math.max(0, weightGross - weightTruckTare).toLocaleString('id-ID')} kg
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Hasil Inspeksi Fisik Segel & Box</label>
                <select
                  value={physicalInspection}
                  onChange={(e) => setPhysicalInspection(e.target.value as GateTransaction['physicalInspection'])}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-sky-200 bg-white"
                >
                  <option value="Baik & Utuh">Baik & Utuh (Clean & Sound)</option>
                  <option value="Penyok Ringan">Penyok Ringan (Dented Roof/Wall)</option>
                  <option value="Pintu Rusak">Pintu / Handle Rusak</option>
                  <option value="Karat Parah">Karat Parah / Keropos</option>
                  <option value="Seal Rusak">Segel Rusak / Segel Tidak Cocok</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Lokasi Yard / Tujuan Pengiriman</label>
                <input
                  type="text"
                  value={assignedYardLocation}
                  onChange={(e) => setAssignedYardLocation(e.target.value)}
                  placeholder="Blok A - Bay 04 - Row 02"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-sky-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Gate / Timbangan</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Transaksi</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GateTransaction['status'])}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-sky-200 bg-sky-50/20"
              >
                <option value="In Yard">In Yard (Berada di Dalam Terminal)</option>
                <option value="Completed">Completed (Truk Selesai & Keluar)</option>
                <option value="Processing">Processing (Sedang Diperiksa)</option>
                <option value="Rejected">Rejected (Ditolak / Segel Rusak)</option>
              </select>
            </div>
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
                  <span>{editData ? 'Simpan Perubahan' : 'Terbitkan EIR & Simpan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
