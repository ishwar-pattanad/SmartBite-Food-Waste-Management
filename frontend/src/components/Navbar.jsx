import React, { useState, useEffect } from 'react';
import { Menu, Database, Leaf, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsAPI } from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [dbEngine, setDbEngine] = useState('MySQL / SQLite');

  useEffect(() => {
    analyticsAPI.getDashboardStats()
      .then((data) => {
        if (data?.db_engine) setDbEngine(data.db_engine);
      })
      .catch(() => {});
  }, []);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Campus Canteen Dashboard';
      case '/inventory':
        return 'Daily Food Preparation Inventory';
      case '/waste-recording':
        return 'Food Waste & Leftover Recording';
      case '/analytics':
        return 'Waste Analytics & Metrics';
      case '/surplus':
        return 'Food Donation & Surplus Management';
      case '/suggestions':
        return 'Intelligent Waste Reduction Suggestions';
      case '/reports':
        return 'Canteen Audit & Reports';
      default:
        return 'SmartBite Canteen System';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#1E293B',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1
            style={{
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#0F172A',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {getPageTitle(location.pathname)}
          </h1>
          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{currentDate}</span>
            <span>•</span>
            <span style={{ color: '#15803D', fontWeight: '600' }}>Campus Kitchen Facility</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* DB Engine Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '9999px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            fontSize: '0.75rem',
            color: '#475569',
            fontWeight: '600',
          }}
          title="Active Database Connection"
        >
          <Database size={13} color="#15803D" />
          <span style={{ display: window.innerWidth <= 640 ? 'none' : 'inline' }}>DB:</span>
          <span style={{ color: '#0F172A' }}>{dbEngine}</span>
        </div>

        {/* EVS Eco Pill */}
        <div
          style={{
            display: window.innerWidth <= 768 ? 'none' : 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            backgroundColor: '#DCFCE7',
            border: '1px solid #BBF7D0',
            fontSize: '0.75rem',
            color: '#15803D',
            fontWeight: '700',
          }}
        >
          <Leaf size={14} />
          <span>EVS Zero-Waste Project</span>
        </div>

        {/* Quick Shortcut Button */}
        <Link
          to="/waste-recording"
          className="btn btn-primary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <PlusCircle size={15} />
          <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Log Waste</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
