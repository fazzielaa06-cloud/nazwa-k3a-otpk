import React, { useState } from 'react';
import { Container } from '../../types/terminal';
import { Search, Info, ThermometerSnowflake, AlertTriangle, Layers, MapPin } from 'lucide-react';

interface YardMapProps {
  containers: Container[];
  onSelectContainer?: (container: Container) => void;
}

const BLOCKS: { key: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; label: string; desc: string; color: string }[] = [
  { key: 'A', label: 'BLOK A (Dry Import)', desc: 'General Import High Cube', color: 'border-sky-300 bg-sky-50/50' },
  { key: 'B', label: 'BLOK B (Reefer Cold Plugs)', desc: 'Pendingin & Perishable (-20°C)', color: 'border-cyan-300 bg-cyan-50/50' },
  { key: 'C', label: 'BLOK C (Export Yard)', desc: 'Petikemas Muat Ekspor', color: 'border-emerald-300 bg-emerald-50/50' },
  { key: 'D', label: 'BLOK D (OOG & Tank)', desc: 'Flat Rack, Tank, Heavy Lift', color: 'border-indigo-300 bg-indigo-50/50' },
  { key: 'E', label: 'BLOK E (Empty Depo)', desc: 'Repositioning & Relokasi', color: 'border-slate-300 bg-slate-50/50' },
  { key: 'F', label: 'BLOK F (Dangerous Goods)', desc: 'IMDG Hazmat Segregated', color: 'border-amber-300 bg-amber-50/50' },
];

