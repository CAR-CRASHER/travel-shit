
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trip, AppState, Activity, Booking } from '../types';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface TripContextType {
  trips: Trip[];
  lastTripId: string | null;
  theme: 'light' | 'dark';
  themeColor: string;
  fontSize: FontSize;
  toast: { message: string, type: 'success' | 'error' | 'info', isVisible: boolean };
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  clearAllData: () => void;
  getTripById: (id: string) => Trip | undefined;
  setLastTripId: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemeColor: (color: string) => void;
  setFontSize: (size: FontSize) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const STORAGE_KEY = 'japan_trip_planner_data_v2';
const LAST_TRIP_KEY = 'japan_trip_last_id';
const THEME_KEY = 'japan_trip_theme';
const COLOR_KEY = 'japan_trip_color';
const FONT_SIZE_KEY = 'japan_trip_font_size';

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [lastTripId, setLastTripIdState] = useState<string | null>(() => localStorage.getItem(LAST_TRIP_KEY));
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light');
  const [themeColor, setThemeColorState] = useState<string>(() => localStorage.getItem(COLOR_KEY) || '#BC002D');
  const [fontSize, setFontSizeState] = useState<FontSize>(() => (localStorage.getItem(FONT_SIZE_KEY) as FontSize) || 'medium');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info', isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setThemeColor = (c: string) => {
    setThemeColorState(c);
    localStorage.setItem(COLOR_KEY, c);
  };

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem(FONT_SIZE_KEY, s);
  };

  const setLastTripId = useCallback((id: string) => {
    setLastTripIdState(id);
    localStorage.setItem(LAST_TRIP_KEY, id);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const addTrip = useCallback((trip: Trip) => {
    setTrips(prev => [...prev, trip]);
    setLastTripId(trip.id);
  }, [setLastTripId]);

  const updateTrip = useCallback((updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    setLastTripId(updatedTrip.id);
  }, [setLastTripId]);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (lastTripId === id) {
      setLastTripIdState(null);
      localStorage.removeItem(LAST_TRIP_KEY);
    }
  }, [lastTripId]);

  const clearAllData = useCallback(() => {
    setTrips([]);
    setLastTripIdState(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_TRIP_KEY);
  }, []);

  const getTripById = useCallback((id: string) => {
    return trips.find(t => t.id === id);
  }, [trips]);

  return (
    <TripContext.Provider value={{ 
      trips, lastTripId, theme, themeColor, fontSize, toast,
      addTrip, updateTrip, deleteTrip, getTripById, setLastTripId, 
      setTheme, setThemeColor, setFontSize, clearAllData, showToast, hideToast
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be used within a TripProvider');
  return context;
};
