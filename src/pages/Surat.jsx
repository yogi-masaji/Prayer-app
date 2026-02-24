import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Loader2, Play, Pause, ArrowLeft } from 'lucide-react';

const useSuratList = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const res = await fetch('https://equran.id/apidev/v2/surat');
        const json = await res.json();
        if (json.code === 200) setSuratList(json.data);
      } catch (err) {
        console.error("Gagal mengambil daftar surat", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, []);

  return { suratList, loading };
};

export function SuratListView({ onSelectSurat }) {
  const { suratList, loading } = useSuratList();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurat = useMemo(() => {
    return suratList.filter(s => 
      s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.arti.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suratList, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-emerald-600 pt-8 pb-4 px-4 sticky top-0 z-20 shadow-md">
        <h2 className="text-white text-xl font-bold mb-4">Al-Quran</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari surat atau arti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
           <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : (
          filteredSurat.map((surat) => (
            <button 
              key={surat.nomor} 
              onClick={() => onSelectSurat(surat.nomor)}
              className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  {surat.nomor}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{surat.namaLatin}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">
                    {surat.tempatTurun} • {surat.jumlahAyat} Ayat
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-arabic text-emerald-600 font-bold">{surat.nama}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function SuratDetailView({ nomor, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingAyat, setPlayingAyat] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://equran.id/apidev/v2/surat/${nomor}`);
        const json = await res.json();
        if (json.code === 200) setDetail(json.data);
      } catch (err) {
        console.error("Gagal memuat ayat", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();

    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, [nomor]);

  useEffect(() => {
    const handleEnded = () => setPlayingAyat(null);
    const audioEl = audioRef.current;
    audioEl.addEventListener('ended', handleEnded);
    return () => audioEl.removeEventListener('ended', handleEnded);
  }, []);

  const togglePlay = (ayatAudioUrl, nomorAyat) => {
    if (playingAyat === nomorAyat) {
      audioRef.current.pause();
      setPlayingAyat(null);
    } else {
      audioRef.current.src = ayatAudioUrl;
      audioRef.current.play();
      setPlayingAyat(nomorAyat);
    }
  };

  if (loading || !detail) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-emerald-800 pt-32">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Memuat Ayat...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-full pb-6">
      <div className="bg-emerald-600 text-white pt-8 pb-6 px-4 sticky top-0 z-20 shadow-md flex items-center">
        <button onClick={onBack} className="p-2 mr-2 -ml-2 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{detail.namaLatin}</h2>
          <p className="text-sm text-emerald-100">{detail.arti} • {detail.jumlahAyat} Ayat</p>
        </div>
        <div className="text-2xl font-arabic font-bold">{detail.nama}</div>
      </div>

      {nomor !== 1 && nomor !== 9 && (
        <div className="p-6 text-center text-2xl font-arabic font-bold text-slate-800 mt-4">
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      )}

      <div className="p-4 space-y-4">
        {detail.ayat.map((ayat) => (
          <div key={ayat.nomorAyat} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                {ayat.nomorAyat}
              </span>
              
              <button 
                onClick={() => togglePlay(ayat.audio["01"], ayat.nomorAyat)}
                className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                  playingAyat === ayat.nomorAyat ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {playingAyat === ayat.nomorAyat ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
            </div>
            
            <p className="text-right text-3xl font-arabic text-slate-800 leading-[3rem] mb-6 font-bold" dir="rtl">
              {ayat.teksArab}
            </p>
            <p className="text-sm text-emerald-600 font-medium italic mb-2 leading-relaxed">
              {ayat.teksLatin}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {ayat.teksIndonesia}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
