import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, History, MessageSquare, Quote, ArrowRight, ArrowLeft, BookOpen, Info, Play, Pause, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet';
// --- Komponen Detail Tampilan Penuh ---
const FullDetailView = ({ item, onBack, onNavigateToSurat }) => {
  const { tipe, data } = item;
  const [extraData, setExtraData] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const seoTitle = tipe === 'doa' ? data.judul : (tipe === 'surat' ? data.nama : `${data.nama_surat} Ayat ${data.nomor_ayat}`);
  useEffect(() => {
    // Sinkronisasi dengan API v2 untuk mendapatkan audio dan teks yang lebih lengkap
    if ((tipe === 'tafsir' || tipe === 'ayat') && data.id_surat) {
      const fetchAyatDetail = async () => {
        setLoadingExtra(true);
        try {
          const res = await fetch(`https://equran.id/api/v2/surat/${data.id_surat}`);
          const json = await res.json();
          const spesifikAyat = json.data.ayat.find(a => a.nomorAyat === data.nomor_ayat);
          setExtraData(spesifikAyat);
        } catch (err) {
          console.error("Gagal sinkronisasi data API v2", err);
        } finally {
          setLoadingExtra(false);
        }
      };
      fetchAyatDetail();
    }
    window.scrollTo(0, 0);
  }, [tipe, data.id_surat, data.nomor_ayat]);

  const toggleAudio = (url) => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 pb-24 bg-slate-50 min-h-screen">
      <Helmet defer={false}>
        <title>{`Tafsir ${seoTitle} | Ayatku`}</title>
        <meta name="description" content={`Pelajari tafsir dan makna dari ${seoTitle}. Teks Arab, Latin, dan terjemahan lengkap.`} />
      </Helmet>
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 leading-none mb-1">Detail {tipe}</h2>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
              {data.nama_surat || data.nama || 'Koleksi Doa'}
            </p>
          </div>
        </div>

        {extraData?.audio['01'] && (
          <button 
            onClick={() => toggleAudio(extraData.audio['01'])}
            className={`p-3 rounded-2xl transition-all shadow-sm ${
              isPlaying ? 'bg-amber-500 text-white shadow-amber-200 animate-pulse' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="mb-8">
            <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full mb-3 uppercase tracking-wider ${
              tipe === 'surat' ? 'bg-orange-100 text-orange-700' : 
              tipe === 'ayat' ? 'bg-blue-100 text-blue-700' : 
              tipe === 'tafsir' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {tipe === 'doa' ? data.grup : (tipe === 'surat' ? `${data.tempat_turun} • ${data.jumlah_ayat} Ayat` : `Ayat ke-${data.nomor_ayat}`)}
            </span>
            <h3 className="text-2xl font-bold text-slate-800">
              {tipe === 'doa' ? data.judul : (tipe === 'surat' ? data.nama : data.nama_surat)}
            </h3>
            {tipe === 'surat' && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-emerald-600 font-medium">{data.arti}</p>
                <button 
                  onClick={() => onNavigateToSurat(data.id_surat)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                >
                  Buka Mushaf <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100">
            {loadingExtra ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
                <p className="text-[10px] text-slate-400 font-medium">Sinkronisasi Mushaf...</p>
              </div>
            ) : (
              <>
                <p className="text-right text-3xl font-arab-uploaded text-slate-900 leading-[3.8rem] mb-6" dir="rtl">
                  {tipe === 'surat' ? data.nama_arab : (extraData?.teksArab || data.teks_arab)}
                </p>

                {(extraData?.teksLatin || data.teks_latin) && (
                  <p className="text-emerald-700 text-sm italic font-medium leading-relaxed border-l-2 border-emerald-200 pl-4 mb-4">
                    {extraData?.teksLatin || data.teks_latin}
                  </p>
                )}

                {(extraData?.teksIndonesia || data.terjemahan_id || data.terjemahan || data.arti) && (
                  <p className="text-slate-600 text-sm leading-relaxed pt-4 border-t border-slate-200/60">
                    {tipe === 'surat' ? `Arti: ${data.arti}` : (extraData?.teksIndonesia || data.terjemahan_id || data.terjemahan)}
                  </p>
                )}
              </>
            )}
          </div>

          {(tipe === 'tafsir' || tipe === 'surat') && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wide">
                    {tipe === 'tafsir' ? 'Tafsir' : 'Deskripsi Surat'}
                  </h4>
                  <div className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {tipe === 'tafsir' ? data.isi : <div dangerouslySetInnerHTML={{ __html: data.deskripsi }} />}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(data.catatan || data.sumber) && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-300 mt-0.5" />
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                {data.catatan || data.sumber}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TafsirView() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('tafsir_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Handle Deep Linking (Jika ada ID di URL, cari di results)
  useEffect(() => {
    if (id && results.length > 0) {
      const found = results.find(r => 
        (r.data.id_surat?.toString() === id) || 
        (r.data.id_doa?.toString() === id)
      );
      if (found) setSelectedDetail(found);
    } else if (!id) {
      setSelectedDetail(null);
    }
  }, [id, results]);

  const handleSearch = async (e, forcedQuery) => {
    if (e) e.preventDefault();
    const activeQuery = forcedQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('https://equran.id/api/vector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cari: activeQuery,
          batas: 10,
          tipe: ['ayat', 'tafsir', 'doa', 'surat'] 
        })
      });
      const json = await res.json();
      
      if (json.status === 'sukses') {
        setResults(json.hasil);
        const newHistory = [activeQuery, ...history.filter(h => h !== activeQuery)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('tafsir_history', JSON.stringify(newHistory));
      }
    } catch (err) {
      console.error("Gagal melakukan pencarian semantik", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSurat = (nomor) => navigate(`/surat/${nomor}`);
  
  const handleSelectResult = (item) => {
    const itemId = item.data.id_surat || item.data.id_doa;
    navigate(`/tafsir/${itemId}`);
    setSelectedDetail(item);
  };

  const handleBack = () => {
    navigate('/tafsir');
    setSelectedDetail(null);
  };

  if (selectedDetail) {
    return (
      <FullDetailView 
        item={selectedDetail} 
        onBack={handleBack} 
        onNavigateToSurat={handleNavigateToSurat}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-50">
        <div className="bg-emerald-600 pt-8 pb-10 px-5 shadow-lg rounded-b-[2.5rem]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-200 fill-emerald-200" />
            <h2 className="text-white text-2xl font-bold">Pencarian Tafsir</h2>
          </div>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari makna Al-Qur'an & Doa..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white text-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-400/30 shadow-xl transition-all"
            />
          </form>
        </div>
      </header>

      <main className="flex-1 p-4 -mt-4 pb-24">
        {history.length > 0 && !results.length && !loading && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-slate-400 mb-3 px-2">
              <History className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Baru Saja Dicari</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => { setQuery(h); handleSearch(null, h); }}
                  className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
            <p className="text-slate-400 text-sm italic">Mencari...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((item, idx) => (
              <ResultCard 
                key={idx} 
                item={item} 
                onSelect={() => handleSelectResult(item)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 bg-white rounded-[2.5rem] border border-dashed border-slate-200 mt-4 px-6">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="font-bold text-slate-600">Cari dengan bahasa natural</p>
            <p className="text-xs">"Ayat tentang bersyukur", "Surat Muhammad", dll</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ResultCard({ item, onSelect }) {
  const { tipe, data } = item;
  
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-emerald-200 transition-all">
      <div className="flex justify-between items-center mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
          tipe === 'surat' ? 'bg-orange-50 text-orange-600' :
          tipe === 'ayat' ? 'bg-blue-50 text-blue-600' : 
          tipe === 'tafsir' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {tipe}
        </span>
        <div className="text-[10px] text-slate-400 font-mono font-bold">
          {tipe === 'doa' ? `#${data.id_doa}` : (tipe === 'surat' ? `${data.jumlah_ayat} Ayat` : `${data.nama_surat} : ${data.nomor_ayat}`)}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
        {tipe === 'doa' ? data.judul : (tipe === 'surat' ? data.nama : data.nama_surat)}
      </h3>

      <div className="space-y-3 mb-5">
        {data.teks_arab && (
          <p className="text-right text-xl font-arab-uploaded text-slate-900 line-clamp-1 opacity-60" dir="rtl">
            {data.teks_arab}
          </p>
        )}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 italic">
          "{tipe === 'tafsir' ? data.isi : tipe === 'surat' ? data.deskripsi.replace(/<[^>]*>/g, '') : (data.terjemahan_id || data.terjemahan)}"
        </p>
      </div>

      <button 
        onClick={onSelect}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
      >
        Baca Selengkapnya <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}