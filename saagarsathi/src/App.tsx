import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import AskSaagarsathi from './pages/AskSaagarsathi';
import InfoHub from './pages/InfoHub';
import OfflineBanner from './components/OfflineBanner';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      {isOffline && <OfflineBanner />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/ask" element={<AskSaagarsathi />} />
          <Route path="/info" element={<InfoHub />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
