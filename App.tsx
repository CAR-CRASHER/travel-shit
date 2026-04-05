
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail';
import BudgetPage from './pages/Budget';
import Toolbox from './pages/Toolbox';
import BookingManagement from './pages/BookingManagement';
import { TripProvider } from './store/TripContext';
import { Loader2 } from 'lucide-react';

const ShoppingPage = lazy(() => import('./pages/Shopping'));

const RedirectToHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { replace: true });
  }, []);
  return null;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin theme-primary" size={32} />
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">載入中...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trip/:tripId" element={<TripDetail />} />
          <Route path="/budget/:tripId" element={<BudgetPage />} />
          <Route path="/bookings/:tripId" element={<BookingManagement />} />
          <Route path="/shopping/:tripId" element={<ShoppingPage />} />
          <Route path="/toolbox/:tripId" element={<Toolbox />} />
          <Route path="*" element={<RedirectToHome />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <TripProvider>
      <Router>
        <AppContent />
      </Router>
    </TripProvider>
  );
};

export default App;
