
import React, { useState } from 'react';
import { Plus, Calendar, MapPin, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../store/TripContext';
import { Trip } from '../types';
import { motion } from 'framer-motion';

const TripCard: React.FC<{ trip: Trip; onDelete: (id: string) => void }> = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const daysDiff = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const countdown = daysDiff(trip.startDate);
  const totalDays = daysDiff(trip.endDate) - daysDiff(trip.startDate) + 1;

  return (
    /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
    <motion.div 
      {...({ whileHover: { y: -2 } } as any)}
      className="group bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm border border-[var(--border-color)] flex flex-col relative"
    >
      <div 
        onClick={() => navigate(`/trip/${trip.id}`)}
        className="cursor-pointer"
      >
        <div className="relative h-40 overflow-hidden">
          <img 
            src={trip.coverImage || 'https://picsum.photos/seed/japan/800/400'} 
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <h3 className="text-lg font-bold text-white leading-tight">{trip.title}</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-200 font-medium">
              <Calendar size={12} />
              <span>{trip.startDate}</span>
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-lg px-2 py-0.5 text-[9px] text-white font-bold border border-white/20">
            {totalDays}D
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
            <MapPin size={12} className="theme-primary" />
            <span>日本</span>
          </div>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
              className="p-1 hover:bg-gray-100/10 rounded-lg transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            {showOptions && (
              <div className="absolute right-0 bottom-full mb-1 w-28 bg-[var(--bg-card)] rounded-xl shadow-xl border border-[var(--border-color)] py-1 z-10">
                <button 
                  onClick={() => onDelete(trip.id)}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/5 flex items-center gap-2 font-bold transition-colors"
                >
                  <Trash2 size={12} /> 刪除旅程
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
              {countdown > 0 ? '距離出發' : '旅程中'}
            </span>
            <span className="text-sm font-black theme-text-contrast">
              {countdown > 0 ? `${countdown} 天` : 'DAY 1'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100/10 rounded-full overflow-hidden">
            {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
            <motion.div 
              {...({
                initial: { width: 0 },
                animate: { width: countdown > 0 ? '0%' : '100%' }
              } as any)}
              className="h-full theme-bg-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreateTripModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (t: Trip) => void }> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ title: '', start: '', end: '', image: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      startDate: formData.start,
      endDate: formData.end,
      status: 'planning',
      coverImage: formData.image || `https://picsum.photos/seed/${formData.title}/800/400`,
      dailyItinerary: [],
      bookings: [],
      budget: { total: 0, spent: 0 },
      checklist: [],
      shoppingList: []
    };
    onAdd(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
      <motion.div 
        {...({
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 }
        } as any)}
        className="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 theme-bg-primary" />
        <h2 className="text-xl font-black theme-text-contrast tracking-tight">新增旅程</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">旅程標題</label>
            <input 
              required
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-sm font-bold border border-[var(--border-color)] outline-none focus:theme-border-primary theme-text-contrast"
              placeholder="例如：東京 2026"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">開始日期</label>
              <input 
                required 
                type="date" 
                onClick={(e) => (e.target as any).showPicker?.()}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none theme-text-contrast cursor-pointer" 
                value={formData.start} 
                onChange={e => setFormData({ ...formData, start: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">結束日期</label>
              <input 
                required 
                type="date" 
                onClick={(e) => (e.target as any).showPicker?.()}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none theme-text-contrast cursor-pointer" 
                value={formData.end} 
                onChange={e => setFormData({ ...formData, end: e.target.value })} 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-xs text-gray-400 font-bold">取消</button>
            <button type="submit" className="flex-[1.5] py-3 theme-bg-primary text-white rounded-xl text-xs font-black shadow-lg">建立旅程</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { trips, addTrip, deleteTrip } = useTrips();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black theme-text-contrast tracking-tight">我的旅程</h1>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">規劃下一趟日本之旅</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-6">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
        ))}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group h-40 sm:h-48 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:theme-border-primary hover:theme-bg-soft flex flex-col items-center justify-center gap-3 transition-all duration-300"
        >
          <div className="p-3 bg-gray-50/10 group-hover:theme-bg-soft rounded-full text-gray-400 group-hover:theme-primary transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">新增規劃</span>
        </button>
      </div>

      <CreateTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addTrip}
      />
    </div>
  );
};

export default Dashboard;
