import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AmbientBackground from './components/AmbientBackground';
import Home from './pages/Home';
import AllProjects from './pages/AllProjects';
import Photography from './pages/Photography';
import Videography from './pages/Videography';
import GraphicDesign from './pages/GraphicDesign';
import AdminDashboard from './pages/AdminDashboard';

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  return (
    <div className="relative bg-[#171216] min-h-screen flex flex-col font-body text-[#ebdfe4] antialiased overflow-x-hidden">
      {/* Global Interactive & Parallax Background */}
      <AmbientBackground />

      <ScrollToTop />
      <Navbar />

      <div className="relative z-10 w-full flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/karya" element={<AllProjects />} />
          <Route path="/semua-karya" element={<AllProjects />} />

          <Route path="/fotografi" element={<Photography />} />
          <Route path="/karya/fotografi" element={<Photography />} />

          <Route path="/desain-grafis" element={<GraphicDesign />} />
          <Route path="/karya/desain-grafis" element={<GraphicDesign />} />

          <Route path="/videografi" element={<Videography />} />
          <Route path="/karya/videografi" element={<Videography />} />

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default App;
