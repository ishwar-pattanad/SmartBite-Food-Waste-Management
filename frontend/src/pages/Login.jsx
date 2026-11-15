import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(21, 128, 61, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 40%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 880 ? '1.1fr 1fr' : '1fr',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Left Side: EVS & Mission Banner */}
        <div
          style={{
            backgroundColor: '#15803D',
            color: '#FFFFFF',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            background: 'linear-gradient(135deg, #15803D 0%, #065F46 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Sprout size={28} color="#FFFFFF" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                  Smart<span style={{ color: '#86EFAC' }}>Bite</span>
                </h1>
                <p style={{ fontSize: '0.75rem', color: '#DCFCE7', margin: 0, fontWeight: '600', letterSpacing: '0.04em' }}>
                  COLLEGE FOOD RESCUE & AUDIT SYSTEM
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fontSize: '0.8rem',
                fontWeight: '700',
                marginBottom: '24px',
              }}
            >
              <ShieldCheck size={16} /> EVS Assignment II Problem Statement
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', lineHeight: 1.3, marginBottom: '14px' }}>
              Reducing Food Waste in Institutional College Canteens.
            </h2>

            <p style={{ fontSize: '0.925rem', color: '#DCFCE7', lineHeight: 1.6, marginBottom: '24px' }}>
              SmartBite empowers campus kitchens to track daily food preparation, monitor serving ratios, systematically document leftover waste causes, and redirect fresh surplus to local community shelters.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#F0FDF4' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80' }}></span>
                <span>Track daily preparation & meal consumption in kilograms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#F0FDF4' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80' }}></span>
                <span>Automated leftover calculations & waste percentage analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#F0FDF4' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ADE80' }}></span>
                <span>Surplus redistribution & intelligent rule-based reduction tips</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              marginTop: '32px',
            }}
          >
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: 0, color: '#DCFCE7' }}>
              "Save Food, Save the Planet! A sustainable campus starts on our dining plates."
            </p>
          </div>
        </div>

        {/* Right Side: Login Form & Demo Credentials */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Sign In to SmartBite
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Enter your credentials to access the kitchen waste management dashboard.
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">College Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@smartbite.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Section */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#0F172A', fontWeight: '700', fontSize: '0.825rem' }}>
              <Sparkles size={16} color="#15803D" />
              <span>Click to Auto-Fill Demo Credentials:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('staff@smartbite.edu', 'staff123')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#15803D';
                  e.currentTarget.style.backgroundColor = '#F0FDF4';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#15803D' }}>
                  <Utensils size={14} /> Canteen Staff
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                  staff@smartbite.edu
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@smartbite.edu', 'admin123')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#2563EB' }}>
                  <UserCheck size={14} /> Admin / Faculty
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                  admin@smartbite.edu
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
