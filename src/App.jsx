import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TravelPlan from './pages/TravelPlan';
import Passport from './pages/Passport';
import IVR from './pages/IVR';
import Contact from './pages/Contact';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<TravelPlan />} />
            <Route path="/passport" element={<Passport />} />
            <Route path="/ivr" element={<IVR />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<TravelPlan />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
