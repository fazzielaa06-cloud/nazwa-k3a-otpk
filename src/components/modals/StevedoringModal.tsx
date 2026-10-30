import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Layers } from 'lucide-react';
import { StevedoringJob } from '../../types/terminal';

interface StevedoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StevedoringJob, 'id' | 'createdAt'>, existingId?: string) => Promise<void>;
  editData?: StevedoringJob | null;
  containersList: { id: string; containerNumber: string }[];
  vesselsList: { id: string; vesselName: string }[];
}

export const StevedoringModal: React.FC<StevedoringModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  containersList,
  vesselsList,
}) => {
  const [jobType, setJobType] = useState<StevedoringJob['jobType']>('DISCHARGE');
  const [containerNumber, setContainerNumber] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [quayCraneId, setQuayCraneId] = useState('QC-01');
  const [originLocation, setOriginLocation] = useState('Bay 12, Row 02, Tier 82 (Palka 2)');
  const [destinationLocation, setDestinationLocation] = useState('Blok A, Bay 06, Row 02, Tier 3');
  const [status, setStatus] = useState<StevedoringJob['status']>('In Progress');
  const [equipmentUsed, setEquipmentUsed] = useState<StevedoringJob['equipmentUsed']>('Quay Crane');
  const [operator, setOperator] = useState('Supriyanto');
  const [cycleTimeMinutes, setCycleTimeMinutes] = useState<number>(2.2);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setJobType(editData.jobType);
      setContainerNumber(editData.containerNumber);
      setVesselName(editData.vesselName);
      setQuayCraneId(editData.quayCraneId);
      setOriginLocation(editData.originLocation);
      setDestinationLocation(editData.destinationLocation);
      setStatus(editData.status);
      setEquipmentUsed(editData.equipmentUsed);
      setOperator(editData.operator);
      setCycleTimeMinutes(editData.cycleTimeMinutes);
    } else {
      setJobType('DISCHARGE');
      setContainerNumber(containersList[0]?.containerNumber || '');
      setVesselName(vesselsList[0]?.vesselName || 'MV MERATUS SUMATRA');
      setQuayCraneId('QC-01');
      setOriginLocation('Bay 10, Row 02 (Kapal)');
      setDestinationLocation('Blok A, Bay 04, Row 02, Tier 3');
      setStatus('In Progress');
      setEquipmentUsed('Quay Crane');
      setOperator('M. Rizky (Operator QC)');
      setCycleTimeMinutes(2.1);
    }
    setValidationError(null);
  }, [editData, isOpen, containersList, vesselsList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!containerNumber.trim()) {
      setValidationError('Nomor kontainer wajib diisi.');
      return;
    }
    if (!vesselName.trim()) {
      setValidationError('Nama kapal terkait wajib dipilih/diisi.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        jobType,
        containerNumber: containerNumber.trim().toUpperCase(),
        vesselName: vesselName.trim(),
        quayCraneId,
        originLocation: originLocation.trim(),
        destinationLocation: destinationLocation.trim(),
        status,
        equipmentUsed,
        operator: operator.trim(),
        cycleTimeMinutes: Number(cycleTimeMinutes),
      }, editData?.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Gagal menyimpan pekerjaan stevedoring.');
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
              <Layers className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {editData ? 'Edit Tugas Stevedoring' : 'Tambah Instruksi Bongkar Muat (Stevedoring)'}
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Quay Crane • RTG • Shifting Antar Blok & Palka Kapal
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Operasi</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as StevedoringJob['jobType'])}
                className="w-full px-3 py-2 text-sm font-bold text-sky-900 rounded-xl border border-sky-200 bg-sky-50/20"
              >
                <option value="DISCHARGE">DISCHARGE (Bongkar dari Kapal)</option>
                <option value="LOAD">LOAD (Muat ke Kapal)</option>
                <option value="SHIFTING">SHIFTING (Pindah Posisi / Relokasi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alat Berat Utama</label>
              <select
                value={equipmentUsed}
                onChange={(e) => setEquipmentUsed(e.target.value as StevedoringJob['equipmentUsed'])}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              >
                <option value="Quay Crane">Quay Crane (Dermaga)</option>
                <option value="RTG Crane">Rubber Tyred Gantry (RTG)</option>
                <option value="Reach Stacker">Reach Stacker (Yard)</option>
                <option value="Terminal Tractor">Head Truck / Terminal Tractor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Petikemas</label>
              <input
                type="text"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                placeholder="MSKU9281745"
                required
                className="w-full px-3 py-2 text-sm font-mono font-bold uppercase rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapal Terkait</label>
              <input
                type="text"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="MV MERATUS SUMATRA"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Quay Crane / RTG</label>
              <select
                value={quayCraneId}
                onChange={(e) => setQuayCraneId(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-sky-800 rounded-xl border border-sky-200 bg-sky-50/20"
              >
                <option value="QC-01">QC-01 (Dermaga 01)</option>
                <option value="QC-02">QC-02 (Dermaga 01)</option>
                <option value="QC-03">QC-03 (Dermaga 02)</option>
                <option value="QC-04">QC-04 (Dermaga 02)</option>
                <option value="QC-05">QC-05 (Dermaga 02)</option>
                <option value="QC-06">QC-06 (Dermaga 03)</option>
                <option value="RTG-01">RTG-01 (Blok A/B)</option>
                <option value="RTG-02">RTG-02 (Blok C/D)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Pekerjaan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StevedoringJob['status'])}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-sky-200 bg-sky-50/20"
              >
                <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                <option value="Queued">Queued (Dalam Antrean)</option>
                <option value="Completed">Completed (Selesai)</option>
                <option value="Aborted">Aborted (Dibatalkan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Asal (Origin)</label>
              <input
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                placeholder="Bay 10, On Deck..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Tujuan (Destination)</label>
              <input
                type="text"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                placeholder="Blok A, Bay 04, Row 02..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Operator Crane / Foreman</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cycle Time (Menit / Box)</label>
              <input
                type="number"
                step={0.1}
                min={0.5}
                max={30}
                value={cycleTimeMinutes}
                onChange={(e) => setCycleTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 bg-sky-50/20 font-mono"
              />
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
                  <span>{editData ? 'Simpan Perubahan' : 'Mulai Tugas Bongkar Muat'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
