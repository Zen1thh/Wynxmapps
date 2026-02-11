import React, { useState } from 'react';
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
import { ViewState } from './types';

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p>This module is currently under development.</p>
    </div>
);

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

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
        default:
            return <PlaceholderView title={currentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderContent()}
    </Layout>
  );
}

export default App;