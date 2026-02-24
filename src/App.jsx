import React, { useState, useEffect } from 'react';
import { Home, Book, BookOpen } from 'lucide-react';

// Import komponen-komponen yang sudah dipisah
import HomeView from './pages/Home';
import DoaView from './pages/Doa';
import { SuratListView, SuratDetailView } from './pages/Surat';

// --- Custom Hooks ---
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
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedSurat, setSelectedSurat] = useState(null);
  const { location, saveLocation, isLoaded } = useSavedLocation();

  return (
  
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 flex flex-col font-sans shadow-2xl relative sm:border-x sm:border-slate-200 overflow-hidden">
      
      
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar relative">
        {currentTab === 'home' && isLoaded && (
          <HomeView location={location} saveLocation={saveLocation} />
        )}
        {currentTab === 'doa' && <DoaView />}
        
        {currentTab === 'surat' && !selectedSurat && (
          <SuratListView onSelectSurat={setSelectedSurat} />
        )}
        {currentTab === 'surat' && selectedSurat && (
          <SuratDetailView nomor={selectedSurat} onBack={() => setSelectedSurat(null)} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center px-2 py-3">
          <NavItem 
            icon={<Home />} label="Home" active={currentTab === 'home'} 
            onClick={() => setCurrentTab('home')} 
          />
          <NavItem 
            icon={<Book />} label="Doa" active={currentTab === 'doa'} 
            onClick={() => setCurrentTab('doa')} 
          />
          <NavItem 
            icon={<BookOpen />} label="Surat" active={currentTab === 'surat'} 
            onClick={() => {
              setCurrentTab('surat');
              if(currentTab !== 'surat') setSelectedSurat(null);
            }} 
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
        active ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'
      }`}
    >
      <div className={`mb-1 transition-transform ${active ? 'scale-110' : ''}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}
