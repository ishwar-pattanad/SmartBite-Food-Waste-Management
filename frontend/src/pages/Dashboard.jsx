import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  CheckCircle,
  Trash2,
  TrendingDown,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Clock,
  PieChart as PieIcon,
  BarChart2,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { analyticsAPI } from '../services/api';

const COLORS = ['#15803D', '#3B82F6', '#F97316', '#A855F7', '#EC4899', '#06B6D4'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [mealData, setMealData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, trendsRes, catRes, mealRes, actRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getDailyTrends(7),
        analyticsAPI.getByCategory(),
        analyticsAPI.getByMealType(),
        analyticsAPI.getRecentActivities(5)
      ]);

      setStats(statsRes);
      setDailyTrends(trendsRes || []);
      setCategoryData(catRes || []);
      setMealData(mealRes || []);
      setRecentActivities(actRes || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#15803D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '600' }}>Loading live canteen waste metrics...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Motivational Environmental Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
          borderRadius: '16px',
          padding: '22px 28px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(21, 128, 61, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={26} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em', margin: 0 }}>
                Save Food, Save the Planet!
              </h2>
              <span
                style={{
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                EVS Mission
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#DCFCE7', margin: '4px 0 0', maxWidth: '680px' }}>
              Campus dining operations have prevented approx.{' '}
              <strong>{stats?.food_saved_kg || 18.5} kg</strong> of avoidable plate & batch waste this week, cutting campus greenhouse emissions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/inventory" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            <Plus size={15} /> Add Preparation
          </Link>
          <Link to="/waste-recording" className="btn btn-light-green btn-sm" style={{ textDecoration: 'none' }}>
            <Trash2 size={15} /> Log Waste
          </Link>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          title="Total Prepared Today"
          value={stats?.total_prepared_today ?? 0}
          unit="kg"
          icon={Utensils}
          theme="blue"
          trend="Today's Total"
          trendType="positive"
          subtitle="All kitchen batches"
        />

        <StatCard
          title="Total Food Served"
          value={stats?.total_served_today ?? 0}
          unit="kg"
          icon={CheckCircle}
          theme="green"
          trend={`${stats?.total_prepared_today ? Math.round((stats.total_served_today / stats.total_prepared_today) * 100) : 0}% Served`}
          trendType="positive"
          subtitle="Consumed by students/staff"
        />

        <StatCard
          title="Total Food Wasted"
          value={stats?.total_wasted_today ?? 0}
          unit="kg"
          icon={Trash2}
          theme="red"
          trend={`${stats?.waste_percentage_today ?? 0}% Waste`}
          trendType="negative"
          subtitle="Leftover & unserved food"
        />

        <StatCard
          title="Waste Reduction Rate"
          value={stats?.waste_reduction_rate ?? 0}
          unit="%"
          icon={TrendingDown}
          theme="green"
          trend="vs Baseline Average"
          trendType="positive"
          subtitle="Lower waste is optimal"
        />
      </div>

      {/* Middle Grid: Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* 1. Daily Food Preparation vs Waste Bar Chart */}
        <ChartCard
          title="Daily Food Waste & Preparation Trend"
          subtitle="Comparison of quantity prepared, served and wasted over recent service days (kg)"
          icon={BarChart2}
          height={320}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dailyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(value) => [`${value} kg`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="prepared" name="Prepared (kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="served" name="Served (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wasted" name="Wasted (kg)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Weekly Waste Percentage Line Chart */}
        <ChartCard
          title="Daily Food Waste Percentage Trend"
          subtitle="Tracking leftover waste percentage vs campus target threshold (<12%)"
          icon={TrendingDown}
          height={320}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={dailyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis unit="%" tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(value) => [`${value}%`, 'Waste Rate']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="waste_percentage"
                name="Waste %"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ fill: '#F97316', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second Row of Charts: Category Pie + Meal Type Comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* 3. Waste by Category Pie Chart */}
        <ChartCard
          title="Food Waste by Category"
          subtitle="Proportion of total wasted weight grouped by food department (kg)"
          icon={PieIcon}
          height={300}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(value) => [`${value} kg`, 'Waste']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Meal Type Comparison (Breakfast, Lunch, Snacks, Dinner) */}
        <ChartCard
          title="Food Preparation vs Consumption by Meal"
          subtitle="Distribution of prepared vs served quantities across service shifts"
          icon={Utensils}
          height={300}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mealData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="meal_type" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(value) => [`${value} kg`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="prepared" name="Prepared (kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="served" name="Consumed (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Grid: Recent Activities & Waste Reduction Progress */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 960 ? '1.2fr 0.8fr' : '1fr',
          gap: '20px',
        }}
      >
        {/* Recent Activities Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Clock size={18} color="#15803D" /> Recent Kitchen Activities
              </h3>
              <p className="card-subtitle">Real-time log of food waste entries and inventory changes</p>
            </div>
            <Link to="/waste-recording" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              View All Logs
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0F172A' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      {act.subtitle}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge badge-${act.badge_color || 'info'}`}>{act.badge}</span>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                No recent activities logged today.
              </div>
            )}
          </div>
        </div>

        {/* Waste Reduction Progress Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ShieldCheck size={18} color="#15803D" /> Waste Reduction Goal
              </h3>
              <p className="card-subtitle">EVS Campus Sustainability Target (Threshold: &lt;10%)</p>
            </div>
          </div>

          <div style={{ padding: '8px 0' }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: '#0F172A' }}>Current Waste Rate</span>
                <span style={{ color: stats?.waste_percentage_today > 12 ? '#EF4444' : '#15803D' }}>
                  {stats?.waste_percentage_today || 0}%
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(5, (stats?.waste_percentage_today || 10) * 4))}%`,
                    height: '100%',
                    backgroundColor: stats?.waste_percentage_today > 12 ? '#EF4444' : '#15803D',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>
                <span>Target: &lt;10%</span>
                <span>Critical Threshold: 20%</span>
              </div>
            </div>

            {/* Surplus Food Quick Callout */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: '700', fontSize: '0.85rem' }}>
                <HeartHandshake size={18} />
                <span>Active Surplus for Donation</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#166534', margin: '6px 0 10px' }}>
                Currently <strong>{stats?.surplus_available_kg || 0} kg</strong> of safe, hygienic leftover food is ready for community redistribution.
              </p>
              <Link to="/surplus" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Manage Surplus <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
              💡 <em>"Implementing standardized serving scoops and split batch preparation reduced rice and curry leftovers by 23% in trial weeks."</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
