import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { GateTransaction } from '../../types/terminal';

interface EirSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: GateTransaction | null;
}

export const EirSlipModal: React.FC<EirSlipModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print px-6 py-3.5 bg-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-200" />
            <span className="font-bold text-sm">Equipment Interchange Receipt (EIR Digital)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-8 overflow-y-auto font-sans text-slate-800 bg-white">
          {/* Header Ticket */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl font-black tracking-wider text-slate-900">PORTVESSEL TERMINAL OPERATING SYSTEM</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              EQUIPMENT INTERCHANGE RECEIPT (EIR) • SLIP PINTU GERBANG
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              PT Pelabuhan Petikemas Indonesia • Gate Inbound / Outbound Weighbridge
            </p>
          </div>

          {/* EIR Number & Barcode simulation */}
          <div className="py-4 border-b border-dashed border-slate-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor EIR</span>
              <span className="text-lg font-mono font-black text-slate-900 tracking-wider">
                {transaction.eirNumber}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5 font-mono">
                Waktu: {transaction.timestamp} WIB
              </span>
            </div>
            <div className="text-right">
              {/* Simulated barcode */}
              <div className="h-8 w-28 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 flex items-center justify-center text-[9px] text-white font-mono tracking-widest">
                |||| | || ||| | ||
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                LANE: {transaction.gateLane}
              </span>
            </div>
          </div>

          {/* Transaction Type Banner */}
          <div className="my-3 py-2 px-3 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between">
            <span className="text-xs font-bold text-sky-950 uppercase tracking-wide">
              {transaction.type.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-200 text-sky-800 font-mono">
              STATUS: {transaction.status}
            </span>
          </div>

          {/* Key Grid Details */}
          <div className="grid grid-cols-2 gap-4 text-xs py-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Petikemas</span>
              <span className="text-sm font-mono font-black text-sky-700">{transaction.containerNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Segel (Seal)</span>
              <span className="text-xs font-mono font-bold text-slate-800">{transaction.sealNumber}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Polisi Truk</span>
              <span className="text-xs font-mono font-bold text-slate-900">{transaction.truckNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Perusahaan EMKL</span>
              <span className="text-xs font-medium text-slate-800">{transaction.emklCompany}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Pengemudi</span>
              <span className="text-xs font-semibold text-slate-800">{transaction.driverName}</span>
              <span className="text-[10px] text-slate-500 block font-mono">{transaction.driverPhone}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor SIM Supir</span>
              <span className="text-xs font-mono text-slate-800">{transaction.driverLicense || '-'}</span>
            </div>
          </div>

          {/* Weight Breakdown */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">
              Data Sertifikasi Timbangan (Weighbridge Record)
            </div>
            <div className="flex justify-between font-mono text-slate-600">
              <span>Gross Weight (Total Timbang):</span>
              <span className="font-bold text-slate-900">{transaction.weightGross.toLocaleString('id-ID')} KG</span>
            </div>
            <div className="flex justify-between font-mono text-slate-600">
              <span>Truck Tare (Berat Truk):</span>
              <span>{transaction.weightTruckTare.toLocaleString('id-ID')} KG</span>
            </div>
            <div className="flex justify-between font-mono font-bold text-sky-800 pt-1 border-t border-slate-200">
              <span>Net Container Weight (Netto):</span>
              <span className="text-sm">{transaction.weightNetContainer.toLocaleString('id-ID')} KG</span>
            </div>
          </div>

          {/* Yard Location & Condition */}
          <div className="mt-4 p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950">Alokasi Penumpukan / Tujuan:</span>
              <span className="font-mono font-bold text-sky-700">{transaction.assignedYardLocation}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-sky-100 text-[11px]">
              <span className="text-slate-600">Kondisi Fisik Petikemas:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {transaction.physicalInspection}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-4 border-t border-slate-300">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-10">Tanda Tangan Pengemudi</p>
              <div className="border-t border-slate-400 mx-4 pt-1">
                <span className="font-bold text-slate-800">{transaction.driverName}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-10">Petugas Gerbang & Timbangan</p>
              <div className="border-t border-slate-400 mx-4 pt-1">
                <span className="font-bold text-slate-800">{transaction.operatorName}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-400 mt-6 italic">
            *Dokumen ini merupakan bukti sah penyerahan/penerimaan petikemas di lingkungan terminal PT Pelabuhan Petikemas.
          </div>
        </div>

        {/* Footer actions */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl transition"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Slip EIR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
