import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin-side/AdminLayout';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/admin-side/AdminDashboard';
import { Stations } from './components/Stations';
import { AdminStations } from './components/admin-side/AdminStations';
import { Bookings } from './components/Bookings';
import { Users } from './components/Users';
import { AdminUsers } from './components/admin-side/AdminUsers';
import { Support } from './components/Support';
import { Reviews } from './components/Reviews';
import { Subscription } from './components/Subscription';
import { WynxAI } from './components/WynxAI';
import { AssetTracker } from './components/AssetTracker';
import { Settings } from './components/Settings';
import { AdminSettings } from './components/admin-side/AdminSettings';
import { Vehicles } from './components/Vehicles'; // Import Vehicles component
import { Logs } from './components/Logs'; // Import Logs component
import { Auth } from './components/Auth';
import { ViewState } from './types';
import { Toaster } from 'sonner';

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p>This module is currently under development.</p>
    </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'superadmin'>('superadmin');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // Check for existing session (Optional, purely for UX persistence in this demo)
  useEffect(() => {
      const isAuth = localStorage.getItem('isAuth');
      const role = localStorage.getItem('userRole') as 'admin' | 'superadmin';
      if (isAuth === 'true') {
          setIsAuthenticated(true);
          if (role) setUserRole(role);
      }
  }, []);

  const handleLogin = (role: 'admin' | 'superadmin') => {
      setIsAuthenticated(true);
      setUserRole(role);
      localStorage.setItem('isAuth', 'true');
      localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuth');
      localStorage.removeItem('userRole');
  };

  const renderContent = () => {
    let content;
    switch (currentView) {
        case ViewState.DASHBOARD:
            content = userRole === 'admin' ? <AdminDashboard /> : <Dashboard />;
            break;
        case ViewState.STATIONS:
            content = userRole === 'admin' ? <AdminStations /> : <Stations />;
            break;
        case ViewState.BOOKINGS:
            content = <Bookings />;
            break;
        case ViewState.USERS:
            content = userRole === 'admin' ? <AdminUsers /> : <Users />;
            break;
        case ViewState.VEHICLES:
            content = <Vehicles />; // Use the new component
            break;
        case ViewState.SUBSCRIPTIONS:
            content = <Subscription />;
            break;
        case ViewState.WYNX_AI:
            content = <WynxAI />;
            break;
        case ViewState.ASSET_TRACKER:
            content = <AssetTracker />;
            break;
        case ViewState.SETTINGS:
            content = userRole === 'admin' ? <AdminSettings /> : <Settings />;
            break;
        case ViewState.SUPPORT:
            content = <Support />;
            break;
        case ViewState.REVIEWS:
            content = <Reviews />;
            break;
        case ViewState.LOGS:
            content = <Logs />;
            break;
        default:
            content = <PlaceholderView title={currentView} />;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                {content}
            </motion.div>
        </AnimatePresence>
    );
  };

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      {!isAuthenticated ? (
          <Auth onLogin={handleLogin} />
      ) : userRole === 'admin' ? (
          <AdminLayout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
              {renderContent()}
          </AdminLayout>
      ) : (
          <Layout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
              {renderContent()}
          </Layout>
      )}
    </>
  );
}

export default App;