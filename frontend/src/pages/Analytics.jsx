import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  Filter,
  TrendingDown,
  AlertTriangle,
  Award,
  Layers,
  Utensils
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
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { analyticsAPI } from '../services/api';

const COLORS = ['#15803D', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#06B6D4'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState(7);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, mRes, topRes, rRes, sRes] = await Promise.all([
        analyticsAPI.getDailyTrends(timeRange),
        analyticsAPI.getByCategory(),
        analyticsAPI.getByMealType(),
        analyticsAPI.getTopWasted(8),
        analyticsAPI.getWasteReasons(),
        analyticsAPI.getDashboardStats(),
      ]);

      setTrends(tRes || []);
      setCategories(cRes || []);
      setMeals(mRes || []);
      setTopItems(topRes || []);
      setReasons(rRes || []);
      setStats(sRes || {});
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPeriodWaste = trends.reduce((acc, curr) => acc + (curr.wasted || 0), 0).toFixed(1);
  const totalPeriodPrep = trends.reduce((acc, curr) => acc + (curr.prepared || 0), 0).toFixed(1);
  const avgPeriodPct = totalPeriodPrep > 0 ? ((totalPeriodWaste / totalPeriodPrep) * 100).toFixed(1) : 0;

  return (
    <div className="page-container">
      {/* Header & Date Range Selectors */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Waste Analytics & Intelligence
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
            In-depth statistical breakdown of canteen food wastage patterns, meal types, and critical causes.
          </p>
        </div>

        {/* Time Horizon Filter Buttons */}
        <div style={{ display: 'flex', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', gap: '4px' }}>
          {[
            { label: 'Past 7 Days', value: 7 },
            { label: 'Past 14 Days', value: 14 },
            { label: 'Past 30 Days (Monthly)', value: 30 },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTimeRange(t.value)}
              className={`btn btn-sm ${timeRange === t.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '6px 14px' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards for the Selected Period */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          title="Period Prepared Food"
          value={totalPeriodPrep}
          unit="kg"
          icon={Utensils}
          theme="blue"
          trend={`${timeRange} Days Total`}
          trendType="positive"
          subtitle="Sum of kitchen batches"
        />

        <StatCard
          title="Period Leftover Waste"
          value={totalPeriodWaste}
          unit="kg"
          icon={TrendingDown}
          theme="red"
          trend={`${avgPeriodPct}% Waste Ratio`}
          trendType="negative"
          subtitle="Avoidable dining waste"
        />

        <StatCard
          title="Average Waste Rate"
          value={avgPeriodPct}
          unit="%"
          icon={BarChart3}
          theme="orange"
          trend="Target: < 10%"
          trendType={avgPeriodPct < 12 ? 'positive' : 'negative'}
          subtitle="Campus EVS Target"
        />

        <StatCard
          title="Top Avoidable Reason"
          value={reasons[0]?.reason || 'Excess Prep'}
          icon={AlertTriangle}
          theme="orange"
          trend={`${reasons[0]?.percentage || 0}% of waste`}
          trendType="negative"
          subtitle="Actionable operational cause"
        />
      </div>

      {/* Main Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Daily Prep vs Waste Trend */}
        <ChartCard
          title={`Daily Food Preparation vs Waste (${timeRange} Days)`}
          subtitle="Daily comparison of food cooked vs discarded in kilograms"
          icon={BarChart3}
          height={320}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(val) => [`${val} kg`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="prepared" name="Prepared (kg)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="served" name="Served (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wasted" name="Waste (kg)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Waste Percentage Trajectory */}
        <ChartCard
          title="Daily Waste Percentage Trajectory"
          subtitle="Shows daily proportion of leftover food compared to total preparation"
          icon={TrendingDown}
          height={320}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis unit="%" tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(val) => [`${val}%`, 'Leftover Rate']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="waste_percentage"
                name="Waste %"
                stroke="#15803D"
                strokeWidth={3}
                dot={{ fill: '#15803D', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second Row: Meal Type Breakdown & Category Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Meal Type Breakdown */}
        <ChartCard
          title="Food Waste by Meal Type"
          subtitle="Comparison of leftover kilograms across Breakfast, Lunch, Snacks, Dinner"
          icon={Utensils}
          height={300}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={meals} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="meal_type" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(val) => [`${val} kg`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="wasted" name="Wasted Food (kg)" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="served" name="Served Food (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Waste Reasons Distribution */}
        <ChartCard
          title="Root Causes of Dining Waste"
          subtitle="Why food was left unconsumed (occurrences and volume percentage)"
          icon={PieIcon}
          height={300}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reasons}
                dataKey="waste_kg"
                nameKey="reason"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {reasons.map((entry, index) => (
                  <Cell key={`cell-reason-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFFFFF', border: 'none' }}
                formatter={(val) => [`${val} kg`, 'Waste']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Most Wasted Food Items Leaderboard Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Award size={18} color="#15803D" /> Top Most Wasted Food Items
            </h3>
            <p className="card-subtitle">
              High-priority dishes needing immediate portion resizing or batch reduction
            </p>
          </div>
        </div>

        <div className="table-responsive" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Dish Name</th>
                <th>Category</th>
                <th>Cumulative Prepared (kg)</th>
                <th>Cumulative Wasted (kg)</th>
                <th>Average Waste %</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {topItems.length > 0 ? (
                topItems.map((item, index) => {
                  const isHigh = item.avg_waste_pct > 15;
                  return (
                    <tr key={item.food_name}>
                      <td style={{ fontWeight: '800', color: '#64748B' }}>#{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{item.food_name}</div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{item.category}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{item.total_prepared.toFixed(1)} kg</td>
                      <td>
                        <span style={{ fontWeight: '800', color: isHigh ? '#DC2626' : '#C2410C' }}>
                          {item.total_wasted.toFixed(1)} kg
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`}>
                          {item.avg_waste_pct}%
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: isHigh ? '#B91C1C' : '#C2410C',
                          }}
                        >
                          {isHigh ? 'High Priority' : 'Moderate'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                    No recorded items to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
