
import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Wallet, 
  Briefcase, 
  Settings,
  Ticket,
  ChevronUp,
  Moon,
  Sun,
  Palette,
  Check,
  Type,
  ShoppingBag,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrips, FontSize } from '../store/TripContext';

const THEME_COLORS = [
  { name: '紅色', value: '#BC002D' },
  { name: '黃色', value: '#FFD700' },
  { name: '寶藍色', value: '#0038A8' },
  { name: '灰藍色', value: '#4682B4' },
  { name: '粉紅色', value: '#FFB7C5' },
  { name: '淺黃色', value: '#F7D08A' },
  { name: '淺綠色', value: '#90EE90' },
  { name: '灰色', value: '#808080' },
  { name: '橙色', value: '#FFA500' },
  { name: 'Miku綠', value: '#39C5BB' }
];

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px'
};

const FONT_SIZE_INDEX: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '188, 0, 45';
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { lastTripId, trips, theme, themeColor, fontSize, setTheme, setThemeColor, setFontSize, clearAllData } = useTrips();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const effectiveTripId = tripId || lastTripId || (trips.length > 0 ? trips[0].id : null);

  const navItems = [
    { name: '行程', icon: <Calendar size={18} />, path: effectiveTripId ? `/trip/${effectiveTripId}` : '#' },
    { name: '預約', icon: <Ticket size={18} />, path: effectiveTripId ? `/bookings/${effectiveTripId}` : '#' },
    { name: '預算', icon: <Wallet size={18} />, path: effectiveTripId ? `/budget/${effectiveTripId}` : '#' },
    { name: '購物', icon: <ShoppingBag size={18} />, path: effectiveTripId ? `/shopping/${effectiveTripId}` : '#' },
    { name: '工具', icon: <Briefcase size={18} />, path: effectiveTripId ? `/toolbox/${effectiveTripId}` : '#' },
  ];

  const themeStyles = useMemo(() => `
    :root {
      --primary-color: ${themeColor};
      --primary-rgb: ${hexToRgb(themeColor)};
      --bg-main: ${theme === 'dark' ? '#121212' : '#F8F9FA'};
      --bg-card: ${theme === 'dark' ? '#1E1E1E' : '#FFFFFF'};
      --text-main: ${theme === 'dark' ? '#E0E0E0' : '#2D3436'};
      --text-muted: ${theme === 'dark' ? '#9E9E9E' : '#9CA3AF'};
      --border-color: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
      --base-font-size: ${FONT_SIZE_MAP[fontSize]};
    }
    html { font-size: var(--base-font-size); }
    .theme-primary { color: var(--primary-color) !important; }
    .theme-bg-primary { background-color: var(--primary-color) !important; }
    .theme-border-primary { border-color: var(--primary-color) !important; }
    .theme-bg-soft { background-color: rgba(var(--primary-rgb), 0.1) !important; }
    .theme-text-contrast { color: var(--text-main) !important; }
    body { background-color: var(--bg-main); color: var(--text-main); transition: background-color 0.3s ease; }
  `, [themeColor, theme, fontSize]);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    setFontSize(FONT_SIZE_INDEX[index]);
  };

  return (
    <div className={`min-h-screen pb-24 overflow-x-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <style>{themeStyles}</style>
      
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 z-50 px-1 py-1 shadow-lg border-t transition-colors duration-300
        ${theme === 'dark' ? 'bg-[#1E1E1E]/95 border-white/5' : 'bg-white/95 border-gray-100'} backdrop-blur-xl`}>
        <div className="max-w-xl mx-auto flex items-center justify-between px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={(e) => {
                if (item.path === '#') { e.preventDefault(); alert('請先建立旅程！'); }
                setIsSettingsOpen(false);
              }}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 group px-1 py-1 transition-colors flex-1
                ${isActive && item.path !== '#' ? 'theme-primary' : 'text-gray-400'}
              `}
            >
              <div className={`p-1.5 rounded-xl transition-all ${location.pathname.startsWith(item.path) && item.path !== '#' ? 'theme-bg-soft' : 'group-hover:bg-gray-100/5'}`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.name}</span>
            </NavLink>
          ))}

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex flex-col items-center gap-0.5 group px-1 py-1 transition-colors flex-1 ${isSettingsOpen ? 'theme-primary' : 'text-gray-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isSettingsOpen ? 'theme-bg-soft' : 'group-hover:bg-gray-100/5'}`}>
              <Settings size={20} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">設置</span>
          </button>
        </div>

        <AnimatePresence>
          {isSettingsOpen && (
            /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
            <motion.div
              {...({
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 10 }
              } as any)}
              className={`absolute bottom-20 right-4 left-4 max-w-sm mx-auto rounded-2xl p-6 shadow-2xl border transition-colors
                ${theme === 'dark' ? 'bg-[#2D3436] border-white/10' : 'bg-white border-gray-100'}`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm tracking-tight theme-text-contrast`}>顯示模式</span>
                  <button 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg theme-bg-soft theme-primary font-bold text-xs uppercase"
                  >
                    {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === 'light' ? '淺色' : '深色'}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type size={14} className="theme-primary" />
                      <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>字體大小</span>
                    </div>
                    <span className="text-[10px] font-black theme-primary uppercase">{fontSize}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={FONT_SIZE_INDEX.indexOf(fontSize)}
                    onChange={handleFontSizeChange}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[8px] text-gray-400 font-bold">小</span>
                    <span className="text-[8px] text-gray-400 font-bold">中</span>
                    <span className="text-[8px] text-gray-400 font-bold">大</span>
                    <span className="text-[8px] text-gray-400 font-bold">特大</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette size={14} className="theme-primary" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>主題色彩</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-between">
                    {THEME_COLORS.map(c => (
                      <button 
                        key={c.value}
                        onClick={() => setThemeColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                      >
                        {themeColor === c.value && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <button 
                    onClick={() => { navigate('/'); setIsSettingsOpen(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all
                      ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-50 text-[#2D3436] hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Home size={16} className="theme-primary" />
                      <span className="text-sm font-bold">回到主頁</span>
                    </div>
                    <ChevronUp size={14} className="rotate-90 opacity-20" />
                  </button>

                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all
                      ${theme === 'dark' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 size={16} />
                      <span className="text-sm font-bold">清除所有資料</span>
                    </div>
                    <AlertTriangle size={14} className="opacity-40" />
                  </button>

                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full py-2 text-center text-gray-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    關閉設置
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl border transition-colors
                ${theme === 'dark' ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-100'}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-xl font-black tracking-tight theme-text-contrast`}>確定要清除所有資料嗎？</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    此操作將永久刪除所有已建立的旅程規劃、預約資訊、預算記錄及購物清單。此動作無法復原。
                  </p>
                </div>
                <div className="flex flex-col w-full gap-3 pt-4">
                  <button 
                    onClick={() => {
                      clearAllData();
                      setShowClearConfirm(false);
                      setIsSettingsOpen(false);
                      navigate('/');
                    }}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    確定清除
                  </button>
                  <button 
                    onClick={() => setShowClearConfirm(false)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all
                      ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
