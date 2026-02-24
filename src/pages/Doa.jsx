import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Tambahkan ini
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
  const { id } = useParams(); // Mengambil ID dari URL (/doa/:id)
  const navigate = useNavigate();
  const [doaList, setDoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoa = async () => {
      try {
        const res = await fetch('https://equran.id/api/doa');
        const json = await res.json();
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

  // Handler Navigasi
  const handleSelectDoa = (doaId) => navigate(`/doa/${doaId}`);
  const handleBack = () => navigate('/doa');

  if (id) {
    return (
      <div className="p-4 pb-24 bg-slate-50 min-h-screen">
        <DoaDetailView id={id} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-50">
        <div className="bg-emerald-600 pt-8 pb-10 px-5 shadow-lg rounded-b-[2.5rem]">
          <h2 className="text-white text-2xl font-bold mb-4">Kumpulan Doa</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari doa (cth: tidur, makan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-xl transition-all"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 -mt-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
            <p className="text-slate-400 text-sm font-medium">Memuat data...</p>
          </div>
        ) : filteredDoa.length > 0 ? (
          <div className="space-y-3">
            {filteredDoa.map((doa) => (
              <button
                key={doa.id}
                onClick={() => handleSelectDoa(doa.id)}
                className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all active:scale-[0.97]"
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 mt-4">
            <Book className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="font-medium">Doa tidak ditemukan</p>
            <p className="text-xs">Coba kata kunci lain seperti "malam" atau "sholat"</p>
          </div>
        )}
      </main>
    </div>
  );
}