
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
  Loader2,
  Map as MapIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useTrips } from '../store/TripContext';
import { Trip, BookingType, Booking } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

const BookingManagement: React.FC = () => {
  const { tripId } = useParams();
  const { getTripById, updateTrip, setLastTripId } = useTrips();
  const trip = getTripById(tripId || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<any>({});
  
  const [flightInfo, setFlightInfo] = useState({ outboundNo: '', outboundDate: '', returnNo: '', returnDate: '' });
  const [accInfo, setAccInfo] = useState({ title: '', checkIn: '', checkOut: '', address: '' });
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({ type: BookingType.FLIGHT });
  
  const [searchSources, setSearchSources] = useState<{title: string, uri: string}[]>([]);

  useEffect(() => {
    if (tripId) setLastTripId(tripId);
  }, [tripId, setLastTripId]);

  if (!trip) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">找不到該旅程資料</div>;

  const searchFlightWithGoogleSearch = async (flightNo: string, date: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // 嚴格遵循 Guidelines：使用 googleSearch 時，不應假設輸出為 JSON。
    // 我們改為要求模型在文本中包含關鍵標記，然後手動解析。
    const prompt = `你現在是航班數據查詢助手。請透過 Google 搜尋查詢航班編號「${flightNo}」在「${date}」的實時資訊（起飛時間、抵達機場、航空公司）。
    請在回覆中明確列出：
    航空公司：[名稱]
    起飛時間：[HH:mm]
    機場：[名稱]
    航站：[編號]
    請務必使用繁體中文。`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }]
        }
      });

      // 提取 Grounding 來源
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));
      
      setSearchSources(prev => [...prev, ...webSources]);

      const text = response.text || '';
      
      // 簡單的文本解析邏輯，避免直接使用 JSON.parse 造成 Uncaught SyntaxError
      const extract = (pattern: RegExp) => {
        const match = text.match(pattern);
        return match ? match[1].trim() : '';
      };

      return {
        airline: extract(/航空公司[:：]\s*(.*)/) || '未知航空公司',
        departureTime: extract(/起飛時間[:：]\s*(\d{2}[:：]\d{2})/) || '待定',
        airport: extract(/機場[:：]\s*(.*)/) || '待確認機場',
        terminal: extract(/航站[:：]\s*(.*)/) || '-',
      };
    } catch (err) {
      console.error('AI Search Error:', err);
      throw err;
    }
  };

  const handleSaveBooking = async () => {
    setErrors({});
    setSearchSources([]);
    
    if (newBooking.type === BookingType.FLIGHT) {
      if (!editingBookingId && !flightInfo.outboundNo && !flightInfo.returnNo) {
        setErrors({ flight: '請輸入至少一個航班編號' });
        return;
      }
    } else if (newBooking.type === BookingType.ACCOMMODATION) {
      if (!accInfo.title || !accInfo.checkIn || !accInfo.checkOut) {
        setErrors({ acc: '請完整填寫資訊' });
        return;
      }
    }

    setIsModalOpen(false);
    setIsBackgroundSyncing(true);
    setSyncStatus(null);

    try {
      let updatedBookings = [...(trip.bookings || [])];

      if (newBooking.type === BookingType.FLIGHT) {
        if (editingBookingId) {
          const info = await searchFlightWithGoogleSearch(flightInfo.outboundNo, flightInfo.outboundDate || trip.startDate);
          updatedBookings = updatedBookings.map(b => b.id === editingBookingId ? {
            ...b,
            airline: info.airline,
            date: flightInfo.outboundDate || trip.startDate,
            time: info.departureTime,
            location: info.airport,
            terminal: info.terminal,
            flightNumber: flightInfo.outboundNo.toUpperCase()
          } : b);
        } else {
          const flights = [];
          if (flightInfo.outboundNo) flights.push({ no: flightInfo.outboundNo, date: flightInfo.outboundDate || trip.startDate, label: '去程' });
          if (flightInfo.returnNo) flights.push({ no: flightInfo.returnNo, date: flightInfo.returnDate || trip.endDate, label: '回程' });

          for (const f of flights) {
            const info = await searchFlightWithGoogleSearch(f.no, f.date);
            updatedBookings.push({
              id: Math.random().toString(36).substr(2, 9),
              type: BookingType.FLIGHT,
              title: `${f.label}: ${f.no}`,
              airline: info.airline,
              date: f.date,
              time: info.departureTime,
              location: info.airport,
              terminal: info.terminal,
              flightNumber: f.no.toUpperCase()
            });
          }
        }
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
      setSyncStatus('success');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    } finally {
      setIsBackgroundSyncing(false);
      resetForms();
      if (searchSources.length === 0) {
        setTimeout(() => setSyncStatus(null), 3000);
      }
    }
  };

  const resetForms = () => {
    const startDate = trip?.startDate || '';
    const endDate = trip?.endDate || '';
    setFlightInfo({ 
      outboundNo: '', 
      outboundDate: startDate, 
      returnNo: '', 
      returnDate: endDate 
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
      outboundNo: booking.flightNumber || '', 
      outboundDate: booking.date || trip.startDate, 
      returnNo: '', 
      returnDate: trip.endDate 
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
      <AnimatePresence>
        {(isBackgroundSyncing || syncStatus || searchSources.length > 0) && (
          /* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */
          <motion.div 
            {...({
              initial: { y: -50, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              exit: { y: -50, opacity: 0 }
            } as any)}
            className="fixed top-4 left-4 right-4 z-[100] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md"
          >
            <div className={`p-3 md:p-4 rounded-2xl shadow-2xl border transition-colors ${
              syncStatus === 'success' ? 'bg-[#00A86B] border-white/20 text-white' :
              syncStatus === 'error' ? 'bg-[#BC002D] border-white/20 text-white' :
              'bg-[#2D3436] border-white/5 text-white backdrop-blur-md'
            }`}>
              <div className="flex items-center gap-3">
                {isBackgroundSyncing ? <Loader2 size={14} className="animate-spin" /> : 
                 syncStatus === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    {isBackgroundSyncing ? '正在搜尋航班數據...' : syncStatus === 'success' ? '數據同步完成' : '同步失敗'}
                  </p>
                </div>
                {searchSources.length > 0 && !isBackgroundSyncing && (
                  <button onClick={() => { setSearchSources([]); setSyncStatus(null); }} className="text-[8px] font-black opacity-60 uppercase tracking-tighter">關閉</button>
                )}
              </div>
              
              {searchSources.length > 0 && !isBackgroundSyncing && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">實時資訊來源：</p>
                  <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-hide">
                    {searchSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                      >
                        <span className="text-[10px] font-bold truncate pr-4">{source.title || '航班數據源'}</span>
                        <ExternalLink size={10} className="shrink-0 opacity-40 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black theme-text-contrast tracking-tight uppercase">預約管理</h1>
          <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">實時搜尋來源並翻譯資訊</p>
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
                    <div className="p-4 bg-blue-50/10 rounded-xl border border-blue-200/20 space-y-3">
                      <div className="text-[8px] font-black theme-primary uppercase tracking-widest">航班編號與日期</div>
                      <div className="grid grid-cols-2 gap-3">
                        <input className="px-3 py-2 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] uppercase outline-none" placeholder="航班編號" value={flightInfo.outboundNo} onChange={e => setFlightInfo({...flightInfo, outboundNo: e.target.value})} />
                        <input 
                          type="date" 
                          onClick={(e) => (e.target as any).showPicker?.()}
                          onFocus={(e) => e.target.showPicker?.()}
                          className="px-3 py-2 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none cursor-pointer" 
                          value={flightInfo.outboundDate} 
                          onChange={e => setFlightInfo({...flightInfo, outboundDate: e.target.value})} 
                        />
                      </div>
                    </div>
                    {!editingBookingId && (
                      <div className="p-4 bg-pink-50/10 rounded-xl border border-pink-200/20 space-y-3">
                        <div className="text-[8px] font-black text-pink-500 dark:text-pink-400 uppercase tracking-widest">回程航班資訊 (選填)</div>
                        <div className="grid grid-cols-2 gap-3">
                          <input className="px-3 py-2 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] uppercase outline-none" placeholder="回程編號" value={flightInfo.returnNo} onChange={e => setFlightInfo({...flightInfo, returnNo: e.target.value})} />
                          <input 
                            type="date" 
                            onClick={(e) => (e.target as any).showPicker?.()}
                            onFocus={(e) => e.target.showPicker?.()}
                            className="px-3 py-2 rounded-lg bg-[var(--bg-main)] font-bold text-xs theme-text-contrast border border-[var(--border-color)] outline-none cursor-pointer" 
                            value={flightInfo.returnDate} 
                            onChange={e => setFlightInfo({...flightInfo, returnDate: e.target.value})} 
                          />
                        </div>
                      </div>
                    )}
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
                <button onClick={handleSaveBooking} className="flex-[1.5] py-3 theme-bg-primary text-white rounded-xl text-xs font-black shadow-lg uppercase tracking-widest active:scale-95 transition-transform">儲存並同步</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingManagement;
