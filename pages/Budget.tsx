
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTrips } from '../store/TripContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Utensils, Camera, TrainFront, Hotel, ShoppingBag, Box, AlertCircle } from 'lucide-react';
import { ActivityType } from '../types';
import { motion } from 'framer-motion';

const BudgetPage: React.FC = () => {
  const { tripId } = useParams();
  const { getTripById, updateTrip } = useTrips();
  const trip = getTripById(tripId || '');

  if (!trip) return <div className="p-10 text-center text-gray-400 font-bold">找不到該旅程資料</div>;

  const categorySpending = (trip.dailyItinerary || []).reduce((acc, day) => {
    day.activities.forEach(act => {
      acc[act.type] = (acc[act.type] || 0) + act.cost;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalSpent: number = (Object.values(categorySpending) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalBudget: number = trip.budget?.total || 0;
  const remaining: number = totalBudget - totalSpent;
  const isOverBudget: boolean = remaining < 0;

  const handleBudgetChange = (val: string) => {
    const newTotal = parseInt(val) || 0;
    updateTrip({
      ...trip,
      budget: { ...trip.budget, total: newTotal }
    });
  };

  const categoryIcons: Record<string, any> = {
    [ActivityType.FOOD]: { icon: <Utensils size={14} />, color: 'bg-orange-500' },
    [ActivityType.SIGHTSEEING]: { icon: <Camera size={14} />, color: 'bg-blue-500' },
    [ActivityType.TRANSPORT]: { icon: <TrainFront size={14} />, color: 'bg-green-500' },
    [ActivityType.HOTEL]: { icon: <Hotel size={14} />, color: 'bg-purple-500' },
    [ActivityType.SHOPPING]: { icon: <ShoppingBag size={14} />, color: 'bg-pink-500' },
    'Other': { icon: <Box size={14} />, color: 'bg-slate-400' }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">預算追蹤</h1>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">控制每一分支出</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <label className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block ml-1">設定總預算 (JPY)</label>
          <div className="flex items-center gap-2 group">
            <span className="text-lg font-black theme-primary group-focus-within:scale-110 transition-transform">¥</span>
            <input 
              type="number"
              value={totalBudget || ''}
              onChange={(e) => handleBudgetChange(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-xl font-black outline-none theme-text-contrast"
            />
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors duration-300 ${isOverBudget ? 'bg-red-500 text-white border-red-400 shadow-red-200/20' : 'bg-[var(--bg-card)] border-[var(--border-color)]'}`}>
          <span className={`text-[8px] font-black uppercase tracking-wider mb-1.5 block ${isOverBudget ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
            {isOverBudget ? '預算超額' : '剩餘額度'}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black">¥ {Math.abs(remaining).toLocaleString()}</span>
            {isOverBudget && <AlertCircle size={20} className="animate-pulse" />}
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black tracking-tight">支出明細與佔比</h3>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">總支出 ¥ {totalSpent.toLocaleString()}</span>
        </div>
        <div className="space-y-6">
          {Object.keys(ActivityType).map((key) => {
            const type = ActivityType[key as keyof typeof ActivityType];
            const amount: number = categorySpending[type] || 0;
            // 百分比相對於預算或總支出（此處以預算為準，若無預算則以總支出為準）
            const percentage: number = totalBudget > 0 ? (amount / totalBudget) * 100 : (totalSpent > 0 ? (amount / totalSpent) * 100 : 0);
            
            return (
              <div key={type} className="flex items-center gap-4">
                <div className={`${categoryIcons[type].color} text-white p-2 rounded-xl shrink-0 shadow-sm`}>{categoryIcons[type].icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold theme-text-contrast truncate pr-2 uppercase tracking-wide">{type}</span>
                    <div className="text-right">
                      <span className="text-xs font-black theme-text-contrast">¥ {amount.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-[var(--text-muted)] ml-2">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100/10 rounded-full overflow-hidden">
                    {/* Use type assertion for motion props to bypass TypeScript intrinsic attributes error */}
                    <motion.div 
                      {...({
                        initial: { width: 0 },
                        animate: { width: `${Math.min(percentage, 100)}%` },
                        transition: { duration: 0.5, ease: "easeOut" }
                      } as any)}
                      className={`h-full ${categoryIcons[type].color} ${percentage > 100 ? 'opacity-80' : ''}`} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
