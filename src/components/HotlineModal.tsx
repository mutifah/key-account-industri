import React from 'react';
import { X, PhoneCall, Truck, ShieldAlert, MessageCircle, Clock, MapPin } from 'lucide-react';

interface HotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotlineModal: React.FC<HotlineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Layanan Hotline 24 Jam & Darurat Industri</h2>
              <p className="text-xs text-slate-400">PT Aetra Air Tangerang - Divisi Key Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Card 1: Key Account WhatsApp */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-cyan-950 text-sm">WhatsApp Key Account Executive</h4>
              <p className="text-slate-600 mt-0.5">Respon cepat koordinasi operasional & pasokan air industri.</p>
              <a
                href="https://wa.me/6281199887711?text=Halo%20Key%20Account%20Aetra%20Tangerang,%20kami%20dari%20pelanggan%20industri"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 font-mono font-bold text-cyan-800 text-sm hover:underline"
              >
                +62 811-9988-7711 (Aktif 24 Jam)
              </a>
            </div>
          </div>

          {/* Card 2: Mobil Tangki Darurat */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-950 text-sm">Dispatch Armada Tangki Air Bersih</h4>
              <p className="text-slate-600 mt-0.5">
                Bila terjadi pemeliharaan terencana atau kendala debit, armada tangki siap meluncur ke pabrik Anda.
              </p>
              <span className="inline-block mt-1 text-slate-700 font-semibold">
                Kapasitas: 8.000 Liter / Tangki · Siaga 5 Unit
              </span>
            </div>
          </div>

          {/* Card 3: Call Center Pusat */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Call Center Kantor Pusat Tangerang:</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900">(021) 590-8888 (Hunting)</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Gedung Pusat PT Aetra Air Tangerang, Banten</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
