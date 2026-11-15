import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Trash2,
  BarChart3,
  HeartHandshake,
  Lightbulb,
  FileSpreadsheet,
  LogOut,
  Sprout,
  ShieldCheck,
  User as UserIcon,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, role, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Food Inventory', path: '/inventory', icon: UtensilsCrossed },
    { name: 'Waste Recording', path: '/waste-recording', icon: Trash2 },
    { name: 'Waste Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Surplus Food', path: '/surplus', icon: HeartHandshake },
    { name: 'Smart Suggestions', path: '/suggestions', icon: Lightbulb },
    { name: 'Reports & Export', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 90,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderRight: '1px solid #1E293B',
          transition: 'transform 0.3s ease',
          ...(window.innerWidth <= 1024
            ? {
                position: 'fixed',
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
              }
            : {}),
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.4)',
              }}
            >
              <Sprout size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Smart<span style={{ color: '#4ADE80' }}>Bite</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.04em' }}>
                COLLEGE FOOD RESCUE
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: window.innerWidth <= 1024 ? 'block' : 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* EVS Project Badge */}
        <div style={{ padding: '12px 18px', margin: '14px 16px 6px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ADE80', fontSize: '0.72rem', fontWeight: '700' }}>
            <ShieldCheck size={14} /> EVS Assignment II
          </div>
          <div style={{ fontSize: '0.7rem', color: '#CBD5E1', marginTop: '2px' }}>
            Zero Food Waste Initiative
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 6px' }}>
            Main Menu
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth <= 1024 && onClose()}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? '#15803D' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout Section */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #1E293B',
            backgroundColor: '#090D16',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: isAdmin ? '#166534' : '#1E293B',
                color: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: '1px solid #334155',
              }}
            >
              {user?.name ? user.name.charAt(0) : <UserIcon size={16} />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Staff Member'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: isAdmin ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: isAdmin ? '#93C5FD' : '#86EFAC',
                    fontWeight: '600',
                  }}
                >
                  {role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
