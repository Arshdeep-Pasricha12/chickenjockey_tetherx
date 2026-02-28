import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '🫀', label: 'Dashboard' },
  { path: '/diagnose', icon: '🔍', label: 'Smart Diagnosis' },
  { path: '/emergency', icon: '🚨', label: 'Emergency SOS' },
  { path: '/predict', icon: '🔮', label: 'Predictive Care' },
  { path: '/safety', icon: '🏆', label: 'Safety Score' },
  { path: '/timeline', icon: '📜', label: 'Health Timeline' },
  { path: '/community', icon: '👥', label: 'Community' },
  { path: '/chat', icon: '🤖', label: 'AI Assistant' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('autopulse_theme') || 'dark';
  });
  const { user, signOut } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('autopulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="sidebar-collapse-btn"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '➡️' : '⬅️'}
      </button>

      <div className="sidebar-brand">
        <h1>{collapsed ? '🚗' : '🚗 AutoPulse'}</h1>
        {!collapsed && <p>Vehicle Intelligence</p>}
      </div>

      {/* User info */}
      {user && !collapsed && (
        <div style={{
          padding: '12px 16px', margin: '8px 12px',
          borderRadius: '10px', background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', color: 'white', fontWeight: 700, flexShrink: 0,
          }}>
            {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.user_metadata?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>
      )}
      {user && collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', color: 'white', fontWeight: 700,
          }}>
            {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className="theme-toggle"
          style={{ marginTop: '8px', color: '#ef4444' }}
          title="Sign out"
        >
          <span>🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && <p style={{ marginTop: '8px' }}>AutoPulse v1.0 — Built with ❤️</p>}
      </div>
    </aside>
  );
}
