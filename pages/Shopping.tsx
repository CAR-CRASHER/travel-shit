
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Filter, 
  Tag, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { useTrips } from '../store/TripContext';
import { ShoppingItem, ShoppingCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingPage: React.FC = () => {
  const { tripId } = useParams();
  const { getTripById, updateTrip } = useTrips();
  const trip = getTripById(tripId || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'bought' | 'to-buy'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [newItem, setNewItem] = useState({ name: '', location: '', category: ShoppingCategory.OTHERS });

  if (!trip) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">找不到該旅程資料</div>;

  const shoppingList = trip.shoppingList || [];

  const handleToggleBought = (id: string) => {
    const updated = shoppingList.map(item => 
      item.id === id ? { ...item, bought: !item.bought } : item
    );
    updateTrip({ ...trip, shoppingList: updated });
  };

  const handleDeleteItem = (id: string) => {
    const updated = shoppingList.filter(item => item.id !== id);
    updateTrip({ ...trip, shoppingList: updated });
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    const item: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      location: newItem.location || '未指定',
      category: newItem.category,
      bought: false
    };
    updateTrip({ ...trip, shoppingList: [...shoppingList, item] });
    setIsModalOpen(false);
    setNewItem({ name: '', location: '', category: ShoppingCategory.OTHERS });
  };

  const boughtCount = shoppingList.filter(i => i.bought).length;
  const pendingCount = shoppingList.length - boughtCount;

  const filteredItems = useMemo(() => {
    return shoppingList.filter(item => {
      const statusMatch = filterStatus === 'all' || (filterStatus === 'bought' ? item.bought : !item.bought);
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  }, [shoppingList, filterStatus, filterCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black theme-text-contrast tracking-tight uppercase">購物清單</h1>
          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">規劃日本必買好物</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="theme-bg-primary text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 統計面板 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button 
          onClick={() => setFilterStatus('bought')}
          className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1
            ${filterStatus === 'bought' ? 'theme-bg-soft theme-border-primary' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}
        >
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-green-500">已購買</span>
          <span className="text-lg sm:text-xl font-black theme-text-contrast">{boughtCount}</span>
        </button>
        <button 
          onClick={() => setFilterStatus('to-buy')}
          className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1
            ${filterStatus === 'to-buy' ? 'theme-bg-soft theme-border-primary' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}
        >
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-orange-500">待購買</span>
          <span className="text-lg sm:text-xl font-black theme-text-contrast">{pendingCount}</span>
        </button>
      </div>

      {/* 篩選欄 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] font-bold theme-text-contrast appearance-none outline-none"
          >
            <option value="all">所有類別</option>
            {Object.values(ShoppingCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>
        <button 
          onClick={() => { setFilterStatus('all'); setFilterCategory('all'); }}
          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[8px] font-black uppercase tracking-widest theme-text-contrast"
        >
          重置
        </button>
      </div>

      {/* 列表內容 */}
      <div className="space-y-3">
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag size={32} className="mx-auto text-gray-200 mb-2 opacity-20" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">目前沒有符合條件的項目</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => (
            /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
            <motion.div 
              {...({
                layout: true,
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.95 }
              } as any)}
              key={item.id}
              className={`bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)] flex items-center gap-4 group transition-all
                ${item.bought ? 'opacity-60' : ''}`}
            >
              <button 
                onClick={() => handleToggleBought(item.id)}
                className="shrink-0"
              >
                {item.bought ? (
                  <div className="theme-bg-primary text-white p-0.5 rounded-full"><CheckCircle2 size={20} /></div>
                ) : (
                  <Circle className="text-gray-300" size={20} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className={`text-xs font-black theme-text-contrast truncate ${item.bought ? 'line-through' : ''}`}>
                    {item.name}
                  </h4>
                  <span className="text-[8px] font-black theme-bg-soft theme-primary px-1.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] font-bold">
                  <MapPin size={10} />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="p-1.5 text-gray-200 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 新增彈窗 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
            <motion.div 
              {...({
                initial: { scale: 0.95, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.95, opacity: 0 }
              } as any)}
              className="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl border border-[var(--border-color)]"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg theme-bg-soft theme-primary"><Plus size={18} /></div>
                <h3 className="text-lg font-black theme-text-contrast tracking-tight uppercase">新增購物項目</h3>
              </div>
              
              <div className="space-y-4">
                {/* 物品名稱 */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">物品名稱</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none focus:theme-border-primary theme-text-contrast" 
                    placeholder="例如：薯條三兄弟、合利他命" 
                    value={newItem.name} 
                    onChange={e => setNewItem({...newItem, name: e.target.value})} 
                  />
                </div>

                {/* 購買地點 */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">建議購買地點</label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none focus:theme-border-primary theme-text-contrast" 
                    placeholder="例如：成田機場、Donki" 
                    value={newItem.location} 
                    onChange={e => setNewItem({...newItem, location: e.target.value})} 
                  />
                </div>

                {/* 類別 */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">物品類別</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value as ShoppingCategory})}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none focus:theme-border-primary theme-text-contrast"
                  >
                    {Object.values(ShoppingCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs text-gray-400 font-bold uppercase tracking-widest">取消</button>
                <button onClick={handleAddItem} className="flex-[1.5] py-3 theme-bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                  加入清單
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShoppingPage;
