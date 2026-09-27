import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import AskSaagarsathi from './pages/AskSaagarsathi';
import InfoHub from './pages/InfoHub';
import OfflineBanner from './components/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <AppProvider>
      <Router>
        {isOffline && <OfflineBanner />}
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/ask" element={<AskSaagarsathi />} />
              <Route path="/info" element={<InfoHub />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
