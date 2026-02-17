import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Stations } from './components/Stations';
import { Bookings } from './components/Bookings';
import { Users } from './components/Users';
import { Support } from './components/Support';
import { Reviews } from './components/Reviews';
import { Subscription } from './components/Subscription';
import { WynxAI } from './components/WynxAI';
import { MapRoutes } from './components/MapRoutes';
import { Settings } from './components/Settings';
import { Vehicles } from './components/Vehicles'; // Import Vehicles component
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
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // Check for existing session (Optional, purely for UX persistence in this demo)
  useEffect(() => {
      const isAuth = localStorage.getItem('isAuth');
      if (isAuth === 'true') {
          setIsAuthenticated(true);
      }
  }, []);

  const handleLogin = () => {
      setIsAuthenticated(true);
      localStorage.setItem('isAuth', 'true');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuth');
  };

  const renderContent = () => {
    switch (currentView) {
        case ViewState.DASHBOARD:
            return <Dashboard />;
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
        case ViewState.MAP_ROUTES:
            return <MapRoutes />;
        case ViewState.SETTINGS:
            return <Settings />;
        case ViewState.SUPPORT:
            return <Support />;
        case ViewState.REVIEWS:
            return <Reviews />;
        case ViewState.LOGS:
            return <PlaceholderView title="System Audit Logs" />;
        default:
            return <PlaceholderView title={currentView} />;
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      {!isAuthenticated ? (
          <Auth onLogin={handleLogin} />
      ) : (
          <Layout currentView={currentView} setCurrentView={setCurrentView}>
              {renderContent()}
          </Layout>
      )}
    </>
  );
}

export default App;