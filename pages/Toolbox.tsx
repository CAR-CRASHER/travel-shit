
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Plus, Trash2, 
  RefreshCcw, ArrowRightLeft, DollarSign, Info,
  ListTodo, Landmark
} from 'lucide-react';
import { useTrips } from '../store/TripContext';
import { motion, AnimatePresence } from 'framer-motion';

const Toolbox: React.FC = () => {
  const { tripId } = useParams();
  const { getTripById, updateTrip } = useTrips();
  const trip = getTripById(tripId || '');

  const [newItem, setNewItem] = useState('');
  const [jpyAmount, setJpyAmount] = useState('1000');
  const [hkdAmount, setHkdAmount] = useState('55');
  const exchangeRate = 0.051; 

  useEffect(() => {
    const jpy = parseFloat(jpyAmount);
    if (!isNaN(jpy)) {
      setHkdAmount((jpy * exchangeRate).toFixed(2));
    }
  }, [jpyAmount]);

  if (!trip) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">找不到該旅程資料</div>;

  const toggleCheck = (id: string) => {
    const updated = trip.checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateTrip({ ...trip, checklist: updated });
  };

  const deleteItem = (id: string) => {
    const updated = trip.checklist.filter(item => item.id !== id);
    updateTrip({ ...trip, checklist: updated });
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const item = { id: Math.random().toString(36).substr(2, 9), item: newItem, completed: false };
    updateTrip({ ...trip, checklist: [...trip.checklist, item] });
    setNewItem('');
  };

  const completedCount = trip.checklist.filter(i => i.completed).length;
  const progress = trip.checklist.length > 0 ? (completedCount / trip.checklist.length) * 100 : 0;

  return (
    <div className="space-y-8 scrollbar-hide">
      <div>
        <h1 className="text-2xl font-black theme-text-contrast tracking-tight uppercase">旅行工具箱</h1>
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">匯率換算與行前準備</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Currency Converter - 置頂 */}
        {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
        <motion.div 
          {...({
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 }
          } as any)}
          className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 theme-bg-primary opacity-20" />
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg theme-bg-soft theme-primary"><Landmark size={18} /></div>
              <h3 className="text-sm font-black tracking-tight uppercase">實時匯率換算</h3>
            </div>
            <RefreshCcw size={14} className="theme-primary animate-pulse opacity-50" />
          </div>

          <div className="space-y-4 max-w-lg mx-auto w-full">
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 ml-2">日圓 (JPY)</label>
                <div className="flex items-center bg-gray-50/10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border border-[var(--border-color)] group-focus-within:theme-border-primary transition-all">
                  <span className="text-xl sm:text-2xl font-black theme-primary mr-3 sm:mr-4">¥</span>
                  <input 
                    type="number"
                    className="flex-1 bg-transparent text-xl sm:text-2xl font-black outline-none theme-text-contrast"
                    value={jpyAmount}
                    onChange={e => setJpyAmount(e.target.value)}
                  />
                  <div className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase bg-[var(--bg-main)] px-2 py-1 rounded-md">Yen</div>
                </div>
              </div>

              <div className="flex justify-center -my-7 sm:-my-8 relative z-10">
                <div className="bg-[var(--bg-main)] theme-primary p-2.5 sm:p-3 rounded-full shadow-lg border-4 border-[var(--bg-card)] hover:scale-110 transition-transform cursor-pointer">
                  <ArrowRightLeft size={16} />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 ml-2">港幣 (HKD)</label>
                <div className="flex items-center bg-gray-50/10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border border-[var(--border-color)]">
                  <span className="text-xl sm:text-2xl font-black text-gray-300 mr-3 sm:mr-4">$</span>
                  <input 
                    readOnly
                    className="flex-1 bg-transparent text-xl sm:text-2xl font-black text-[#00A86B] outline-none"
                    value={hkdAmount}
                  />
                  <div className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase bg-[var(--bg-main)] px-2 py-1 rounded-md">HK$</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/10 p-4 rounded-xl border border-[var(--border-color)] flex items-start gap-3 mt-4">
              <Info className="theme-primary shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] font-bold text-[var(--text-muted)] leading-normal tracking-tight">
                當前市場參考匯率：<span className="theme-primary">1 JPY ≈ {exchangeRate} HKD</span>。數據僅供參考，實際請以銀行公告為準。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Checklist - 置底 */}
        {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
        <motion.div 
          {...({
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1 }
          } as any)}
          className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg theme-bg-soft theme-primary"><ListTodo size={18} /></div>
              <h3 className="text-sm font-black tracking-tight uppercase">行前清單</h3>
            </div>
            <span className="text-[10px] font-black theme-bg-soft theme-primary px-3 py-1 rounded-full uppercase tracking-widest">
              {completedCount} / {trip.checklist.length}
            </span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2.5">
              <span>清單完成進度</span>
              <span className="theme-primary">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100/10 rounded-full overflow-hidden">
              {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
              <motion.div 
                {...({
                  initial: { width: 0 },
                  animate: { width: `${progress}%` },
                  transition: { duration: 0.8, ease: "easeOut" }
                } as any)}
                className="h-full theme-bg-primary"
              />
            </div>
          </div>

          <form onSubmit={addItem} className="flex gap-2 mb-8">
            <input 
              className="flex-1 px-5 py-3 rounded-2xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none focus:theme-border-primary transition-all theme-text-contrast"
              placeholder="新增必備物品或待辦項目..."
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
            />
            <button className="p-3 theme-bg-primary text-white rounded-2xl shadow-md transition-all active:scale-95 shrink-0 hover:shadow-lg">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 flex-1 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {trip.checklist.length === 0 ? (
                <div className="text-center py-10">
                  <ListTodo size={32} className="mx-auto text-gray-200 mb-2 opacity-20" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">目前清單是空的</p>
                </div>
              ) : (
                trip.checklist.map(item => (
                  /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
                  <motion.div 
                    {...({
                      layout: true,
                      initial: { opacity: 0, scale: 0.98 },
                      animate: { opacity: 1, scale: 1 },
                      exit: { opacity: 0, scale: 0.98 }
                    } as any)}
                    key={item.id} 
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50/5 transition-all group border border-transparent hover:border-[var(--border-color)]"
                  >
                    <button 
                      onClick={() => toggleCheck(item.id)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      {item.completed ? (
                        <div className="p-0.5 bg-[#00A86B]/10 rounded-full"><CheckCircle2 className="text-[#00A86B]" size={20} /></div>
                      ) : (
                        <div className="p-0.5"><Circle className="text-gray-300 group-hover:text-gray-400" size={20} /></div>
                      )}
                      <span className={`text-xs font-bold transition-all ${item.completed ? 'text-gray-400 line-through' : 'theme-text-contrast'}`}>
                        {item.item}
                      </span>
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Toolbox;