export const YardMap: React.FC<YardMapProps> = ({ containers, onSelectContainer }) => {
  const [activeBlock, setActiveBlock] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBox, setSelectedBox] = useState<Container | null>(null);

  // Filter containers in current block
  const blockContainers = containers.filter(c => c.yardLocation.block === activeBlock);

  // Find container if search matches
  const searchMatched = searchQuery.trim()
    ? containers.filter(c => c.containerNumber.includes(searchQuery.trim().toUpperCase()))
    : [];

  const handleBoxClick = (c: Container) => {
    setSelectedBox(c);
    if (onSelectContainer) onSelectContainer(c);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Block Switcher & Live Search */}
      <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Block Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Pilih Blok:
          </span>
          {BLOCKS.map(b => {
            const count = containers.filter(c => c.yardLocation.block === b.key).length;
            const isActive = activeBlock === b.key;
            return (
              <button
                key={b.key}
                onClick={() => {
                  setActiveBlock(b.key);
                  setSelectedBox(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                    : 'bg-sky-50/70 hover:bg-sky-100/70 text-slate-700 border border-sky-200'
                }`}
              >
                <span>{b.key}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-sky-200 text-sky-800'
                }`}>
                  {count} box
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Container Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            placeholder="Cari No. Kontainer di Yard..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50/30 uppercase font-mono font-medium"
          />
        </div>
      </div>

      {/* Search results banner if any */}
      {searchQuery && (
        <div className="p-3 bg-sky-100/70 border border-sky-300 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-semibold text-sky-950">
            Hasil pencarian untuk &quot;{searchQuery}&quot;: {searchMatched.length} kontainer ditemukan.
          </span>
          {searchMatched.length > 0 && (
            <span className="text-[11px] text-sky-700">
              Lokasi: Blok {searchMatched[0].yardLocation.block} - Bay {searchMatched[0].yardLocation.bay}
            </span>
          )}
        </div>
      )}

      {/* Block Information Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-sky-100 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-sky-600"></div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {BLOCKS.find(b => b.key === activeBlock)?.label}
            </h3>
            <p className="text-xs text-slate-500">
              {BLOCKS.find(b => b.key === activeBlock)?.desc} • Kapasitas 480 TEU (Bay 01-24, Row 01-06, Tier 1-5)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500 inline-block"></span>
            <span>Import</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span>Export</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-400 inline-block"></span>
            <span>Reefer Plug</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-400 inline-block"></span>
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
            <span>Hazmat DG</span>
          </div>
        </div>
      </div>

      {/* 2D Interactive Grid: Bays & Rows representation */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Header Bay Labels */}
          <div className="grid grid-cols-12 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="py-1 bg-sky-50/50 rounded-lg border border-sky-100">
                BAY {String((i + 1) * 2).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Row Stacking Cells */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map(rowIndex => (
              <div key={rowIndex} className="flex items-center gap-2">
                <div className="w-16 shrink-0 text-center font-mono text-[10px] font-bold text-slate-500 bg-slate-100 py-3 rounded-xl border border-slate-200">
                  ROW 0{rowIndex}
                </div>

                <div className="grid grid-cols-12 gap-2 flex-1">
                  {Array.from({ length: 12 }, (_, colIndex) => {
                    const bayNum = (colIndex + 1) * 2;
                    // Find containers matching this location
                    const match = blockContainers.find(c => 
                      c.yardLocation.bay === bayNum && c.yardLocation.row === rowIndex
                    );

                    let cellColor = 'bg-sky-50/30 border-sky-100 hover:border-sky-300 text-slate-300';
                    let label = 'EMPTY';
                    let isHighlighted = false;

                    if (match) {
                      isHighlighted = searchQuery ? match.containerNumber.includes(searchQuery) : false;
                      if (match.isDangerousGoods) {
                        cellColor = 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs';
                      } else if (match.type === 'Reefer') {
                        cellColor = 'bg-cyan-100 border-cyan-300 text-cyan-900 shadow-xs';
                      } else if (match.status === 'Import') {
                        cellColor = 'bg-sky-100 border-sky-300 text-sky-900 shadow-xs';
                      } else if (match.status === 'Export') {
                        cellColor = 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs';
                      } else if (match.status === 'Empty') {
                        cellColor = 'bg-slate-100 border-slate-300 text-slate-700';
                      } else {
                        cellColor = 'bg-purple-100 border-purple-300 text-purple-900';
                      }
                      label = match.containerNumber.slice(0, 4) + '...';
                    }

                    return (
                      <button
                        key={colIndex}
                        type="button"
                        onClick={() => match && handleBoxClick(match)}
                        className={`h-16 rounded-xl border p-1.5 flex flex-col justify-between text-left transition duration-150 cursor-pointer ${cellColor} ${
                          isHighlighted ? 'ring-2 ring-red-500 scale-105 z-10 animate-pulse' : ''
                        } ${selectedBox?.id === match?.id && match ? 'ring-2 ring-sky-600' : ''}`}
                      >
                        {match ? (
                          <>
                            <div className="flex items-center justify-between text-[10px] leading-tight">
                              <span className="font-mono font-black">{match.containerNumber.slice(0, 7)}</span>
                              <span className="text-[9px] font-bold px-1 rounded bg-white/70">
                                T{match.yardLocation.tier}
                              </span>
                            </div>
                            <div className="text-[9px] truncate font-medium mt-0.5">
                              {match.size} • {match.shippingLine.split(' ')[0]}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {(match.weightGross / 1000).toFixed(1)} T
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] font-mono text-slate-300">
                            -
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Container Detail Drawer */}
      {selectedBox && (
        <div className="bg-white rounded-3xl p-6 border-2 border-sky-300 shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-600/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black font-mono text-slate-900 tracking-wide">
                    {selectedBox.containerNumber}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {selectedBox.size} {selectedBox.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedBox.customsStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Operator: {selectedBox.shippingLine} • Dwell Time: {selectedBox.dwellDays} Hari
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedBox(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg bg-slate-100"
            >
              Tutup Rincian
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-sky-100 text-xs">
            <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Koordinat Yard</span>
              <span className="text-sm font-black text-sky-900 font-mono">
                Blok {selectedBox.yardLocation.block} - Bay {selectedBox.yardLocation.bay} - Row {selectedBox.yardLocation.row} - Tier {selectedBox.yardLocation.tier}
              </span>
            </div>

            <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Berat Kotor & Netto</span>
              <span className="text-sm font-black text-slate-800 font-mono">
                {selectedBox.weightGross.toLocaleString('id-ID')} kg ({selectedBox.weightNet.toLocaleString('id-ID')} Net)
              </span>
            </div>

            <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Segel (Seal)</span>
              <span className="text-sm font-black text-slate-800 font-mono">
                {selectedBox.sealNumber || 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kapal Pengangkut</span>
              <span className="text-sm font-black text-slate-800 truncate block">
                {selectedBox.vesselName || 'Belum Ditentukan'}
              </span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600" />
              <span className="text-slate-700">
                <strong>Komoditas:</strong> {selectedBox.commodity} ({selectedBox.consignee})
              </span>
            </div>
            {selectedBox.isDangerousGoods && (
              <span className="flex items-center gap-1 text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                {selectedBox.imdgClass || 'Dangerous Goods'}
              </span>
            )}
            {selectedBox.type === 'Reefer' && (
              <span className="flex items-center gap-1 text-cyan-700 font-bold bg-cyan-100 px-2 py-0.5 rounded text-[11px]">
                <ThermometerSnowflake className="w-3.5 h-3.5" />
                Suhu Target: {selectedBox.temperatureTarget}°C
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
