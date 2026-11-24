import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import WasteRecording from './pages/WasteRecording';
import Analytics from './pages/Analytics';
import Surplus from './pages/Surplus';
import Suggestions from './pages/Suggestions';
import Reports from './pages/Reports';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main style={{ flex: 1, paddingBottom: '40px' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/waste-recording" element={<WasteRecording />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/surplus" element={<Surplus />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
