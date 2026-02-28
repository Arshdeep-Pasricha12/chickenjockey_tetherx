import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import WelcomePage from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import Diagnose from './pages/Diagnose';
import Emergency from './pages/Emergency';
import Predict from './pages/Predict';
import SafetyScore from './pages/SafetyScore';
import Timeline from './pages/Timeline';
import Community from './pages/Community';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  // Not logged in — show auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Logged in — app routes
  return (
    <Routes>
      {/* Welcome page — full screen, no sidebar */}
      <Route path="/" element={<WelcomePage />} />

      {/* Dashboard pages — with sidebar */}
      <Route path="/*" element={
        <div className={`app-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diagnose" element={<Diagnose />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/safety" element={<SafetyScore />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/community" element={<Community />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <AIChat />
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehicleProvider>
          <AppRoutes />
        </VehicleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
