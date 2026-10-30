import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Check } from 'lucide-react';
import { Container, ContainerSize, ContainerType, ContainerStatus, CustomsStatus } from '../../types/terminal';
import { validateContainerNumber } from '../../services/terminalService';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (containerData: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<void>;
  editData?: Container | null;
  vesselsList: { id: string; vesselName: string }[];
  customersList: { id: string; name: string }[];
}

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  vesselsList,
  customersList,
}) => {
  const [containerNumber, setContainerNumber] = useState('');
  const [size, setSize] = useState<ContainerSize>('40ft');
  const [type, setType] = useState<ContainerType>('Dry');
  const [height, setHeight] = useState<'Standard (8.6ft)' | 'High Cube (9.6ft)'>('High Cube (9.6ft)');
  const [status, setStatus] = useState<ContainerStatus>('Import');
  const [isoCode, setIsoCode] = useState('45G1');
  const [weightGross, setWeightGross] = useState<number>(24000);
  const [weightTare, setWeightTare] = useState<number>(3800);
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [sealNumber, setSealNumber] = useState('');
  const [yardBlock, setYardBlock] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');
  const [yardBay, setYardBay] = useState<number>(4);
  const [yardRow, setYardRow] = useState<number>(2);
  const [yardTier, setYardTier] = useState<number>(3);
  const [commodity, setCommodity] = useState('');
  const [isDangerousGoods, setIsDangerousGoods] = useState(false);
  const [imdgClass, setImdgClass] = useState('');
  const [temperatureTarget, setTemperatureTarget] = useState<number>(-20);
  const [vesselId, setVesselId] = useState('');
  const [consignee, setConsignee] = useState('');
  const [customsStatus, setCustomsStatus] = useState<CustomsStatus>('Pending');
  const [dwellDays, setDwellDays] = useState<number>(1);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setContainerNumber(editData.containerNumber);
      setSize(editData.size);
      setType(editData.type);
      setHeight(editData.height);
      setStatus(editData.status);
      setIsoCode(editData.isoCode || '45G1');
      setWeightGross(editData.weightGross);
      setWeightTare(editData.weightTare);
      setShippingLine(editData.shippingLine);
      setSealNumber(editData.sealNumber || '');
      setYardBlock(editData.yardLocation?.block || 'A');
      setYardBay(editData.yardLocation?.bay || 1);
      setYardRow(editData.yardLocation?.row || 1);
      setYardTier(editData.yardLocation?.tier || 1);
      setCommodity(editData.commodity || '');
      setIsDangerousGoods(!!editData.isDangerousGoods);
      setImdgClass(editData.imdgClass || '');
      setTemperatureTarget(editData.temperatureTarget ?? -20);
      setVesselId(editData.vesselId || '');
      setConsignee(editData.consignee || '');
      setCustomsStatus(editData.customsStatus || 'Pending');
      setDwellDays(editData.dwellDays || 1);
    } else {
      // Defaults for new container
      setContainerNumber('');
      setSize('40ft');
      setType('Dry');
      setHeight('High Cube (9.6ft)');
      setStatus('Import');
      setIsoCode('45G1');
      setWeightGross(25000);
      setWeightTare(3900);
      setShippingLine('Maersk Line');
      setSealNumber(`SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setYardBlock('A');
      setYardBay(4);
      setYardRow(2);
      setYardTier(3);
      setCommodity('General Merchandise');
      setIsDangerousGoods(false);
      setImdgClass('');
      setTemperatureTarget(-20);
      setVesselId(vesselsList[0]?.id || '');
      setConsignee(customersList[0]?.name || 'PT Mitra Samudera Abadi');
      setCustomsStatus('SPPB Cleared');
      setDwellDays(1);
    }
    setValidationError(null);
  }, [editData, isOpen, vesselsList, customersList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const val = validateContainerNumber(containerNumber);
    if (!val.valid) {
      setValidationError(val.message || 'Nomor kontainer tidak valid.');
      return;
    }

    if (weightGross <= 0) {
      setValidationError('Berat kotor (gross weight) harus lebih dari 0 kg.');
      return;
    }

    if (weightGross < weightTare) {
      setValidationError('Berat kotor tidak boleh lebih kecil dari berat kosong (tare weight).');
      return;
    }

    if (!commodity.trim()) {
      setValidationError('Nama jenis komoditas muatan wajib diisi.');
      return;
    }

    const selectedVessel = vesselsList.find(v => v.id === vesselId);

    setSaving(true);
    try {
      await onSave({
        containerNumber: containerNumber.trim().toUpperCase(),
        size,
        type,
        height,
        status,
        isoCode,
        weightGross,
        weightTare,
        weightNet: Math.max(0, weightGross - weightTare),
        shippingLine,
        sealNumber: sealNumber.trim() || 'NO-SEAL',
        yardLocation: {
          block: yardBlock,
          bay: Number(yardBay),
          row: Number(yardRow),
          tier: Number(yardTier),
        },
        commodity: commodity.trim(),
        isDangerousGoods,
        imdgClass: isDangerousGoods ? imdgClass : undefined,
        temperatureTarget: type === 'Reefer' ? temperatureTarget : undefined,
        vesselId: vesselId || undefined,
        vesselName: selectedVessel?.vesselName || undefined,
        consignee: consignee.trim() || 'General Cargo Logistics',
        customsStatus,
        dwellDays: Number(dwellDays) || 0,
      }, editData?.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Save className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {editData ? 'Edit Data Master Kontainer' : 'Tambah Kontainer Baru (Entry)'}
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Standarisasi ISO 6346 • Alokasi Lapangan Penumpukan Yard
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-800">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{validationError}</span>
            </div>
          )}

          {/* Section 1: Identification & ISO Specs */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1.5 mb-3">
              1. Identifikasi Petikemas (ISO 6346)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Kontainer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                  placeholder="Contoh: MSKU9281745"
                  maxLength={11}
                  required
                  className="w-full px-3 py-2 text-sm font-mono uppercase font-bold tracking-wider rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 4 Huruf + 7 Angka</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran (Size)</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as ContainerSize)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                >
                  <option value="20ft">20 Feet (1 TEU)</option>
                  <option value="40ft">40 Feet (2 TEU)</option>
                  <option value="45ft">45 Feet (2.25 TEU)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Petikemas</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ContainerType)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                >
                  <option value="Dry">Dry Cargo Standard</option>
                  <option value="Reefer">Reefer (Pendingin)</option>
                  <option value="Open Top">Open Top (Atap Terbuka)</option>
                  <option value="Flat Rack">Flat Rack (Alas Datar)</option>
                  <option value="Tank">Tank Container (ISO Liquid)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tinggi Petikemas</label>
                <select
                  value={height}
                  onChange={(e) => setHeight(e.target.value as 'Standard (8.6ft)' | 'High Cube (9.6ft)')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                >
                  <option value="Standard (8.6ft)">Standard 8.6ft</option>
                  <option value="High Cube (9.6ft)">High Cube 9.6ft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Operasional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-semibold"
                >
                  <option value="Import">Import (Bongkar)</option>
                  <option value="Export">Export (Muat)</option>
                  <option value="Transhipment">Transhipment (Pindah Kapal)</option>
                  <option value="Empty">Empty (Kosong / Relokasi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Line / Operator</label>
                <input
                  type="text"
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  placeholder="Maersk, Meratus, Samudera, ONE..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Weight & Seal */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1.5 mb-3">
              2. Berat (Timbangan) & Segel Pengaman
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Berat Kotor (Gross kg)</label>
                <input
                  type="number"
                  min={100}
                  max={45000}
                  value={weightGross}
                  onChange={(e) => setWeightGross(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Berat Kosong (Tare kg)</label>
                <input
                  type="number"
                  min={500}
                  max={10000}
                  value={weightTare}
                  onChange={(e) => setWeightTare(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Berat Bersih (Netto)</label>
                <div className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 border border-slate-200 font-mono font-semibold text-slate-700">
                  {Math.max(0, weightGross - weightTare).toLocaleString('id-ID')} kg
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Segel (Seal No.)</label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="ML-ID-99214"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Yard Stacking Allocation */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1.5 mb-3">
              3. Alokasi Lapangan Penumpukan (Yard Block Allocation)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blok Yard</label>
                <select
                  value={yardBlock}
                  onChange={(e) => setYardBlock(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' | 'F')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-bold text-sky-800"
                >
                  <option value="A">Blok A (Dry Import High)</option>
                  <option value="B">Blok B (Reefer Cold Plug)</option>
                  <option value="C">Blok C (Export General)</option>
                  <option value="D">Blok D (OOG & Special)</option>
                  <option value="E">Blok E (Empty Depo)</option>
                  <option value="F">Blok F (Dangerous Goods)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bay (1 - 24)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={yardBay}
                  onChange={(e) => setYardBay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Row (1 - 6)</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={yardRow}
                  onChange={(e) => setYardRow(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tier / Tingkat (1 - 5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={yardTier}
                  onChange={(e) => setYardTier(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Commodity, Customs & Vessel Association */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 border-b border-sky-100 pb-1.5 mb-3">
              4. Komoditas, Kepabeanan & Asosiasi Kapal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Komoditas Muatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder="Contoh: Spareparts Otomotif, Garment, CPO..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shipper / Consignee / EMKL</label>
                <input
                  type="text"
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                  placeholder="Nama perusahaan penerima / pengirim"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kapal Pengangkut (Vessel)</label>
                <select
                  value={vesselId}
                  onChange={(e) => setVesselId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-medium"
                >
                  <option value="">-- Pilih Kapal Terkait --</option>
                  {vesselsList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vesselName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Bea Cukai (Customs)</label>
                <select
                  value={customsStatus}
                  onChange={(e) => setCustomsStatus(e.target.value as CustomsStatus)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-semibold"
                >
                  <option value="SPPB Cleared">SPPB Cleared (Jalur Hijau)</option>
                  <option value="Yellow Line">Jalur Kuning (Dokumen)</option>
                  <option value="Red Line Inspection">Jalur Merah (Pemeriksaan Fisik)</option>
                  <option value="Hold">Hold / Penahanan Petugas</option>
                  <option value="Pending">Pending Konfirmasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dwelling Time (Hari)</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={dwellDays}
                  onChange={(e) => setDwellDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20 font-mono"
                />
              </div>
            </div>

            {/* Special handling for Reefer & DG */}
            <div className="mt-3 p-3 rounded-xl bg-sky-50/50 border border-sky-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dgCheck"
                  checked={isDangerousGoods}
                  onChange={(e) => setIsDangerousGoods(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="dgCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Muatan Berbahaya (IMDG Dangerous Goods)
                </label>
              </div>

              {isDangerousGoods && (
                <div>
                  <input
                    type="text"
                    value={imdgClass}
                    onChange={(e) => setImdgClass(e.target.value)}
                    placeholder="Contoh: Class 3 - Flammable Liquid"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-300 bg-white"
                  />
                </div>
              )}

              {type === 'Reefer' && (
                <div className="col-span-full flex items-center gap-3 pt-1 border-t border-sky-200">
                  <span className="text-xs font-bold text-sky-900">Target Suhu Reefer:</span>
                  <input
                    type="number"
                    step={0.5}
                    value={temperatureTarget}
                    onChange={(e) => setTemperatureTarget(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-xs rounded-lg border border-sky-300 font-mono bg-white"
                  />
                  <span className="text-xs text-slate-500">°C (Celsius)</span>
                </div>
              )}
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
                  <span>{editData ? 'Simpan Perubahan' : 'Daftarkan Kontainer'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
