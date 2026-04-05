
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Sun, Cloud, CloudSun, CloudRain, CloudSnow, 
  Plus, Utensils, Camera, TrainFront, Hotel, ShoppingBag,
  Clock, MapPin, Trash2, AlertCircle, GripVertical, Info
} from 'lucide-react';
import { useTrips } from '../store/TripContext';
import { Trip, ActivityType, Activity } from '../types';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const TypeIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case ActivityType.FOOD: return <Utensils size={14} className="text-orange-500" />;
    case ActivityType.SIGHTSEEING: return <Camera size={14} className="text-blue-500" />;
    case ActivityType.TRANSPORT: return <TrainFront size={14} className="text-green-500" />;
    case ActivityType.HOTEL: return <Hotel size={14} className="text-purple-500" />;
    case ActivityType.SHOPPING: return <ShoppingBag size={14} className="text-pink-500" />;
    default: return <MapPin size={14} className="text-gray-500" />;
  }
};

const TripDetail: React.FC = () => {
  const { tripId } = useParams();
  const { getTripById, updateTrip, setLastTripId } = useTrips();
  const trip = getTripById(tripId || '');
  
  const [activeDay, setActiveDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  
  const initialActivityState: Partial<Activity> = { 
    time: '10:00', 
    type: ActivityType.SIGHTSEEING, 
    location: '', 
    note: '', 
    cost: 0 
  };
  const [newActivity, setNewActivity] = useState<Partial<Activity>>(initialActivityState);

  useEffect(() => {
    if (tripId) setLastTripId(tripId);
  }, [tripId, setLastTripId]);

  if (!trip) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">找不到該旅程資料</div>;

  const currentItinerary = trip.dailyItinerary.find(i => i.day === activeDay) || {
    day: activeDay,
    date: new Date(new Date(trip.startDate).getTime() + (activeDay - 1) * 86400000).toISOString().split('T')[0],
    activities: []
  };

  const activities = currentItinerary.activities;

  const handleSaveActivity = () => {
    if (!newActivity.location) return;
    const activityData: Activity = {
      id: editingActivityId || Math.random().toString(36).substr(2, 9),
      time: newActivity.time || '10:00',
      type: newActivity.type as ActivityType,
      location: newActivity.location || '',
      note: newActivity.note || '',
      cost: Number(newActivity.cost) || 0
    };

    const updatedItinerary = [...(trip.dailyItinerary || [])];
    const dayIndex = updatedItinerary.findIndex(i => i.day === activeDay);

    if (dayIndex > -1) {
      let dayActivities = [...updatedItinerary[dayIndex].activities];
      if (editingActivityId) {
        dayActivities = dayActivities.map(a => a.id === editingActivityId ? activityData : a);
      } else {
        dayActivities.push(activityData);
        dayActivities.sort((a, b) => a.time.localeCompare(b.time));
      }
      updatedItinerary[dayIndex] = { ...updatedItinerary[dayIndex], activities: dayActivities };
    } else {
      updatedItinerary.push({ day: activeDay, date: currentItinerary.date, activities: [activityData] });
    }

    updateTrip({ ...trip, dailyItinerary: updatedItinerary });
    setIsModalOpen(false);
    setNewActivity(initialActivityState);
    setEditingActivityId(null);
  };

  const handleReorder = (newOrder: Activity[]) => {
    const updatedItinerary = trip.dailyItinerary.map(day => 
      day.day === activeDay ? { ...day, activities: newOrder } : day
    );
    updateTrip({ ...trip, dailyItinerary: updatedItinerary });
  };

  const deleteActivity = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = trip.dailyItinerary.map(day => 
      day.day === activeDay ? { ...day, activities: day.activities.filter(a => a.id !== id) } : day
    );
    updateTrip({ ...trip, dailyItinerary: updated });
  };

  const totalDays = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1;
  const dayButtons = Array.from({ length: totalDays }, (_, i) => i + 1);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeBtn = scrollContainerRef.current?.querySelector(`[data-day="${activeDay}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeDay]);

  return (
    <div className="space-y-6">
      {/* 置頂滾動日期列 */}
      <nav className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-[var(--bg-main)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide snap-x touch-pan-x select-none pb-1"
        >
          {dayButtons.map(dayNum => {
            const isActive = activeDay === dayNum;
            const date = new Date(new Date(trip.startDate).getTime() + (dayNum - 1) * 86400000);
            const dayOfWeek = date.toLocaleDateString('zh-TW', { weekday: 'short' });
            
            return (
              <button
                key={dayNum}
                data-day={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`flex flex-col items-center min-w-[64px] py-2 rounded-xl transition-all snap-center cursor-pointer
                  ${isActive 
                    ? 'theme-bg-primary text-white shadow-md scale-105' 
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-gray-50/5'}`}
              >
                <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                  {dayOfWeek}
                </span>
                <span className="text-sm font-black mt-0.5">{dayNum}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black theme-text-contrast tracking-tighter uppercase">Day {activeDay}</h2>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={10} /> {currentItinerary.date}
            </p>
          </div>
          <button 
            onClick={() => { setNewActivity(initialActivityState); setEditingActivityId(null); setIsModalOpen(true); }} 
            className="theme-bg-primary text-white px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          >
            <Plus size={16} /> 新增活動
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-gray-200 dark:bg-white/10 z-0" />
          
          <Reorder.Group axis="y" values={activities} onReorder={handleReorder} className="space-y-4">
            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 opacity-30">
                <div className="w-12 h-12 rounded-full border border-dashed border-gray-400 flex items-center justify-center">
                  <Plus size={20} className="text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">目前尚無安排行程</p>
              </div>
            )}
            {activities.map((activity) => (
              <Reorder.Item 
                key={activity.id} 
                value={activity}
                className="relative pl-10 group cursor-grab active:cursor-grabbing"
              >
                <div className="absolute left-[11px] top-6 w-2 h-2 rounded-full bg-white border-2 theme-border-primary z-10" />
                <div 
                  onClick={() => { setNewActivity(activity); setEditingActivityId(activity.id); setIsModalOpen(true); }}
                  className="bg-[var(--bg-card)] p-4 rounded-2xl shadow-sm border border-[var(--border-color)] flex items-start gap-5 hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col items-center min-w-[44px] mt-1 space-y-1">
                    <span className="text-[11px] font-black theme-text-contrast leading-none">{activity.time}</span>
                    <div className="w-4 h-[1px] bg-gray-100 dark:bg-white/5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-1.5 rounded-lg theme-bg-soft shrink-0"><TypeIcon type={activity.type} /></div>
                      <h4 className="text-sm font-black theme-text-contrast truncate flex-1 tracking-tight">{activity.location}</h4>
                    </div>
                    
                    {activity.note && (
                      <p className="text-[10px] text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed pl-1 border-l border-gray-100 dark:border-white/5 ml-1 mt-2">
                        {activity.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <div className="flex items-center gap-2">
                      {activity.cost > 0 && (
                        <span className="text-[10px] font-black theme-primary bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded">¥{activity.cost.toLocaleString()}</span>
                      )}
                      <div className="text-gray-200 group-hover:text-gray-400 transition-colors"><GripVertical size={14} /></div>
                    </div>
                    <button onClick={(e) => deleteActivity(e, activity.id)} className="p-1 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </section>

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
              className="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl overflow-hidden border border-[var(--border-color)]"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg theme-bg-soft theme-primary"><Plus size={18} /></div>
                <h3 className="text-lg font-black theme-text-contrast tracking-tight">
                  {editingActivityId ? '編輯行程' : '新增行程項目'}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    <MapPin size={10} /> 行程地點 / 名稱
                  </label>
                  <input 
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none focus:theme-border-primary theme-text-contrast" 
                    placeholder="例如：淺草寺、一蘭拉麵" 
                    value={newActivity.location} 
                    onChange={e => setNewActivity({...newActivity, location: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                      <Clock size={10} /> 開始時間
                    </label>
                    <input 
                      type="time" 
                      onClick={(e) => (e.target as any).showPicker?.()}
                      onFocus={(e) => e.target.showPicker?.()}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none theme-text-contrast cursor-pointer" 
                      value={newActivity.time} 
                      onChange={e => setNewActivity({...newActivity, time: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                      ¥ 預計消費
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-bold border border-[var(--border-color)] outline-none theme-text-contrast" 
                      placeholder="日圓額度" 
                      value={newActivity.cost} 
                      onChange={e => setNewActivity({...newActivity, cost: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    <Info size={10} /> 行程描述 / 備註
                  </label>
                  <textarea 
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/10 text-xs font-medium border border-[var(--border-color)] outline-none focus:theme-border-primary theme-text-contrast min-h-[80px] resize-none" 
                    placeholder="補充詳細內容，如預約編號、想吃的餐點等..." 
                    value={newActivity.note} 
                    onChange={e => setNewActivity({...newActivity, note: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">活動類型</label>
                   <div className="flex flex-wrap gap-2">
                      {Object.values(ActivityType).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewActivity({...newActivity, type})}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${newActivity.type === type ? 'theme-bg-primary text-white border-transparent' : 'bg-gray-50/10 text-gray-400 border-[var(--border-color)]'}`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs text-gray-400 font-bold uppercase tracking-widest">取消</button>
                <button onClick={handleSaveActivity} className="flex-[1.5] py-3 theme-bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                  儲存行程
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetail;
