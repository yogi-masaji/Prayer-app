import React, { useState, useMemo, useEffect } from 'react';
import { Search, Book, Loader2, ArrowLeft, Info, Quote } from 'lucide-react';

// --- Sub-Komponen untuk Detail Doa ---
const DoaDetailView = ({ id, onBack }) => {
  const [doa, setDoa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://equran.id/api/doa/${id}`);
        const json = await res.json();
        setDoa(json.data);
      } catch (err) {
        console.error("Gagal mengambil detail doa", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-slate-500 text-sm">Memuat detail doa...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300">
      <button 
        onClick={onBack}
        className="flex items-center text-emerald-700 font-medium mb-6 hover:text-emerald-800"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
      </button>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
          {doa.grup}
        </span>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{doa.nama}</h2>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <p className="text-right text-3xl font-arab-uploaded text-slate-900 leading-[2.5] mb-6" dir="rtl">
            {doa.ar}
          </p>
          <p className="text-emerald-700 font-medium italic text-sm leading-relaxed border-l-2 border-emerald-200 pl-4">
            {doa.tr}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Quote className="w-5 h-5 text-slate-300 flex-shrink-0" />
            <p className="text-slate-600 leading-relaxed italic">"{doa.idn}"</p>
          </div>
          
          {doa.tentang && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                <Info className="w-4 h-4 text-emerald-500" />
                <span>Keterangan</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                {doa.tentang}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Komponen Utama ---
export default function DoaView() {
  const [doaList, setDoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchDoa = async () => {
      try {
        const res = await fetch('https://equran.id/api/doa');
        const json = await res.json();
        // Sesuai struktur data: { status: "success", data: [...] }
        setDoaList(json.data || []);
      } catch (err) {
        console.error("Gagal mengambil data doa", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoa();
  }, []);

  const filteredDoa = useMemo(() => {
    if (!searchQuery.trim()) return doaList;
    const tags = searchQuery.toLowerCase().split(' ').filter(t => t.length > 0);
    
    return doaList.filter(doa => {
      const searchSource = `${doa.nama} ${doa.idn} ${doa.grup}`.toLowerCase();
      return tags.every(tag => searchSource.includes(tag));
    });
  }, [doaList, searchQuery]);

  // Jika ada ID terpilih, tampilkan detail
  if (selectedId) {
    return (
      <div className="p-4 pb-24 bg-slate-50 min-h-screen">
        <DoaDetailView id={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header & Search */}
      <div className="bg-emerald-600 pt-8 pb-6 px-5 sticky top-0 z-20 shadow-lg rounded-b-[2rem]">
        <h2 className="text-white text-2xl font-bold mb-4">Kumpulan Doa</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari doa (cth: tidur, makan)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
          />
        </div>
      </div>

      {/* List Card Doa */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : filteredDoa.length > 0 ? (
          filteredDoa.map((doa) => (
            <button
              key={doa.id}
              onClick={() => setSelectedId(doa.id)}
              className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded">
                  {doa.grup}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">#{doa.id}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{doa.nama}</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-1 italic">
                {doa.idn}
              </p>
            </button>
          ))
        ) : (
          <div className="text-center py-20 text-slate-400">
            <Book className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="font-medium">Doa tidak ditemukan</p>
            <p className="text-xs">Coba kata kunci lain seperti "malam" atau "sholat"</p>
          </div>
        )}
      </div>
    </div>
  );
}