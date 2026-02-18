import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Plus, 
  Save, 
  Clock, 
  BookOpen, 
  ClipboardList, 
  CheckSquare, 
  Moon, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Edit, 
  List, 
  Columns, 
  UserCheck, 
  StickyNote, 
  Trash2, 
  Target, 
  Calculator, 
  Upload, 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Palette, 
  MapPin, 
  Search, 
  Navigation, 
  MessageSquare, 
  Users, 
  LayoutList, 
  Circle,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';

// --- アイコンエイリアス (互換性確保) ---
const CalendarIcon = Calendar;
const SettingsIcon = Settings;
const UsersIcon = Users;

// --- Firebase Configuration ---
const getFirebaseConfig = () => {
  try {
    return typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyD1UdAGGHK1gwSAgBKDRQOge8-eIu6Aqxo",
  authDomain: "teacher-planner-app-537b5.firebaseapp.com",
  projectId: "teacher-planner-app-537b5",
  storageBucket: "teacher-planner-app-537b5.firebasestorage.app",
  messagingSenderId: "683277226924",
  appId: "1:683277226924:web:a4343ea556a58b69afa009",
  measurementId: "G-T2DGGWN1EX"
    };
  } catch (e) {
    return {};
  }
};

const firebaseConfig = getFirebaseConfig();
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'teacher-planner-premium';

// --- Constants & Config ---
const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const TIME_SLOTS = [
  { id: 'morning', label: '朝礼/打合', en: 'Morning Meeting', isLesson: false },
  { id: 'p1', label: '1時限', en: '1st Period', isLesson: true },
  { id: 'p2', label: '2時限', en: '2nd Period', isLesson: true },
  { id: 'p3', label: '3時限', en: '3rd Period', isLesson: true },
  { id: 'p4', label: '4時限', en: '4th Period', isLesson: true },
  { id: 'lunch', label: '昼休み', en: 'Lunch Break', isLesson: false },
  { id: 'p5', label: '5時限', en: '5th Period', isLesson: true },
  { id: 'p6', label: '6時限', en: '6th Period', isLesson: true },
  { id: 'p7', label: '7時限', en: '7th Period', isLesson: true },
  { id: 'closing', label: '終礼/放課後', en: 'Closing', isLesson: false }
];

const OTHER_ACTIVITIES = ['学年会議', '部活', '清掃', '職員会議', '分掌会議', '校務', '研修', '出張'];

const ATTENDANCE_STATUS = [
  { id: 'present', label: '出席', mark: '', color: 'text-slate-300' },
  { id: 'absent', label: '欠課', mark: '欠', color: 'text-red-600' },
  { id: 'suspend', label: '出停', mark: '停', color: 'text-orange-500' },
  { id: 'mourning', label: '忌引', mark: '忌', color: 'text-slate-600' },
  { id: 'official', label: '公欠', mark: '公', color: 'text-blue-500' },
  { id: 'late', label: '遅刻', mark: '遅', color: 'text-amber-500' }
];

const COLOR_PRESETS = [
  { id: 'heritage', name: 'Heritage', bg: '#f7f6f2', sidebar: '#2c3e50', accent: '#8e7d6b', text: '#2c3e50', zebra: 'rgba(142, 125, 107, 0.04)' },
  { id: 'midnight', name: 'Midnight Gold', bg: '#ffffff', sidebar: '#1a1c2c', accent: '#c6a664', text: '#1a1c2c', zebra: 'rgba(198, 166, 100, 0.05)' },
  { id: 'ocean', name: 'Ocean UD', bg: '#f0f4f8', sidebar: '#003366', accent: '#0077b6', text: '#001d3d', zebra: 'rgba(0, 119, 182, 0.04)' },
  { id: 'forest', name: 'Forest UD', bg: '#f4f7f4', sidebar: '#1b3022', accent: '#4a7c59', text: '#1b3022', zebra: 'rgba(74, 124, 89, 0.04)' },
  { id: 'nordic', name: 'Nordic Slate', bg: '#f2f2f2', sidebar: '#3d4b55', accent: '#708090', text: '#2f3b43', zebra: 'rgba(112, 128, 144, 0.05)' },
  { id: 'sakura', name: 'Sakura UD', bg: '#fffafb', sidebar: '#4a2c2c', accent: '#d68a8a', text: '#3d2626', zebra: 'rgba(214, 138, 138, 0.04)' },
  { id: 'lavender', name: 'Lavender UD', bg: '#f8f7ff', sidebar: '#312e4d', accent: '#7a76c2', text: '#2a2744', zebra: 'rgba(122, 118, 194, 0.04)' },
  { id: 'monotone', name: 'Contrast', bg: '#ffffff', sidebar: '#000000', accent: '#555555', text: '#000000', zebra: 'rgba(0, 0, 0, 0.03)' },
  { id: 'earth', name: 'Earth Clay', bg: '#f9f6f1', sidebar: '#4b3832', accent: '#be9b7b', text: '#3c2f2f', zebra: 'rgba(190, 155, 123, 0.06)' },
  { id: 'mint', name: 'Mint Modern', bg: '#f5fffb', sidebar: '#2d3b36', accent: '#66b2a2', text: '#24302c', zebra: 'rgba(102, 178, 162, 0.05)' }
];

const JAPAN_CITIES = [
  { name: '東京', lat: 35.6895, lon: 139.6917 },
  { name: '大阪', lat: 34.6937, lon: 135.5023 },
  { name: '札幌', lat: 43.0611, lon: 141.3564 },
  { name: '福岡', lat: 33.5902, lon: 130.4017 },
  { name: '名古屋', lat: 35.1815, lon: 136.9066 }
];

// --- Helper Functions & Components ---

// 画像リサイズ用ユーティリティ
const resizeImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_SIZE = 800; // 長辺の最大ピクセル
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // JPEG圧縮率0.6
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const FlagIcon = () => (
  <div className="inline-block mr-1.5 align-middle shrink-0">
    <div className="w-3.5 h-2.5 bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
      <div className="w-1.5 h-1.5 bg-[#bc002d] rounded-full"></div>
    </div>
  </div>
);

