import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, BookOpen, SearchIcon } from 'lucide-react';
import { Helmet } from 'react-helmet';
import HomeView from './pages/Home';
import DoaView from './pages/Doa';
import SuratView from './pages/Surat';
import TafsirView from './pages/Tafsir';

const useSavedLocation = () => {
  const [location, setLocation] = useState({ provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta' });
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) setLocation(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  const saveLocation = (provinsi, kabkota) => {
    const newLoc = { provinsi, kabkota };
    setLocation(newLoc);
    localStorage.setItem('user_location', JSON.stringify(newLoc));
  };

  return { location, saveLocation, isLoaded };
};

export default function App() {
  const { location, saveLocation, isLoaded } = useSavedLocation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 flex flex-col font-sans shadow-2xl relative sm:border-x sm:border-slate-200 overflow-hidden">
        <Helmet defer={false}>
      <title>Ayatku - Al-Qur'an, Doa & Jadwal Sholat</title>
      <meta name="description" content="Aplikasi Muslim lengkap dengan Al-Qur'an 30 Juz, jadwal sholat akurat, kumpulan doa harian, dan pencarian tafsir berbasis AI." />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://ayatku.netlify.app/ayatku.png" />
    </Helmet>
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar relative">
        <Routes>
          <Route path="/" element={isLoaded && <HomeView location={location} saveLocation={saveLocation} />} />
          <Route path="/doa" element={<DoaView />} />
<Route path="/doa/:id" element={<DoaView />} />
         <Route path="/surat" element={<SuratView />} />
<Route path="/surat/:nomor" element={<SuratView />} />
          <Route path="/tafsir" element={<TafsirView />} />
<Route path="/tafsir/:id" element={<TafsirView />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center px-2 py-3">
          <NavItem 
            icon={<Home />} label="Home" active={pathname === '/'} 
            onClick={() => navigate('/')} 
          />
          <NavItem 
            icon={<Book />} label="Doa" active={pathname.startsWith('/doa')} 
            onClick={() => navigate('/doa')} 
          />
          <NavItem 
            icon={<BookOpen />} label="Surat" active={pathname.startsWith('/surat')} 
            onClick={() => navigate('/surat')} 
          />
          <NavItem 
            icon={<SearchIcon />} label="Tafsir" active={pathname.startsWith('/tafsir')} 
            onClick={() => navigate('/tafsir')} 
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 transition-colors ${
        active ? 'text-emerald-600' : 'text-slate-400'
      }`}
    >
      <div className={`mb-1 transition-transform ${active ? 'scale-110' : ''}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}