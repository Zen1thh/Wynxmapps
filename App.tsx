import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin-side/AdminLayout';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/admin-side/AdminDashboard';
import { Stations } from './components/Stations';
import { Bookings } from './components/Bookings';
import { Users } from './components/Users';
import { Support } from './components/Support';
import { Reviews } from './components/Reviews';
import { Subscription } from './components/Subscription';
import { WynxAI } from './components/WynxAI';
import { FleetTracker } from './components/FleetTracker';
import { Settings } from './components/Settings';
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
    switch (currentView) {
        case ViewState.DASHBOARD:
            return userRole === 'admin' ? <AdminDashboard /> : <Dashboard />;
        case ViewState.STATIONS:
            return <Stations />;
        case ViewState.BOOKINGS:
            return <Bookings />;
        case ViewState.USERS:
            return <Users />;
        case ViewState.VEHICLES:
            return <Vehicles />; // Use the new component
        case ViewState.SUBSCRIPTIONS:
            return <Subscription />;
        case ViewState.WYNX_AI:
            return <WynxAI />;
        case ViewState.FLEET_TRACKER:
            return <FleetTracker />;
        case ViewState.SETTINGS:
            return <Settings />;
        case ViewState.SUPPORT:
            return <Support />;
        case ViewState.REVIEWS:
            return <Reviews />;
        case ViewState.LOGS:
            return <Logs />;
        default:
            return <PlaceholderView title={currentView} />;
    }
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