const WeatherMoonIcon = ({ age, size = 16, className = "" }) => {
  const normalizedAge = Math.floor(age % 28);
  const isWaxing = normalizedAge <= 14;
  const coverage = isWaxing ? (normalizedAge / 14) : (1 - (normalizedAge - 14) / 14);
  const maskId = useMemo(() => `moon-mask-${Math.random().toString(36).substr(2, 9)}`, []);
  
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 30 30" width={size} height={size}>
        <circle cx="15" cy="15" r="13" fill="currentColor" opacity="0.1" />
        <mask id={maskId}>
          <rect x="0" y="0" width="30" height="30" fill="white" />
          {normalizedAge === 0 ? (
            <circle cx="15" cy="15" r="14" fill="black" />
          ) : normalizedAge === 14 ? null : (
            <ellipse 
              cx={isWaxing ? 15 - (1 - coverage) * 15 : 15 + (1 - coverage) * 15} 
              cy="15" 
              rx={Math.abs(15 - coverage * 15)} 
              ry="13" 
              fill="black" 
            />
          )}
        </mask>
        <circle 
          cx="15" 
          cy="15" 
          r="13" 
          fill="currentColor" 
          style={{ color: 'var(--color-accent)' }} 
          mask={normalizedAge !== 14 ? `url(#${maskId})` : null} 
        />
      </svg>
    </div>
  );
};

const WeatherIconComp = ({ code, isDay, size = 20, className = "" }) => {
  if (code === 0) return <Sun size={size} className={`text-amber-400 ${className}`} />;
  if ([1, 2, 3].includes(code)) return isDay ? <Sun size={size} className={`text-orange-300 ${className}`} /> : <Moon size={size} className={`text-indigo-300 ${className}`} />;
  if ([45, 48].includes(code)) return <Cloud size={size} className={`text-slate-300 ${className}`} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow size={size} className={`text-sky-200 ${className}`} />;
  return <Cloud size={size} className={`text-slate-400 ${className}`} />;
};

const getCalendarInfo = (year, month, day) => {
  const date = new Date(year, month, day);
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

  const dayOfWeek = date.getDay();
  const m = month + 1;
  const d = day;
  const rokuyoList = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];
  const rokuyo = rokuyoList[(day + month) % 6];
  let holiday = '';
  // Fixed Holidays
  if (m === 1 && d === 1) holiday = '元日';
  if (m === 2 && d === 11) holiday = '建国記念の日';
  if (m === 2 && d === 23) holiday = '天皇誕生日';
  if (m === 3 && d === 20) holiday = '春分の日';
  if (m === 4 && d === 29) holiday = '昭和の日';
  if (m === 5 && d === 3) holiday = '憲法記念日';
  if (m === 5 && d === 4) holiday = 'みどりの日';
  if (m === 5 && d === 5) holiday = 'こどもの日';
  if (m === 8 && d === 11) holiday = '山の日';
  if (m === 9 && d === 23) holiday = '秋分の日';
  if (m === 11 && d === 3) holiday = '文化の日';
  if (m === 11 && d === 23) holiday = '勤労感謝の日';
  // Happy Mondays
  const nthMon = Math.ceil(d / 7);
  if (dayOfWeek === 1) {
    if (m === 1 && nthMon === 2) holiday = '成人の日';
    if (m === 7 && nthMon === 3) holiday = '海の日';
    if (m === 9 && nthMon === 3) holiday = '敬老の日';
    if (m === 10 && nthMon === 2) holiday = 'スポーツの日';
  }

  const isHoliday = !!holiday;
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  let dayColorClass = 'text-slate-700';
  let dayBgClass = '';
  if (isSunday || isHoliday) { dayColorClass = 'text-[#d63031]'; dayBgClass = 'bg-red-50/60'; }
  else if (isSaturday) { dayColorClass = 'text-[#0984e3]'; dayBgClass = 'bg-blue-50/30'; }

  const baseDate = new Date(2026, 0, 19);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const moonAge = Math.abs(diffDays % 29.53);

  return { rokuyo, holiday, isHoliday, isSunday, isSaturday, isToday, dayColorClass, dayBgClass, moonAge };
};

const CustomStyles = ({ themeId }) => {
  const theme = useMemo(() => COLOR_PRESETS.find(p => p.id === themeId) || COLOR_PRESETS[0], [themeId]);
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&family=LINE+Seed+JP:wght@400;700;800&display=swap');
      :root {
        --font-jp: 'LINE Seed JP', sans-serif;
        --font-futura: 'Futura', 'Trebuchet MS', sans-serif;
        --font-script: 'Dancing Script', cursive;
        --color-bg: ${theme.bg};
        --color-sidebar: ${theme.sidebar};
        --color-accent: ${theme.accent};
        --color-text: ${theme.text};
        --color-zebra: ${theme.zebra};
      }
      body { font-family: var(--font-jp); background-color: var(--color-bg); color: var(--color-text); transition: all 0.4s ease; margin: 0; }
      .font-futura { font-family: var(--font-futura); }
      .font-script { font-family: var(--font-script); }
      .zebra-table tr:nth-child(even) { background-color: var(--color-zebra); }
    `}</style>
  );
};

const HeaderStatus = ({ lat, lon }) => {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { 
    if (lat && lon) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then(r => r.json()).then(d => { if (d.current_weather) setWeather(d.current_weather); }).catch(e => {});
    }
  }, [lat, lon]);
  const info = getCalendarInfo(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  return (
    <div className="flex items-center gap-6">
      {weather && (
        <div className="flex items-center gap-3 bg-white/40 px-5 py-3 rounded-3xl border border-white/20">
          <WeatherIconComp code={weather.weathercode} isDay={weather.is_day} size={24} />
          <span className="font-futura text-xl font-bold">{Math.round(weather.temperature)}°</span>
        </div>
      )}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <span className="font-futura text-lg font-bold text-slate-800">{now.toLocaleDateString('ja-JP')}</span>
          <span className={`font-script text-2xl ${info.dayColorClass}`}>{dayEn}</span>
          {info.isHoliday && <FlagIcon />}
        </div>
        <span className="font-futura text-sm text-slate-400">{now.toLocaleTimeString('ja-JP')}</span>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, en }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${active ? 'text-white shadow-lg scale-105 z-10' : 'text-[#bdc3c7]/60 hover:bg-[#34495e] hover:text-[#ecf0f1]'}`} style={active ? { backgroundColor: 'var(--color-accent)' } : {}}>
    <div className={`${active ? 'scale-110' : ''}`}>{icon}</div>
    <div className="hidden md:flex flex-col items-start leading-none text-left">
      <span className="text-xs font-bold tracking-tight mb-1">{label}</span>
      <span className={`font-futura text-[8px] uppercase tracking-widest ${active ? 'text-white/50' : 'text-slate-500'}`}>{en}</span>
    </div>
  </button>
);

