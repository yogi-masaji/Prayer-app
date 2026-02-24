import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Loader2, Play, Pause, ArrowLeft, BookOpen, Music, ChevronRight, ChevronLeft } from 'lucide-react';

// --- Sub-Komponen Detail Surat ---
const SuratDetailView = ({ nomor, onBack, onNavigate }) => {
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingAyat, setPlayingAyat] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        const json = await res.json();
        setSurat(json.data);
      } catch (err) {
        console.error("Gagal mengambil detail surat", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [nomor]);

  const togglePlay = (url, id) => {
    if (playingAyat === id) {
      audioRef.current.pause();
      setPlayingAyat(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingAyat(id);
      audioRef.current.onended = () => setPlayingAyat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
        <p className="text-slate-500 text-sm animate-pulse">Memuat ayat-ayat...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 pb-32">
      {/* Header Detail Sticky */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-800">{surat.namaLatin}</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{surat.arti}</p>
        </div>
        <button 
          onClick={() => togglePlay(surat.audioFull["01"], 'full')}
          className={`p-2.5 rounded-full transition-all ${
            playingAyat === 'full' 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 animate-pulse' 
              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
          }`}
        >
          {playingAyat === 'full' ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
        </button>
      </div>

      {/* Info Deskripsi Surat */}
      <div className="p-4">
        <div className="bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-100">
           <p className="text-[11px] text-emerald-800 leading-relaxed italic" 
              dangerouslySetInnerHTML={{ __html: surat.deskripsi }} />
        </div>

        {/* List Ayat */}
        <div className="space-y-4">
          {surat.ayat.map((ayat) => (
            <div key={ayat.nomorAyat} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-mono text-xs border border-slate-100">
                  {ayat.nomorAyat}
                </div>
                <button 
                  onClick={() => togglePlay(ayat.audio["01"], ayat.nomorAyat)}
                  className={`p-2.5 rounded-2xl transition-all ${
                    playingAyat === ayat.nomorAyat 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' 
                      : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  {playingAyat === ayat.nomorAyat ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
              </div>
              
              <p className="text-right text-3xl font-arab-uploaded text-slate-900 leading-[3.5rem] mb-6" dir="rtl">
                {ayat.teksArab}
              </p>
              <p className="text-sm text-emerald-700 font-medium mb-3 italic leading-relaxed">
                {ayat.teksLatin}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {ayat.teksIndonesia}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-10 flex gap-3 mt-8">
  {surat.suratSebelumnya ? (
    <button 
      onClick={() => onNavigate(surat.suratSebelumnya.nomor)}
      className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-slate-700 font-bold active:scale-95 transition-transform"
    >
      <ChevronLeft className="w-5 h-5" /> 
      <div className="text-left">
        <p className="text-[10px] text-slate-400 font-medium leading-none mb-1">Sebelumnya</p>
        <p className="text-sm">{surat.suratSebelumnya.namaLatin}</p>
      </div>
    </button>
  ) : <div className="flex-1" />}

  {surat.suratSelanjutnya ? (
    <button 
      onClick={() => onNavigate(surat.suratSelanjutnya.nomor)}
      className="flex-1 bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-white font-bold active:scale-95 transition-transform"
    >
      <div className="text-right">
        <p className="text-[10px] text-emerald-200 font-medium leading-none mb-1">Selanjutnya</p>
        <p className="text-sm">{surat.suratSelanjutnya.namaLatin}</p>
      </div>
      <ChevronRight className="w-5 h-5" />
    </button>
  ) : <div className="flex-1" />}
</div>
    </div>
  );
};

// --- Komponen Utama ---
export default function SuratView() {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNomor, setSelectedNomor] = useState(null);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const json = await res.json();
        setSuratList(json.data || []);
      } catch (err) {
        console.error("Gagal mengambil data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, []);

  const filteredSurat = useMemo(() => {
    if (!searchQuery.trim()) return suratList;
    const query = searchQuery.toLowerCase();
    return suratList.filter(s => 
      s.namaLatin.toLowerCase().includes(query) || 
      s.arti.toLowerCase().includes(query)
    );
  }, [suratList, searchQuery]);

  if (selectedNomor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SuratDetailView 
          nomor={selectedNomor} 
          onBack={() => setSelectedNomor(null)} 
          onNavigate={setSelectedNomor} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER & SEARCH BAR - Disamakan dengan Doa.jsx */}
      <header className="sticky top-0 z-50 bg-slate-50">
        <div className="bg-emerald-600 pt-8 pb-10 px-5 shadow-lg rounded-b-[2.5rem]">
          <h2 className="text-white text-2xl font-bold mb-4">Al-Qur'an</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari surat (cth: Al-Fatihah)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-xl transition-all"
            />
          </div>
        </div>
      </header>

      {/* LIST CONTENT */}
      <main className="flex-1 p-4 -mt-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
            <p className="text-slate-400 text-sm font-medium">Menyiapkan Mushaf...</p>
          </div>
        ) : filteredSurat.length > 0 ? (
          <div className="space-y-3">
            {filteredSurat.map((s) => (
              <button
                key={s.nomor}
                onClick={() => setSelectedNomor(s.nomor)}
                className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all active:scale-[0.97] flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-bold border border-emerald-100 flex-shrink-0">
                  {s.nomor}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight truncate">
                    {s.namaLatin}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                    {s.arti} • {s.jumlahAyat} Ayat
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-arab-uploaded text-emerald-600 leading-none mb-1">{s.nama}</p>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                    {s.tempatTurun}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 mt-4">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="font-medium">Surat tidak ditemukan</p>
            <p className="text-xs">Coba cari dengan nama latin atau arti surat</p>
          </div>
        )}
      </main>
    </div>
  );
}