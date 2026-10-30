import React, { useState, useEffect } from 'react';
import { X, Anchor, Check, AlertCircle } from 'lucide-react';
import { Vessel, BerthSlot, VesselStatus } from '../../types/terminal';

interface VesselModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<void>;
  editData?: Vessel | null;
}

const AVAILABLE_CRANES = ['QC-01', 'QC-02', 'QC-03', 'QC-04', 'QC-05', 'QC-06'];

export const VesselModal: React.FC<VesselModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const [vesselName, setVesselName] = useState('');
  const [callSign, setCallSign] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [flag, setFlag] = useState('Indonesia 🇮🇩');
  const [loa, setLoa] = useState<number>(180);
  const [beam, setBeam] = useState<number>(28);
  const [draft, setDraft] = useState<number>(9.5);
  const [berthSlot, setBerthSlot] = useState<BerthSlot>('Dermaga 01');
  const [quayCranesAssigned, setQuayCranesAssigned] = useState<string[]>(['QC-01']);
  const [eta, setEta] = useState('2026-10-29 08:00');
  const [etd, setEtd] = useState('2026-10-30 18:00');
  const [ata, setAta] = useState('');
  const [status, setStatus] = useState<VesselStatus>('Berthed');
  const [totalDischargeTEU, setTotalDischargeTEU] = useState<number>(400);
  const [dischargedCount, setDischargedCount] = useState<number>(250);
  const [totalLoadTEU, setTotalLoadTEU] = useState<number>(350);
  const [loadedCount, setLoadedCount] = useState<number>(150);
  const [shippingAgent, setShippingAgent] = useState('PT Samudera Indonesia Tbk');
  const [bph, setBph] = useState<number>(28.5);
  const [notes, setNotes] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setVesselName(editData.vesselName);
      setCallSign(editData.callSign);
      setImoNumber(editData.imoNumber);
      setFlag(editData.flag);
      setLoa(editData.loa);
      setBeam(editData.beam);
      setDraft(editData.draft);
      setBerthSlot(editData.berthSlot);
      setQuayCranesAssigned(editData.quayCranesAssigned || []);
      setEta(editData.eta);
      setEtd(editData.etd);
      setAta(editData.ata || '');
      setStatus(editData.status);
      setTotalDischargeTEU(editData.totalDischargeTEU);
      setDischargedCount(editData.dischargedCount);
      setTotalLoadTEU(editData.totalLoadTEU);
      setLoadedCount(editData.loadedCount);
      setShippingAgent(editData.shippingAgent);
      setBph(editData.bph);
      setNotes(editData.notes || '');
    } else {
      setVesselName('');
      setCallSign('');
      setImoNumber('');
      setFlag('Indonesia 🇮🇩');
      setLoa(175);
      setBeam(27);
      setDraft(8.5);
      setBerthSlot('Dermaga 01');
      setQuayCranesAssigned(['QC-01', 'QC-02']);
      setEta('2026-10-29 07:00');
      setEtd('2026-10-30 19:00');
      setAta('2026-10-29 07:30');
      setStatus('Berthed');
      setTotalDischargeTEU(300);
      setDischargedCount(0);
      setTotalLoadTEU(280);
      setLoadedCount(0);
      setShippingAgent('PT Pelayaran Nasional Indonesia');
      setBph(28.0);
      setNotes('Jadwal sandar reguler');
    }
    setValidationError(null);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const toggleCrane = (crane: string) => {
    if (quayCranesAssigned.includes(crane)) {
      setQuayCranesAssigned(quayCranesAssigned.filter((c) => c !== crane));
    } else {
      setQuayCranesAssigned([...quayCranesAssigned, crane]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!vesselName.trim()) {
      setValidationError('Nama kapal (Vessel Name) wajib diisi.');
      return;
    }
    if (!callSign.trim()) {
      setValidationError('Call sign kapal wajib diisi.');
      return;
    }
    if (loa <= 0) {
      setValidationError('Panjang kapal (LOA) harus valid (> 0 meter).');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        vesselName: vesselName.trim().toUpperCase(),
        callSign: callSign.trim().toUpperCase(),
        imoNumber: imoNumber.trim(),
        flag: flag.trim(),
        loa: Number(loa),
        beam: Number(beam),
        draft: Number(draft),
        berthSlot,
        quayCranesAssigned,
        eta,
        etd,
        ata: ata.trim() || undefined,
        status,
        totalDischargeTEU: Number(totalDischargeTEU),
        dischargedCount: Number(dischargedCount),
        totalLoadTEU: Number(totalLoadTEU),
        loadedCount: Number(loadedCount),
        shippingAgent: shippingAgent.trim(),
        bph: Number(bph),
        notes: notes.trim() || undefined,
      }, editData?.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Gagal menyimpan kapal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-700 to-sky-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Anchor className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {editData ? 'Edit Jadwal & Data Kapal' : 'Pendaftaran Jadwal Kapal Baru'}
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Alokasi Dermaga (Berth Planning) & Penugasan Crane
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Kapal (Vessel Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value.toUpperCase())}
                placeholder="Contoh: MV MERATUS SUMATRA"
                required
                className="w-full px-3 py-2 text-sm font-bold uppercase rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Call Sign <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={callSign}
                onChange={(e) => setCallSign(e.target.value.toUpperCase())}
                placeholder="YDYP3"
                required
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IMO Number</label>
              <input
                type="text"
                value={imoNumber}
                onChange={(e) => setImoNumber(e.target.value)}
                placeholder="9421876"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bendera (Flag)</label>
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="Indonesia 🇮🇩"
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agen Pelayaran</label>
              <input
                type="text"
                value={shippingAgent}
                onChange={(e) => setShippingAgent(e.target.value)}
                placeholder="PT Meratus Line"
                className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Panjang LOA (m)</label>
              <input
                type="number"
                step={0.1}
                value={loa}
                onChange={(e) => setLoa(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lebar Beam (m)</label>
              <input
                type="number"
                step={0.1}
                value={beam}
                onChange={(e) => setBeam(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Draft Kedalaman (m)</label>
              <input
                type="number"
                step={0.1}
                value={draft}
                onChange={(e) => setDraft(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slot Dermaga (Berth)</label>
              <select
                value={berthSlot}
                onChange={(e) => setBerthSlot(e.target.value as BerthSlot)}
                className="w-full px-3 py-2 text-sm font-bold text-sky-800 rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              >
                <option value="Dermaga 01">Dermaga 01 (Utara - Max LOA 250m)</option>
                <option value="Dermaga 02">Dermaga 02 (Tengah - Max LOA 350m)</option>
                <option value="Dermaga 03">Dermaga 03 (Selatan - Max LOA 200m)</option>
                <option value="Dermaga 04">Dermaga 04 (Barat - Feeder)</option>
                <option value="Anchorage">Anchorage (Labuh Luar Kolam)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Kapal</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VesselStatus)}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              >
                <option value="Berthed">Berthed (Sedang Sandar & Operasi)</option>
                <option value="Approaching">Approaching (Menuju Dermaga)</option>
                <option value="Anchored">Anchored (Labuh Jangkar)</option>
                <option value="Operations Finished">Operations Finished (Selesai Bongkar Muat)</option>
                <option value="Departed">Departed (Sudah Berlayar)</option>
              </select>
            </div>
          </div>

          {/* Quay Cranes assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alokasi Quay Crane (QC) Dermaga
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CRANES.map((crane) => {
                const isSelected = quayCranesAssigned.includes(crane);
                return (
                  <button
                    key={crane}
                    type="button"
                    onClick={() => toggleCrane(crane)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white text-slate-600 border-sky-200 hover:border-sky-400'
                    }`}
                  >
                    {crane} {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ETA (Perkiraan Tiba)</label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ETD (Perkiraan Berangkat)</label>
              <input
                type="text"
                value={etd}
                onChange={(e) => setEtd(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bongkar (TEU)</label>
              <input
                type="number"
                value={totalDischargeTEU}
                onChange={(e) => setTotalDischargeTEU(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Terealisasi</label>
              <input
                type="number"
                value={dischargedCount}
                onChange={(e) => setDischargedCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Muat (TEU)</label>
              <input
                type="number"
                value={totalLoadTEU}
                onChange={(e) => setTotalLoadTEU(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Terealisasi</label>
              <input
                type="number"
                value={loadedCount}
                onChange={(e) => setLoadedCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-sky-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Khusus Operasional</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rute pelayaran langsung, prioritas muatan reefer..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-sky-200 focus:ring-2 focus:ring-sky-500 bg-sky-50/20"
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
                  <span>{editData ? 'Simpan Perubahan' : 'Jadwalkan Kapal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
