import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Calendar as CalendarIcon, Moon, Sun, Loader2, AlertCircle, Edit2, X } from 'lucide-react';

const PRAYER_NAMES = ['Imsak', 'Subuh', 'Terbit', 'Dhuha', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];
const IFTAR_PRAYER = 'Maghrib';
const RAMADHAN_START_DATE = new Date(2026, 1, 18);

// --- Utility Functions ---
const cleanTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.split(' ')[0];
};

const parsePrayerDateTime = (baseDate, timeStr) => {
  const cleanT = cleanTime(timeStr);
  const [hours, minutes] = cleanT.split(':');
  const date = new Date(baseDate);
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
};

const formatTimeLeft = (ms) => {
  if (ms < 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getCurrentRamadhanDay = (dateObj) => {
  const diffTime = dateObj.getTime() - RAMADHAN_START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  if (diffDays >= 30) return 30;
  return diffDays + 1;
};

// --- Custom Hook ---
const useImsakiyahData = (provinsi, kabkota) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!provinsi || !kabkota) return;
    const fetchData = async () => {
      setLoading(true);
      const cacheKey = `imsakiyah_${provinsi}_${kabkota}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setData(JSON.parse(cachedData));
        setLoading(false);
      }

      try {
        const res = await fetch('https://equran.id/api/v2/imsakiyah', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinsi, kabkota })
        });
        const json = await res.json();
        
        if (json.code === 200) {
          setData(json.data.imsakiyah);
          localStorage.setItem(cacheKey, JSON.stringify(json.data.imsakiyah));
          setError(null);
        } else {
          throw new Error('Gagal mengambil data jadwal Imsakiyah');
        }
      } catch (err) {
        if (!cachedData) setError('Gagal memuat jadwal. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [provinsi, kabkota]);

  return { data, loading, error };
};

// --- Main View ---
export default function HomeView({ location, saveLocation }) {
  const { data: imsakiyahData, loading: dataLoading, error } = useImsakiyahData(location.provinsi, location.kabkota);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('daily');
    const today = new Date();

const formattedDate = today.toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { nextPrayer, todayData, currentDayNum } = useMemo(() => {
    if (!imsakiyahData || imsakiyahData.length === 0) return { nextPrayer: null, todayData: null, currentDayNum: 1 };

    const now = currentTime.getTime();
    const dayNum = getCurrentRamadhanDay(currentTime);
    const today = imsakiyahData.find(d => d.tanggal === dayNum);
    const tomorrow = imsakiyahData.find(d => d.tanggal === dayNum + 1) || imsakiyahData[0]; 

    let foundNext = null;

    if (today) {
      for (const prayer of PRAYER_NAMES) {
        const pTimeStr = today[prayer.toLowerCase()];
        if (!pTimeStr) continue;
        const pTime = parsePrayerDateTime(currentTime, pTimeStr);
        if (pTime.getTime() > now) {
          foundNext = { name: prayer, time: pTime, timeStr: cleanTime(pTimeStr), isTomorrow: false };
          break;
        }
      }
    }

    if (!foundNext && tomorrow) {
      for (const prayer of PRAYER_NAMES) {
        const pTimeStr = tomorrow[prayer.toLowerCase()];
        if (!pTimeStr) continue;
        const tomorrowDate = new Date(currentTime);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const pTime = parsePrayerDateTime(tomorrowDate, pTimeStr);
        if (pTime.getTime() > now) {
          foundNext = { name: prayer, time: pTime, timeStr: cleanTime(pTimeStr), isTomorrow: true };
          break;
        }
      }
    }

    return { nextPrayer: foundNext, todayData: today, currentDayNum: dayNum };
  }, [imsakiyahData, currentTime]);

  if (dataLoading && !imsakiyahData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-emerald-800 pt-32">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Memuat jadwal Imsakiyah...</p>
      </div>
    );
  }

  if (error && !imsakiyahData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center pt-32">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Koneksi Error</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-b-3xl pt-8 pb-6 px-6 shadow-lg z-10">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowLocationModal(true)}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full backdrop-blur-sm"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium truncate max-w-[150px]">{location.kabkota.replace('Kota ', '').replace('Kab. ', '')}</span>
            <Edit2 className="w-3 h-3 ml-1 opacity-70" />
          </button>
          <div className="text-right">
            <p className="text-xs opacity-75">{formattedDate}</p>
            <p className="text-sm font-medium opacity-90">Ramadhan 1447 H</p>
            <p className="text-xs opacity-75">Hari ke-{currentDayNum}</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-emerald-100 text-sm font-medium mb-1 uppercase tracking-wider">
            {nextPrayer ? `Selanjutnya: ${nextPrayer.name} ${nextPrayer.isTomorrow ? '(Besok)' : ''}` : 'Memuat...'}
          </p>
          <div className="text-5xl font-bold tracking-tight mb-2 drop-shadow-md tabular-nums">
            {nextPrayer ? formatTimeLeft(nextPrayer.time.getTime() - currentTime.getTime()) : '--:--:--'}
          </div>
          <p className="text-emerald-100 font-medium">
            pukul {nextPrayer?.timeStr}
          </p>
        </div>
      </div>

      <div className="flex bg-slate-50 px-4 pt-4 pb-2 border-b border-slate-200 sticky top-0 z-0">
        {['harian', 'mingguan', 'bulanan'].map((tab, idx) => {
          const tabKeys = ['daily', 'weekly', 'monthly'];
          const currentKey = tabKeys[idx];
          return (
            <button
              key={currentKey}
              onClick={() => setActiveTab(currentKey)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-all duration-200 relative ${
                activeTab === currentKey ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === currentKey && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-4 space-y-3">
        {activeTab === 'daily' && todayData && <DailyView todayData={todayData} nextPrayer={nextPrayer} />}
        {activeTab === 'weekly' && imsakiyahData && <WeeklyView imsakiyahData={imsakiyahData} currentDayNum={currentDayNum} />}
        {activeTab === 'monthly' && imsakiyahData && <MonthlyView imsakiyahData={imsakiyahData} currentDayNum={currentDayNum} />}
      </div>

      {showLocationModal && (
        <LocationModal currentLocation={location} onClose={() => setShowLocationModal(false)} onSave={saveLocation} />
      )}
    </div>
  );
}

// --- Sub-Components ---
function LocationModal({ currentLocation, onClose, onSave }) {
  const [provinsiList, setProvinsiList] = useState([]);
  const [kabkotaList, setKabkotaList] = useState([]);
  const [selectedProv, setSelectedProv] = useState(currentLocation.provinsi);
  const [selectedKab, setSelectedKab] = useState(currentLocation.kabkota);
  const [loadingProv, setLoadingProv] = useState(true);
  const [loadingKab, setLoadingKab] = useState(false);

  useEffect(() => {
    fetch('https://equran.id/api/v2/imsakiyah/provinsi')
      .then(res => res.json())
      .then(data => { setProvinsiList(data.data); setLoadingProv(false); });
  }, []);

  useEffect(() => {
    if (selectedProv) {
      setLoadingKab(true);
      fetch('https://equran.id/api/v2/imsakiyah/kabkota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provinsi: selectedProv })
      })
      .then(res => res.json())
      .then(data => {
        setKabkotaList(data.data);
        setLoadingKab(false);
        if (!data.data.includes(selectedKab)) setSelectedKab('');
      });
    }
  }, [selectedProv]);

  const handleSave = () => {
    if (selectedProv && selectedKab) {
      onSave(selectedProv, selectedKab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Pilih Lokasi</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Provinsi</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              value={selectedProv} onChange={(e) => setSelectedProv(e.target.value)} disabled={loadingProv}
            >
              <option value="">Pilih Provinsi</option>
              {provinsiList.map(prov => <option key={prov} value={prov}>{prov}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Kabupaten / Kota</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
              value={selectedKab} onChange={(e) => setSelectedKab(e.target.value)} disabled={!selectedProv || loadingKab}
            >
              <option value="">Pilih Kab/Kota</option>
              {kabkotaList.map(kab => <option key={kab} value={kab}>{kab}</option>)}
            </select>
          </div>

          <button 
            onClick={handleSave} disabled={!selectedProv || !selectedKab}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            Simpan Lokasi
          </button>
        </div>
      </div>
    </div>
  );
}

function DailyView({ todayData, nextPrayer }) {
  return (
    <div className="space-y-3 mt-2">
      {PRAYER_NAMES.map((prayer) => {
        const timeStr = cleanTime(todayData[prayer.toLowerCase()]);
        const isNext = nextPrayer?.name === prayer && !nextPrayer?.isTomorrow;
        const isIftar = prayer === IFTAR_PRAYER;
        const isImsak = prayer === 'Imsak';
        
        return (
          <div key={prayer} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isNext ? 'bg-emerald-600 text-white shadow-md transform scale-[1.02]' : 'bg-white text-slate-700 shadow-sm border border-slate-100'}`}>
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${isNext ? 'bg-white/20' : 'bg-slate-100'}`}>
                {['Imsak', 'Maghrib', 'Isya'].includes(prayer) ? (
                  <Moon className={`w-5 h-5 ${isNext ? 'text-white' : 'text-indigo-500'}`} />
                ) : (
                  <Sun className={`w-5 h-5 ${isNext ? 'text-white' : 'text-amber-500'}`} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{prayer}</h3>
                {isIftar && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${isNext ? 'bg-amber-400 text-amber-900' : 'bg-emerald-100 text-emerald-700'}`}>Waktu Buka Puasa</span>}
                {isImsak && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${isNext ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-700'}`}>Batas Sahur</span>}
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold tabular-nums ${isNext ? 'text-white' : 'text-slate-900'}`}>{timeStr}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyView({ imsakiyahData, currentDayNum }) {
  const weekData = imsakiyahData.filter(d => d.tanggal >= currentDayNum && d.tanggal < currentDayNum + 7);
  return (
    <div className="space-y-4">
      {weekData.map((day, idx) => (
        <div key={day.tanggal} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-emerald-600" />
              {idx === 0 ? 'Hari Ini' : idx === 1 ? 'Besok' : `Hari ke-${day.tanggal}`}
            </h4>
            <span className="text-xs text-slate-500 font-medium">Ramadhan</span>
          </div>
          <div className="grid grid-cols-6 gap-2 text-center overflow-x-auto pb-1">
            {['Imsak', 'Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map(p => (
              <div key={p} className="flex flex-col min-w-[50px]">
                <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">{p}</span>
                <span className={`text-xs font-semibold tabular-nums ${p === IFTAR_PRAYER ? 'text-emerald-600' : p === 'Imsak' ? 'text-amber-600' : 'text-slate-700'}`}>{cleanTime(day[p.toLowerCase()])}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthlyView({ imsakiyahData, currentDayNum }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-center">Jadwal Imsakiyah Ramadhan</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-3 font-semibold text-center">Hari</th>
              <th className="px-3 py-3 font-semibold text-amber-600">Imsak</th>
              <th className="px-3 py-3 font-semibold">Subuh</th>
              <th className="px-3 py-3 font-semibold">Dzuhur</th>
              <th className="px-3 py-3 font-semibold">Ashar</th>
              <th className="px-3 py-3 font-semibold text-emerald-600">Maghrib</th>
              <th className="px-3 py-3 font-semibold">Isya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {imsakiyahData.map((day) => {
              const isToday = day.tanggal === currentDayNum;
              return (
                <tr key={day.tanggal} className={isToday ? 'bg-emerald-50/50' : 'hover:bg-slate-50 transition-colors'}>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-medium w-6 h-6 inline-flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-700 bg-slate-100'}`}>{day.tanggal}</span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-amber-600 tabular-nums">{cleanTime(day.imsak)}</td>
                  <td className="px-3 py-3 text-slate-600 tabular-nums">{cleanTime(day.subuh)}</td>
                  <td className="px-3 py-3 text-slate-600 tabular-nums">{cleanTime(day.dzuhur)}</td>
                  <td className="px-3 py-3 text-slate-600 tabular-nums">{cleanTime(day.ashar)}</td>
                  <td className="px-3 py-3 font-semibold text-emerald-600 tabular-nums">{cleanTime(day.maghrib)}</td>
                  <td className="px-3 py-3 text-slate-600 tabular-nums">{cleanTime(day.isya)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
