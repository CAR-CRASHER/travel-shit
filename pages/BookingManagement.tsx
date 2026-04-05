
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plane, 
  Hotel, 
  Ticket, 
  Plus, 
  Clock, 
  MapPin, 
  Trash2, 
  Calendar,
  Map as MapIcon,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useTrips } from '../store/TripContext';
import { Trip, BookingType, Booking } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const BookingManagement: React.FC = () => {
  const { tripId } = useParams();
  const { getTripById, updateTrip, setLastTripId } = useTrips();
  const trip = getTripById(tripId || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  
  const [flightInfo, setFlightInfo] = useState({ 
    flightNo: '', 
    date: '', 
    airline: '', 
    time: '', 
    location: '', 
    terminal: '' 
  });
  const [accInfo, setAccInfo] = useState({ title: '', checkIn: '', checkOut: '', address: '' });
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({ type: BookingType.FLIGHT });

  useEffect(() => {
    if (tripId) setLastTripId(tripId);
  }, [tripId, setLastTripId]);

  if (!trip) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">找不到該旅程資料</div>;

  const handleSaveBooking = () => {
    setErrors({});
    
    if (newBooking.type === BookingType.FLIGHT) {
      if (!flightInfo.flightNo || !flightInfo.date || !flightInfo.airline || !flightInfo.time || !flightInfo.location) {
        setErrors({ flight: '請完整填寫航班資訊' });
        return;
      }
    } else if (newBooking.type === BookingType.ACCOMMODATION) {
      if (!accInfo.title || !accInfo.checkIn || !accInfo.checkOut) {
        setErrors({ acc: '請完整填寫資訊' });
        return;
      }
    }

    try {
      let updatedBookings = [...(trip.bookings || [])];

      if (newBooking.type === BookingType.FLIGHT) {
        const data: Booking = {
          id: editingBookingId || Math.random().toString(36).substr(2, 9),
          type: BookingType.FLIGHT,
          title: `航班: ${flightInfo.flightNo.toUpperCase()}`,
          airline: flightInfo.airline,
          date: flightInfo.date,
          time: flightInfo.time,
          location: flightInfo.location,
          terminal: flightInfo.terminal || '-',
          flightNumber: flightInfo.flightNo.toUpperCase()
        };
        updatedBookings = editingBookingId ? updatedBookings.map(b => b.id === editingBookingId ? data : b) : [...updatedBookings, data];
      } else {
        const data: Booking = {
          id: editingBookingId || Math.random().toString(36).substr(2, 9),
          type: BookingType.ACCOMMODATION,
          title: accInfo.title,
          checkInDate: accInfo.checkIn,
          checkOutDate: accInfo.checkOut,
          location: accInfo.address || '未提供地址',
          date: accInfo.checkIn
        };
        updatedBookings = editingBookingId ? updatedBookings.map(b => b.id === editingBookingId ? data : b) : [...updatedBookings, data];
      }

      updateTrip({ ...trip, bookings: updatedBookings });
      setIsModalOpen(false);
      resetForms();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForms = () => {
    const startDate = trip?.startDate || '';
    setFlightInfo({ 
      flightNo: '', 
      date: startDate, 
      airline: '', 
      time: '12:00', 
      location: '', 
      terminal: '' 
    });
    setAccInfo({ 
      title: '', 
      checkIn: startDate, 
      checkOut: startDate, 
      address: '' 
    });
    setEditingBookingId(null);
  };

  const openFlightEdit = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setNewBooking({ type: BookingType.FLIGHT });
    setFlightInfo({ 
      flightNo: booking.flightNumber || '', 
      date: booking.date || trip.startDate, 
      airline: booking.airline || '',
      time: booking.time || '12:00',
      location: booking.location || '',
      terminal: booking.terminal || ''
    });
    setIsModalOpen(true);
  };

  const openAccEdit = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setNewBooking({ type: BookingType.ACCOMMODATION });
    setAccInfo({ 
      title: booking.title || '', 
      checkIn: booking.checkInDate || trip.startDate, 
      checkOut: booking.checkOutDate || trip.startDate, 
      address: booking.location || '' 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black theme-text-contrast tracking-tight uppercase">預約管理</h1>
          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">手動管理您的航班與住宿資訊</p>
        </div>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500 shrink-0"><Plane size={16} /></div>
              <h3 className="text-sm font-black theme-text-contrast uppercase tracking-tight">機票預約</h3>
            </div>
            <button onClick={() => { resetForms(); setNewBooking({type: BookingType.FLIGHT}); setIsModalOpen(true); }} className="px-3 py-1.5 bg-white dark:bg-white/5 theme-primary border border-blue-100 dark:border-blue-100/10 rounded-lg font-bold text-[10px] uppercase shadow-sm">
              新增機票
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(trip.bookings || []).filter(b => b.type === BookingType.FLIGHT).map(booking => (
              /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
              <motion.div 
                {...({ layout: true } as any)} key={booking.id} onClick={() => openFlightEdit(booking)}
                className="bg-gradient-to-br from-[#2D3436] to-[#1A1A1A] p-5 rounded-xl shadow-md text-white group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5"><Plane size={60} className="-rotate-45" /></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase tracking-wider text-blue-400">{booking.airline}</span>
                    <h4 className="text-lg font-black">{booking.flightNumber}</h4>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); updateTrip({...trip, bookings: trip.bookings.filter(b => b.id !== booking.id)}); }} className="p-1 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
                <div className="mt-4 flex items-end justify-between relative z-10">
                  <div>
                    <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">DEPARTURE TIME</div>
                    <div className="text-3xl font-black text-white leading-none">{booking.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold">{booking.date}</div>
                    <div className="text-[8px] text-white/60">{booking.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500 shrink-0"><Hotel size={16} /></div>
              <h3 className="text-sm font-black theme-text-contrast uppercase tracking-tight">住宿資訊</h3>
            </div>
            <button onClick={() => { resetForms(); setNewBooking({type: BookingType.ACCOMMODATION}); setIsModalOpen(true); }} className="px-3 py-1.5 bg-white dark:bg-white/5 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-100/10 rounded-lg font-bold text-[10px] uppercase shadow-sm">
              新增住宿
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(trip.bookings || []).filter(b => b.type === BookingType.ACCOMMODATION).map(booking => (
              /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
              <motion.div 
                {...({ layout: true } as any)} key={booking.id} onClick={() => openAccEdit(booking)}
                className="bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] group cursor-pointer hover:border-gray-300 dark:hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black theme-text-contrast mb-0.5 truncate">{booking.title}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold theme-primary">
                      <Calendar size={12} />
                      <span>{booking.checkInDate} — {booking.checkOutDate}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); updateTrip({...trip, bookings: trip.bookings.filter(b => b.id !== booking.id)}); }} className="p-1 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
                <div className="flex items-start gap-1.5 mb-3 text-[var(--text-muted)] text-[10px] font-medium">
                  <MapPin size={12} className="shrink-0" />
                  <p className="line-clamp-1">{booking.location}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`, '_blank'); }}
                  className="w-full py-2 bg-gray-50/5 hover:theme-bg-primary hover:text-white rounded-lg text-gray-500 dark:text-gray-400 font-bold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-[var(--border-color)]"
                >
                  <MapIcon size={12} /> 查看 Google Maps
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
              <h3 className="text-lg font-black theme-text-contrast mb-6 tracking-tight">編輯預約詳情</h3>
              <div className="space-y-4">
                {newBooking.type === BookingType.FLIGHT ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">航班編號</label>
                        <input className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] uppercase outline-none" placeholder="例如: CX504" value={flightInfo.flightNo} onChange={e => setFlightInfo({...flightInfo, flightNo: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">航空公司</label>
                        <input className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none" placeholder="例如: 國泰航空" value={flightInfo.airline} onChange={e => setFlightInfo({...flightInfo, airline: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">起飛日期</label>
                        <input 
                          type="date" 
                          onClick={(e) => (e.target as any).showPicker?.()}
                          onFocus={(e) => e.target.showPicker?.()}
                          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none cursor-pointer" 
                          value={flightInfo.date} 
                          onChange={e => setFlightInfo({...flightInfo, date: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">起飛時間</label>
                        <input 
                          type="time" 
                          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none" 
                          value={flightInfo.time} 
                          onChange={e => setFlightInfo({...flightInfo, time: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">起飛機場</label>
                        <input className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none" placeholder="例如: 香港國際機場" value={flightInfo.location} onChange={e => setFlightInfo({...flightInfo, location: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">航站樓 (選填)</label>
                        <input className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none" placeholder="例如: T1" value={flightInfo.terminal} onChange={e => setFlightInfo({...flightInfo, terminal: e.target.value})} />
                      </div>
                    </div>
                    {errors.flight && <p className="text-[10px] text-red-500 font-bold text-center">{errors.flight}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">住宿名稱</label>
                      <input className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none" placeholder="例如：東京希爾頓酒店" value={accInfo.title} onChange={e => setAccInfo({...accInfo, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">入住日</label>
                        <input 
                          type="date" 
                          onClick={(e) => (e.target as any).showPicker?.()}
                          onFocus={(e) => e.target.showPicker?.()}
                          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none cursor-pointer" 
                          value={accInfo.checkIn} 
                          onChange={e => setAccInfo({...accInfo, checkIn: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">退房日</label>
                        <input 
                          type="date" 
                          onClick={(e) => (e.target as any).showPicker?.()}
                          onFocus={(e) => e.target.showPicker?.()}
                          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none cursor-pointer" 
                          value={accInfo.checkOut} 
                          onChange={e => setAccInfo({...accInfo, checkOut: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">詳細地址</label>
                      <input className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none" placeholder="飯店完整地址" value={accInfo.address} onChange={e => setAccInfo({...accInfo, address: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs text-gray-400 font-bold uppercase tracking-widest">取消</button>
                <button onClick={handleSaveBooking} className="flex-[1.5] py-3 theme-bg-primary text-white rounded-xl text-xs font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform">儲存資訊</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingManagement;