// --- View Components ---

const WeeklyPlanner = ({ currentDate, baseTimetable, weeklyOverrides, onSave }) => {
  const [showSidePanel, setShowSidePanel] = useState(true);
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const result = new Date(d);
    result.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return result;
  }, [currentDate]);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d;
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in pb-20">
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-[30px] border border-black/5">
        <h3 className="text-xl font-extrabold flex items-center gap-3"><CalendarIcon size={24} style={{ color: 'var(--color-accent)' }} /> 週間スケジュール</h3>
        <button 
          onClick={() => setShowSidePanel(!showSidePanel)} 
          className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md text-sm text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {showSidePanel ? <><ChevronsRight size={18}/> メモ格納</> : <><ChevronsLeft size={18}/> メモ表示</>}
        </button>
      </div>
      <div className="bg-white rounded-[50px] shadow-2xl border border-black/5 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 relative">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs table-fixed min-w-[1000px] zebra-table">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-6 w-24 border-r"><span className="font-futura text-[10px] text-slate-400 block uppercase">Period</span><span className="text-sm font-bold">校時</span></th>
                {weekDays.map(d => {
                  const info = getCalendarInfo(d.getFullYear(), d.getMonth(), d.getDate());
                  return (
                    <th key={d.toString()} className={`p-4 border-r ${info.dayBgClass}`} style={info.isToday ? { backgroundColor: 'var(--color-accent)', opacity: 0.1 } : {}}>
                      <div className="flex flex-col items-center relative">
                        {info.isToday && <span className="absolute -top-3 bg-[var(--color-accent)] text-white text-[9px] px-2 py-0.5 rounded-b-lg font-bold">TODAY</span>}
                        <span className={`font-futura text-[11px] uppercase ${info.dayColorClass}`}>{DAYS[d.getDay()]}</span>
                        <div className="flex items-center gap-1"><span className={`text-3xl font-futura font-bold ${info.dayColorClass}`}>{d.getDate()}</span>{info.isHoliday && <FlagIcon />}</div>
                        <span className={`text-[10px] font-bold opacity-60 ${info.dayColorClass}`}>{info.rokuyo}</span>
                        <div className="mt-1"><WeatherMoonIcon age={info.moonAge} className="text-slate-400" /></div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-4 border-slate-200/50">
                 <td className="p-4 bg-slate-50 border-r text-center font-bold text-[9px] text-[#8e7d6b] uppercase">Contact<br/><span className="text-[14px]">連絡</span></td>
                 {weekDays.map(d => {
                    const dk = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
                    const info = getCalendarInfo(d.getFullYear(), d.getMonth(), d.getDate());
                    return (
                      <td key={d.toString()} className={`p-2 border-r ${info.dayBgClass}`} style={info.isToday ? { borderLeft: '2px solid var(--color-accent)', borderRight: '2px solid var(--color-accent)' } : {}}>
                        <textarea 
                          className="w-full h-24 p-2 bg-transparent border-none text-[11px] font-bold resize-none focus:ring-0 placeholder:text-slate-200" 
                          placeholder="朝礼メモ..."
                          value={weeklyOverrides[dk]?.['daily_memo'] || ''}
                          onChange={(e) => onSave(dk, 'daily_memo', e.target.value)}
                        />
                      </td>
                    );
                 })}
              </tr>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.id} className={slot.id === 'lunch' ? 'bg-slate-50/80' : ''}>
                  <td className="p-4 bg-slate-50/20 border-r text-center font-bold text-[10px] text-slate-500 leading-tight">{slot.label}</td>
                  {weekDays.map(date => {
                    const info = getCalendarInfo(date.getFullYear(), date.getMonth(), date.getDate());
                    const dk = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
                    const value = weeklyOverrides[dk]?.[slot.id] || baseTimetable[DAYS[date.getDay()]]?.[slot.id] || '';
                    return (
                      <td key={date.toString()} className={`p-0 border-r relative ${info.dayBgClass}`} style={info.isToday ? { borderLeft: '2px solid var(--color-accent)', borderRight: '2px solid var(--color-accent)' } : {}}>
                        <textarea
                          className={`w-full ${slot.isLesson ? 'h-36' : 'h-24'} p-4 bg-transparent border-none focus:ring-2 resize-none transition-all text-[11px] leading-relaxed font-medium placeholder:text-slate-100`}
                          style={{ '--tw-ring-color': 'var(--color-accent)' }}
                          value={value}
                          onChange={(e) => onSave(dk, slot.id, e.target.value)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={`transition-all duration-500 overflow-hidden bg-slate-50/50 ${showSidePanel ? 'w-full lg:w-[400px] opacity-100 p-10' : 'w-0 opacity-0 p-0'}`}>
          <div className="min-w-[320px] space-y-12">
            <div>
              <h4 className="text-lg font-bold flex items-center gap-2 mb-6"><ClipboardList size={22} style={{ color: 'var(--color-accent)' }} /> 週間メモ・全体連絡</h4>
              <textarea 
                className="w-full h-[500px] bg-white border border-slate-200 rounded-[40px] p-8 text-sm shadow-inner focus:ring-4 resize-none leading-relaxed transition-all" 
                style={{ '--tw-ring-color': 'var(--color-accent) 0.1' }}
                placeholder="今週の全体連絡事項などを自由に記述してください。"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiaryView = ({ user, appId }) => {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'diary'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return () => unsubscribe();
  }, [user, appId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await resizeImage(file);
      setSelectedImage(base64);
    } catch (error) {
      console.error("Image processing failed", error);
    }
  };

  const saveEntry = async () => {
    if (!content && !selectedImage) return;
    const docId = inputDate; 
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'diary', docId), {
      date: inputDate,
      content,
      image: selectedImage,
      updatedAt: Date.now()
    }, { merge: true });
    
    setContent('');
    setSelectedImage(null);
  };

  const deleteEntry = async (id) => {
    if(confirm('この日記を削除しますか？')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'diary', id));
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 pb-20 text-left">
      <header className="border-b-2 pb-6 flex justify-between items-center" style={{ borderColor: 'var(--color-accent) 0.1' }}>
        <h3 className="text-2xl font-extrabold flex items-center gap-3"><Camera size={28} style={{ color: 'var(--color-accent)' }} /> 業務日記・思い出</h3>
      </header>
      
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 h-fit">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <input 
                type="date" 
                className="p-3 bg-slate-50 rounded-xl font-bold border-none text-slate-700" 
                value={inputDate} 
                onChange={(e) => setInputDate(e.target.value)} 
              />
              <span className="text-xs text-slate-400 font-bold">の日記を作成</span>
            </div>
            
            <textarea 
              className="w-full h-40 bg-[#fdfcf0]/50 border-none rounded-[20px] p-6 text-sm focus:ring-2 resize-none transition-all font-medium leading-relaxed" 
              style={{ '--tw-ring-color': 'var(--color-accent)' }} 
              placeholder="今日の出来事、生徒の様子、業務の振り返り..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
            />
            
            <div className="flex items-center gap-4">
               <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-100 transition-all">
                 <ImageIcon size={16}/> {selectedImage ? '画像を変更' : '写真を追加 (1枚)'}
               </button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
               {selectedImage && (
                 <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                   <img src={selectedImage} alt="preview" className="w-full h-full object-cover" />
                   <button onClick={() => setSelectedImage(null)} className="absolute top-0 right-0 bg-black/50 text-white p-1 rounded-bl-lg"><XCircle size={10}/></button>
                 </div>
               )}
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={saveEntry} className="text-white px-10 py-3 rounded-2xl font-bold hover:opacity-90 shadow-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-sidebar)' }}>
                 <Save size={18}/> 保存する
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
          <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2"><Clock size={18}/> タイムライン</h4>
          {entries.length === 0 && <p className="text-slate-400 text-sm">まだ日記はありません。</p>}
          {entries.map(entry => (
            <div key={entry.id} className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-100 group relative">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex flex-col">
                    <span className="text-lg font-bold font-futura text-slate-700">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{DAYS[new Date(entry.date).getDay()]}</span>
                 </div>
                 <button onClick={() => deleteEntry(entry.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
              
              <div className="flex gap-4">
                 {entry.image && (
                   <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => { const w = window.open(""); w.document.write(`<img src="${entry.image}" style="max-width:100%"/>`); }}>
                     <img src={entry.image} alt="diary" className="w-full h-full object-cover" />
                   </div>
                 )}
                 <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap flex-1">{entry.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TodoView = ({ todos, onAdd, onToggle, onDelete }) => {
  const [input, setInput] = useState('');
  return (
    <div className="animate-in fade-in max-w-4xl mx-auto space-y-10">
      <header className="border-b-2 pb-6 flex justify-between items-center" style={{ borderColor: 'var(--color-accent) 0.1' }}>
        <h3 className="text-2xl font-extrabold flex items-center gap-3"><LayoutList size={28} style={{ color: 'var(--color-accent)' }} /> TODOリスト</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{todos.filter(t => !t.completed).length} Tasks remaining</span>
      </header>
      <div className="flex gap-4">
        <input 
          type="text" 
          className="flex-1 p-4 bg-white rounded-3xl border-none shadow-xl focus:ring-2" 
          style={{ '--tw-ring-color': 'var(--color-accent)' }}
          placeholder="新しいタスクを追加..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && input) { onAdd(input); setInput(''); } }}
        />
        <button onClick={() => { if(input) { onAdd(input); setInput(''); } }} className="p-4 bg-[#2c3e50] text-white rounded-3xl font-bold px-10 shadow-lg hover:opacity-90 active:scale-95 transition-all">追加</button>
      </div>
      <div className="space-y-4 text-left">
        {todos.map(todo => (
          <div key={todo.id} className={`flex items-center justify-between p-6 bg-white rounded-[30px] shadow-sm border border-slate-100 group transition-all ${todo.completed ? 'opacity-50' : ''}`}>
             <div className="flex items-center gap-6 flex-1 text-left">
                <button onClick={() => onToggle(todo.id, todo.completed)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-500 border-green-500' : 'border-slate-200 hover:border-[#8e7d6b]'}`}>{todo.completed && <CheckCircle2 size={20} className="text-white"/>}</button>
                <span className={`text-lg font-medium ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{todo.text}</span>
             </div>
             <button onClick={() => onDelete(todo.id)} className="text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 p-2"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesView = ({ notes, addNote, deleteNote }) => {
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('memo');
  
  const categories = [
    {id:'memo', label:'備忘録', icon:<StickyNote size={14}/>, placeholder:'ふとした気づきやメモ...'},
    {id:'meeting', label:'会議記録', icon:<UsersIcon size={14}/>, placeholder:'会議名、決定事項、宿題事項...'},
    {id:'interview', label:'面談記録', icon:<MessageSquare size={14}/>, placeholder:'対象生徒/保護者、相談内容、経過...'},
    {id:'teaching', label:'授業備忘録', icon:<FileText size={14}/>, placeholder:'小テスト日程、評価基準、横持ちルール...'}
  ];
  
  const currentCat = categories.find(c => c.id === category) || categories[0];

  return (
    <div className="animate-in fade-in space-y-10 pb-20">
      <header className="border-b-2 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ borderColor: 'var(--color-accent) 0.1' }}>
        <h3 className="text-2xl font-extrabold flex items-center gap-3"><StickyNote size={28} style={{ color: 'var(--color-accent)' }} /> 校務ノート</h3>
        <div className="flex bg-white/50 p-2 rounded-2xl shadow-sm border flex-wrap gap-1">
           {categories.map(cat => (
             <button key={cat.id} onClick={() => setCategory(cat.id)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${category === cat.id ? 'text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`} style={category === cat.id ? { backgroundColor: 'var(--color-sidebar)' } : {}}>{cat.icon}{cat.label}</button>
           ))}
        </div>
      </header>
      <div className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-100">
        <textarea className="w-full h-48 bg-[#fdfcf0]/50 border-none rounded-[35px] p-8 text-sm focus:ring-2 resize-none transition-all font-medium text-left" style={{ '--tw-ring-color': 'var(--color-accent)' }} placeholder={currentCat.placeholder} value={inputText} onChange={(e) => setInputText(e.target.value)} />
        <div className="flex justify-end mt-6"><button onClick={() => { if (!inputText) return; addNote(inputText, category); setInputText(''); }} className="text-white px-12 py-4 rounded-2xl font-bold hover:opacity-90 shadow-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-sidebar)' }}><Plus size={20} /> 作成</button></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {notes.filter(n => n.category === category).map(note => (
          <div key={note.id} className="bg-white p-10 rounded-[45px] shadow-md border relative group hover:shadow-2xl transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-futura text-[10px] text-slate-300 font-bold uppercase tracking-widest">{new Date(note.createdAt).toLocaleString('ja-JP')}</span>
              <button onClick={() => deleteNote(note.id)} className="text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 p-2"><Trash2 size={18} /></button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-slate-600">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttendanceView = ({ currentDate, courses, baseTimetable, semesters, selectedClass, setSelectedClass, attendance, updateAttendance, studentLists }) => {
  const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate();
  const students = useMemo(() => (studentLists[selectedClass] || []).slice(0, 40).map((name, i) => ({ id: `s${i+1}`, name })), [studentLists, selectedClass]);
  const lessonDays = useMemo(() => {
    const activeDays = new Set();
    Object.entries(baseTimetable).forEach(([day, slots]) => { Object.values(slots).forEach(val => { if (typeof val === 'string' && val.includes(selectedClass)) activeDays.add(day); }); });
    return activeDays;
  }, [baseTimetable, selectedClass]);
  const getSemesterStatus = (date) => {
    for (const sem of semesters) { if (date >= new Date(sem.start) && date <= new Date(sem.end)) return sem.name; }
    return null;
  };
  return (
    <div className="animate-in fade-in space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 pb-6" style={{ borderColor: 'var(--color-accent) 0.1' }}>
        <h3 className="text-2xl font-extrabold flex items-center gap-3"><UserCheck size={28} style={{ color: 'var(--color-accent)' }} /> 出席簿</h3>
        <div className="flex gap-2 bg-white/50 p-2 rounded-2xl shadow-sm border overflow-x-auto">
           {[...new Set(courses.map(c => c.className))].map(cls => (<button key={cls} onClick={() => setSelectedClass(cls)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${selectedClass === cls ? 'text-white' : 'text-slate-400'}`} style={selectedClass === cls ? { backgroundColor: 'var(--color-sidebar)' } : {}}>{cls || '未設定'}</button>))}
        </div>
      </header>
      <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse table-fixed zebra-table">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="p-4 border-r sticky left-0 bg-slate-50 z-10 w-48 text-left font-bold">氏名 \ 日付</th>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1; const date = new Date(year, month, d); const info = getCalendarInfo(year, month, d); const isLessonDay = lessonDays.has(DAYS[date.getDay()]); const semName = getSemesterStatus(date);
                  return (<th key={d} className={`p-2 border-r text-center w-12 ${info.dayBgClass} ${!isLessonDay ? 'opacity-30' : ''}`} style={isLessonDay ? { borderTop: '4px solid var(--color-accent)' } : {}}><div className={`font-futura text-[8px] ${info.dayColorClass}`}>{DAYS[date.getDay()]}</div><div className={`font-bold ${info.dayColorClass}`}>{d}</div>{semName && isLessonDay && <div className="text-[6px] text-slate-400 mt-1">{semName[0]}</div>}</th>);
                })}
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id} className="h-10 hover:opacity-80 transition-opacity">
                  <td className="p-3 border-r sticky left-0 bg-white z-10 font-medium truncate text-left">{idx + 1}. {s.name}</td>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1; const date = new Date(year, month, d); const isLessonDay = lessonDays.has(DAYS[date.getDay()]); const isInSemester = !!getSemesterStatus(date); const dateKey = `${year}-${month + 1}-${d}`; const statusId = attendance[`${selectedClass}-${dateKey}`]?.[s.id] || 'present'; const status = ATTENDANCE_STATUS.find(as => as.id === statusId) || ATTENDANCE_STATUS[0];
                    return (<td key={i} className={`p-0 border-r text-center relative group ${getCalendarInfo(year, month, d).dayBgClass}`}>{isLessonDay && isInSemester ? (<><select className={`w-full h-10 bg-transparent border-none text-center font-bold cursor-pointer appearance-none ${status.color}`} value={statusId} onChange={(e) => updateAttendance(dateKey, s.id, e.target.value)}>{ATTENDANCE_STATUS.map(as => <option key={as.id} value={as.id}>{as.id === 'present' ? '' : as.mark}</option>)}</select><div className={`pointer-events-none absolute inset-0 flex items-center justify-center font-extrabold ${status.color}`}>{status.mark}</div></>) : <div className="w-full h-full bg-slate-500/5"></div>}</td>);
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ courses, setCourses, semesters, setSemesters, studentLists, setStudentLists, baseTimetable, onSaveTimetable, currentTheme, onThemeChange, location, onLocationChange }) => {
  const [localTable, setLocalTable] = useState(baseTimetable);
  const [newCourse, setNewCourse] = useState({ id: '', className: '', subjectName: '', weeklyLessons: 0 });
  const [locQuery, setLocQuery] = useState('');
  const [locResults, setLocResults] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedClassForList, setSelectedClassForList] = useState('');
  const workDays = ['月', '火', '水', '木', '金', '土', '日'];
  return (
    <div className="space-y-12 pb-20 animate-in fade-in text-left">
      <section className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
        <h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3"><HelpCircle style={{ color: 'var(--color-accent)' }} /> 使い方マニュアル</h3>
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">🚀 はじめに：初期設定のステップ</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 ml-2">
              <li><strong>学期設定</strong>：各学期の開始日・終了日を設定します。</li>
              <li><strong>授業登録</strong>：担当するクラス、科目名、週の時数を登録します。</li>
              <li><strong>名簿インポート</strong>：クラスごとに名簿（CSVまたはテキスト）を取り込みます。</li>
              <li><strong>基本時間割</strong>：登録した授業を時間割に配置します（ここで設定した曜日が、出席簿の入力可能日になります）。</li>
              <li><strong>地域設定</strong>：学校の所在地を設定して、天気予報を表示させます。</li>
            </ol>
          </div>
        </div>
      </section>
      <section className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100"><h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3"><MapPin style={{ color: 'var(--color-accent)' }} /> 地域検索</h3><div className="flex gap-2"><input type="text" placeholder="市区町村名を入力" className="flex-1 p-3 bg-slate-50 rounded-2xl border-none font-bold shadow-inner" value={locQuery} onChange={e => setLocQuery(e.target.value)} /><button onClick={() => fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locQuery)}&count=5&language=ja&format=json`).then(r => r.json()).then(d => setLocResults(d.results || []))} className="p-3 px-8 bg-[#2c3e50] text-white rounded-2xl font-bold"><Search size={18}/></button></div>{locResults.length > 0 && <div className="grid grid-cols-2 gap-2 mt-4">{locResults.map((r, i) => (<button key={i} onClick={() => {onLocationChange({name: r.name, lat: r.latitude, lon: r.longitude}); setLocResults([]);}} className="p-4 bg-slate-50 border rounded-2xl text-left hover:bg-white transition-all"><p className="font-bold text-sm">{r.name}</p><p className="text-[10px] text-slate-400">{r.admin1}</p></button>))}</div>}</section>
      <section className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100"><h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3"><CalendarIcon style={{ color: 'var(--color-accent)' }} /> 学期設定</h3><div className="grid md:grid-cols-3 gap-6">{semesters.map((sem, idx) => (<div key={sem.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200"><h4 className="font-bold mb-4">{sem.name}</h4><div className="space-y-4"><div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">Start</label><input type="date" className="w-full p-2 bg-white rounded-xl border-none font-bold" value={sem.start} onChange={e => { const nl = [...semesters]; nl[idx].start = e.target.value; setSemesters(nl); }} /></div><div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">End</label><input type="date" className="w-full p-2 bg-white rounded-xl border-none font-bold" value={sem.end} onChange={e => { const nl = [...semesters]; nl[idx].end = e.target.value; setSemesters(nl); }} /></div></div></div>))}</div></section>
      <section className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100"><h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3"><Target style={{ color: 'var(--color-accent)' }} /> 授業登録</h3><div className="bg-slate-50 p-8 rounded-[30px] mb-10 border flex gap-4 items-end"><input type="text" placeholder="クラス" className="flex-1 p-3 rounded-xl border-none text-sm font-bold shadow-inner" value={newCourse.className} onChange={e => setNewCourse({...newCourse, className: e.target.value})} /><input type="text" placeholder="授業名" className="flex-1 p-3 rounded-xl border-none text-sm font-bold shadow-inner" value={newCourse.subjectName} onChange={e => setNewCourse({...newCourse, subjectName: e.target.value})} /><input type="number" placeholder="週時数" className="w-24 p-3 rounded-xl border-none text-sm font-bold shadow-inner" value={newCourse.weeklyLessons || ''} onChange={e => setNewCourse({...newCourse, weeklyLessons: parseInt(e.target.value) || 0})} /><button onClick={() => { if (!newCourse.className || !newCourse.subjectName) return; setCourses([...courses, { ...newCourse, id: Date.now().toString() }]); setNewCourse({ id: '', className: '', subjectName: '', weeklyLessons: 0 }); }} className="p-3 px-8 rounded-xl text-white font-bold transition-all shadow-lg hover:opacity-90" style={{ backgroundColor: 'var(--color-sidebar)' }}><Plus size={18}/></button></div></section>
      <section className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden"><header className="flex justify-between items-center mb-10"><h3 className="text-2xl font-extrabold flex items-center gap-3"><Calculator style={{ color: 'var(--color-accent)' }} /> 基本時間割の設定</h3><button onClick={() => onSaveTimetable(localTable)} className="text-white px-10 py-4 rounded-2xl font-bold shadow-xl transition-all" style={{ backgroundColor: 'var(--color-sidebar)' }}><Save size={18} className="inline mr-2" /> 保存する</button></header><div className="overflow-x-auto rounded-[30px] border"><table className="w-full text-center zebra-table border-collapse"><thead className="bg-slate-50"><tr><th className="p-6 border-r w-24 text-[10px] uppercase font-futura tracking-widest text-slate-400">Slot</th>{workDays.map(day => <th key={day} className="p-6 font-bold text-slate-700 text-sm border-r">{day}</th>)}</tr></thead><tbody>{TIME_SLOTS.filter(s => s.isLesson).map(slot => (<tr key={slot.id}><td className="p-4 bg-slate-50/30 border-r font-bold text-[10px] text-slate-500">{slot.label}</td>{workDays.map(day => (<td key={day} className="p-1 border-r"><select className="w-full p-3 bg-transparent border-none text-[10px] font-bold text-slate-700 cursor-pointer appearance-none text-center" value={localTable[day]?.[slot.id] || ''} onChange={(e) => setLocalTable({...localTable, [day]: {...(localTable[day] || {}), [slot.id]: e.target.value }})}><option value="">-</option><optgroup label="登録授業">{courses.map(c => <option key={c.id} value={`${c.className} ${c.subjectName}`}>{c.className} {c.subjectName}</option>)}</optgroup><optgroup label="その他">{OTHER_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}</optgroup></select></td>))}</tr>))}</tbody></table></div></section>
      <section className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100"><h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3"><FileUp style={{ color: 'var(--color-accent)' }} /> 名簿CSVインポート</h3><div className="flex gap-6 items-end bg-slate-50 p-8 rounded-[30px]"><div className="flex-1 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Class</label><select className="w-full p-3 bg-white border-none rounded-2xl text-sm font-bold" onChange={(e) => setSelectedClassForList(e.target.value)}><option value="">クラスを選択</option>{[...new Set(courses.map(c => c.className))].map(cls => <option key={cls} value={cls}>{cls}</option>)}</select></div><div onClick={() => fileInputRef.current.click()} className="p-4 bg-white border-2 border-dashed border-[#8e7d6b]/30 rounded-2xl cursor-pointer font-bold text-sm text-[#8e7d6b] hover:bg-[#8e7d6b]/5 transition-all flex items-center gap-2"><Upload size={18} /> ファイル選択<input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { const names = event.target.result.split(/\r?\n/).map(line => line.split(',')[0].trim()).filter(n => n.length > 0).slice(0, 40); setStudentLists({ ...studentLists, [selectedClassForList]: names }); }; reader.readAsText(file); }} /></div></div></section>
      <section className="bg-white p-10 rounded-[40px] shadow-xl border"><h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3"><Palette style={{ color: 'var(--color-accent)' }} /> テーマ設定</h3><div className="grid grid-cols-2 sm:grid-cols-5 gap-4">{COLOR_PRESETS.map(p => (<button key={p.id} onClick={() => onThemeChange(p.id)} className={`flex flex-col gap-3 p-4 rounded-3xl border-2 transition-all ${currentTheme === p.id ? 'bg-slate-50' : 'bg-white'}`} style={currentTheme === p.id ? { borderColor: 'var(--color-accent)' } : {}}><div className="flex gap-1"><div className="w-6 h-6 rounded-full" style={{ background: p.sidebar }} /><div className="w-6 h-6 rounded-full" style={{ background: p.accent }} /><div className="w-6 h-6 rounded-full" style={{ background: p.bg }} /></div><span className="text-[10px] font-bold text-slate-400">{p.name}</span></button>))}</div></section>
    </div>
  );
};

const MonthlyGrid = ({ currentDate }) => {
  const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
  return (
    <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden animate-in fade-in duration-700">
      <div className="grid grid-cols-7 text-white" style={{ backgroundColor: 'var(--color-sidebar)' }}>{DAYS.map((d, i) => (<div key={d} className={`p-6 text-center font-futura text-[11px] font-extrabold tracking-[0.2em] uppercase ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-300' : 'opacity-60'}`}>{d}</div>))}</div>
      <div className="grid grid-cols-7 border-l border-t border-slate-50">
        {Array.from({ length: firstDay }).map((_, i) => (<div key={i} className="min-h-[140px] bg-slate-50/20 border-r border-b border-slate-50" />))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const info = getCalendarInfo(year, month, i + 1);
          return (<div key={i} className={`min-h-[160px] p-6 border-r border-b border-slate-50 hover:opacity-80 transition-all group relative ${info.dayBgClass}`} style={info.isToday ? { border: '3px solid var(--color-accent)' } : {}}><div className="flex justify-between items-start mb-3"><span className={`text-2xl font-futura font-bold ${info.dayColorClass}`}>{i + 1}</span><div className="text-right flex flex-col items-end gap-1"><span className="text-[9px] text-slate-300 font-bold uppercase">{info.rokuyo}</span><WeatherMoonIcon age={info.moonAge} className="text-slate-400" /></div></div>{info.holiday && (<div className="flex items-center text-[10px] text-red-400 font-bold mb-1 truncate text-left"><FlagIcon /><span className="truncate">{info.holiday}</span></div>)}</div>);
        })}
      </div>
    </div>
  );
};

const VerticalMonthly = ({ currentDate }) => {
  const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate();
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[45px] shadow-2xl border border-slate-100 overflow-hidden">
      <header className="bg-slate-50 p-8 border-b flex justify-between items-baseline"><h3 className="text-xl font-bold">縦型月間予定表</h3><p className="font-futura text-[10px] text-slate-400 tracking-[0.3em] uppercase text-right">Monthly Board</p></header>
      <div className="divide-y divide-slate-100 zebra-table"><table className="w-full border-collapse"><tbody>{Array.from({ length: daysInMonth }).map((_, i) => {
        const info = getCalendarInfo(year, month, i + 1);
        return (<tr key={i} className={`min-h-[75px] hover:opacity-80 transition-colors ${info.dayBgClass}`} style={info.isToday ? { borderLeft: '6px solid var(--color-accent)' } : {}}><td className="w-24 border-r p-4 text-center"><div className="flex flex-col items-center"><div className="flex items-center gap-1"><span className={`text-2xl font-futura font-bold ${info.dayColorClass}`}>{i + 1}</span></div><span className={`text-[10px] font-bold opacity-40 uppercase font-futura ${info.dayColorClass}`}>{DAYS[new Date(year, month, i + 1).getDay()]}</span></div></td><td className="w-24 border-r p-4 text-center"><div className="flex flex-col items-center text-[10px] gap-1"><span className="font-bold" style={{ color: 'var(--color-accent)' }}>{info.rokuyo}</span><WeatherMoonIcon age={info.moonAge} size={14} /></div></td><td className="p-4"><div className="flex items-center gap-4">{info.holiday && (<span className="text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-full font-bold flex items-center"><FlagIcon />{info.holiday}</span>)}<input type="text" className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-100" placeholder="予定を記入..." /></div></td></tr>);
      })}</tbody></table></div>
    </div>
  );
};

const LoadingScreen = ({ themeId }) => {
  const theme = useMemo(() => COLOR_PRESETS.find(p => p.id === themeId) || COLOR_PRESETS[0], [themeId]);
  return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: theme.bg }}>
      <div className="text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: theme.accent, opacity: 0.1 }}></div>
          <div className="absolute inset-0 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}></div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner"><BookOpen size={24} style={{ color: theme.accent }}/></div>
        </div>
        <p className="font-script text-4xl animate-pulse" style={{ color: theme.accent }}>Synchronizing Intelligence...</p>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [courses, setCourses] = useState([]); 
  const [semesters, setSemesters] = useState([
    { id: 'term1', name: '1学期', start: '2026-04-01', end: '2026-07-20' },
    { id: 'term2', name: '2学期', start: '2026-09-01', end: '2026-12-25' },
    { id: 'term3', name: '3学期', start: '2027-01-08', end: '2027-03-24' }
  ]);
  const [studentLists, setStudentLists] = useState({});
  const [baseTimetable, setBaseTimetable] = useState({});
  const [weeklyOverrides, setWeeklyOverrides] = useState({});
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [themeId, setThemeId] = useState('heritage');
  const [location, setLocation] = useState({ name: '東京', lat: 35.6895, lon: 139.6917 });

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else { await signInAnonymously(auth); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const unsubs = [
      onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'appearance'), d => { if(d.exists()){ setThemeId(d.data().themeId || 'heritage'); if(d.data().location) setLocation(d.data().location); } }),
      onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'courses'), d => { if(d.exists()) setCourses(d.data().list || []); }),
      onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'students'), d => { if(d.exists()) setStudentLists(d.data().lists || {}); }),
      onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'baseTimetable'), d => { if(d.exists()) setBaseTimetable(d.data()); setLoading(false); }),
      onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'settings', 'semesters'), d => { if(d.exists()) setSemesters(d.data().list || semesters); }),
      onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'overrides'), s => { const o = {}; s.forEach(d=>o[d.id]=d.data()); setWeeklyOverrides(o); }),
      onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'notes'), s => setNotes(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.createdAt-a.createdAt))),
      onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'todos'), s => setTodos(s.docs.map(d=>({id:d.id,...d.data()})))),
      onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'attendance'), s => { const a = {}; s.forEach(d=>a[d.id]=d.data()); setAttendance(a); }),
      onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'diary'), s => {/* Diary data handled in component */})
    ];
    return () => unsubs.forEach(f => f());
  }, [user]);

  const saveOverride = async (dayKey, slotId, value) => {
    if (!user) return;
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'overrides', dayKey), { [slotId]: value }, { merge: true });
  };
  
  const changeMonth = (date, offset, setDate) => {
    const next = new Date(date.getFullYear(), date.getMonth() + offset, 1);
    if (next >= new Date(2026, 1, 1) && next <= new Date(2027, 4, 1)) { setDate(next); }
  };

  if (!user || loading) return <LoadingScreen themeId={themeId} />;

  return (
    <div className="flex h-screen overflow-hidden transition-all duration-500 font-jp">
      <CustomStyles themeId={themeId} />
      
      <nav className="w-16 md:w-64 flex flex-col h-full shrink-0 border-r border-black/10 transition-colors duration-500" style={{ backgroundColor: 'var(--color-sidebar)', color: '#ecf0f1' }}>
        <div className="p-8 mb-4 flex flex-col items-center md:items-start border-b border-white/5 text-left">
           <div className="p-2 rounded-xl shadow-lg mb-4" style={{ backgroundColor: 'var(--color-accent)' }}><BookOpen size={24} className="text-white"/></div>
           <h1 className="font-futura font-extrabold text-xl tracking-tighter hidden md:block">Teacher Planner</h1>
           <span className="font-script text-sm hidden md:block opacity-60" style={{ color: 'var(--color-accent)' }}>Academic Suite</span>
        </div>
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} icon={<Columns size={18}/>} label="週間予定表" en="Weekly" />
          <NavItem active={activeTab === 'monthly-grid'} onClick={() => setActiveTab('monthly-grid')} icon={<CalendarIcon size={18}/>} label="グリッド月間" en="Grid Monthly" />
          <NavItem active={activeTab === 'monthly-vertical'} onClick={() => setActiveTab('monthly-vertical')} icon={<List size={18}/>} label="縦型予定表" en="Vertical List" />
          <NavItem active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<UserCheck size={18}/>} label="出席簿・集計" en="Attendance" />
          <NavItem active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<StickyNote size={18}/>} label="校務ノート" en="Academic Notes" />
          <NavItem active={activeTab === 'todos'} onClick={() => setActiveTab('todos')} icon={<LayoutList size={18}/>} label="TODOリスト" en="Tasks" />
          <NavItem active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<Clock size={18}/>} label="業務日記" en="Daily Log" />
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18}/>} label="設定・地域" en="Settings" />
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-[#f7f6f2]/95 backdrop-blur-md px-10 py-6 border-b border-[#2c3e50]/5 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button onClick={() => changeMonth(currentDate, -1, setCurrentDate)} className="p-2 hover:bg-black/5 rounded-full active:scale-90 transition-all"><ChevronLeft size={20}/></button>
              <button onClick={() => changeMonth(currentDate, 1, setCurrentDate)} className="p-2 hover:bg-black/5 rounded-full active:scale-90 transition-all"><ChevronRight size={20}/></button>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              <span className="font-futura mr-2">{currentDate.getFullYear()}</span>
              <span className="text-[#8e7d6b] font-bold" style={{ color: 'var(--color-accent)' }}>年</span>
              <span className="font-futura ml-4 mr-1">{currentDate.getMonth() + 1}</span>
              <span className="text-[#8e7d6b] font-bold" style={{ color: 'var(--color-accent)' }}>月</span>
            </h2>
          </div>
          <HeaderStatus lat={location.lat} lon={location.lon} />
        </header>

        <div className="p-6 md:p-10 max-w-[1700px] mx-auto text-center">
          {activeTab === 'weekly' && <WeeklyPlanner currentDate={currentDate} baseTimetable={baseTimetable} weeklyOverrides={weeklyOverrides} onSave={saveOverride} />}
          {activeTab === 'monthly-grid' && <MonthlyGrid currentDate={currentDate} />}
          {activeTab === 'monthly-vertical' && <VerticalMonthly currentDate={currentDate} />}
          {activeTab === 'attendance' && <AttendanceView currentDate={currentDate} courses={courses} baseTimetable={baseTimetable} semesters={semesters} selectedClass={selectedClass} setSelectedClass={setSelectedClass} attendance={attendance} updateAttendance={(dk, sid, stat) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'attendance', `${selectedClass}-${dk}`), { [sid]: stat }, { merge: true })} studentLists={studentLists} />}
          {activeTab === 'notes' && <NotesView notes={notes} addNote={(t, c) => addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notes'), { content: t, category: c, createdAt: Date.now() })} deleteNote={(id) => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'notes', id))} />}
          {activeTab === 'diary' && <DiaryView user={user} appId={appId} />}
          {activeTab === 'todos' && <TodoView todos={todos} onAdd={(t) => addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'todos'), { text: t, completed: false, createdAt: Date.now() })} onToggle={(id, c) => updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'todos', id), { completed: !c })} onDelete={(id) => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'todos', id))} />}
          {activeTab === 'settings' && <SettingsView courses={courses} setCourses={(c) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'courses'), { list: c })} semesters={semesters} setSemesters={(s) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'semesters'), { list: s })} studentLists={studentLists} setStudentLists={(s) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'students'), { lists: s })} baseTimetable={baseTimetable} onSaveTimetable={(t) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'baseTimetable'), t)} currentTheme={themeId} onThemeChange={(tid) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'appearance'), { themeId: tid, location }, { merge: true })} location={location} onLocationChange={(loc) => setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'appearance'), { themeId, location: loc }, { merge: true })} />}
        </div>
      </main>
    </div>
  );
};

export default App;
