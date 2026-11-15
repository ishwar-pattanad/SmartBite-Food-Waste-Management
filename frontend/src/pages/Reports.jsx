import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Printer,
  CheckCircle,
  TrendingDown,
  Utensils,
  Trash2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import NotificationToast from '../components/NotificationToast';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [period, setPeriod] = useState('weekly');
  const [mealType, setMealType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [period, mealType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (mealType !== 'All') params.meal_type = mealType;
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const data = await reportsAPI.getSummary(params);
      setReportData(data);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Error generating report',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setToast({
        type: 'warning',
        title: 'Select Date Range',
        message: 'Please provide both start and end dates.',
      });
      return;
    }
    fetchReport();
  };

  const handleExportCSV = () => {
    try {
      const exportUrl = reportsAPI.getExportUrl(period, mealType, startDate, endDate);
      // Trigger download
      window.open(exportUrl, '_blank');
      setToast({
        type: 'success',
        title: 'CSV Export Initiated',
        message: 'Your food waste audit report is downloading.',
      });
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <NotificationToast toast={toast} onClose={() => setToast(null)} />

      {/* Header & Export Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Canteen Audit & Reports
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
            Generate structured environmental audit summaries and export kitchen data to CSV spreadsheet.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary">
            <Download size={16} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Preset Period Buttons */}
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            {[
              { label: 'Daily (Latest)', val: 'daily' },
              { label: 'Weekly Summary', val: 'weekly' },
              { label: 'Monthly Summary', val: 'monthly' },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPeriod(p.val);
                }}
                className={`btn btn-sm ${period === p.val && !startDate ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Meal Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B' }}>Meal Shift:</span>
            <select
              className="form-select"
              style={{ width: '150px', padding: '6px 12px' }}
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="All">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snacks">Snacks</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* Custom Date Range Picker */}
          <form onSubmit={handleCustomDateSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem', width: '135px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start"
            />
            <span style={{ color: '#94A3B8' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem', width: '135px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End"
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards for the Report */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          title="Total Prepared Food"
          value={reportData?.total_prepared_kg ?? 0}
          unit="kg"
          icon={Utensils}
          theme="blue"
          trend={`${reportData?.record_count ?? 0} logs analyzed`}
          trendType="positive"
          subtitle="Audit period volume"
        />

        <StatCard
          title="Total Food Consumed"
          value={reportData?.total_served_kg ?? 0}
          unit="kg"
          icon={CheckCircle}
          theme="green"
          trend="Served to diners"
          trendType="positive"
          subtitle="Net campus consumption"
        />

        <StatCard
          title="Total Food Wasted"
          value={reportData?.total_wasted_kg ?? 0}
          unit="kg"
          icon={Trash2}
          theme="red"
          trend="Leftover weight"
          trendType="negative"
          subtitle="Avoidable organic waste"
        />

        <StatCard
          title="Waste Percentage"
          value={reportData?.waste_percentage ?? 0}
          unit="%"
          icon={TrendingDown}
          theme="orange"
          trend="EVS Target: <10%"
          trendType={reportData?.waste_percentage < 12 ? 'positive' : 'negative'}
          subtitle="Calculated audit ratio"
        />
      </div>

      {/* Audit Detail Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileSpreadsheet size={18} color="#15803D" /> Detailed Kitchen Audit Log
            </h3>
            <p className="card-subtitle">
              Tabular records ready for departmental review or accreditation submission
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Dish Name</th>
                <th>Category</th>
                <th>Meal Shift</th>
                <th>Prepared (kg)</th>
                <th>Served (kg)</th>
                <th>Waste (kg)</th>
                <th>Waste (%)</th>
                <th>Waste Reason</th>
                <th>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#15803D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Compiling audit report...</span>
                  </td>
                </tr>
              ) : reportData?.records && reportData.records.length > 0 ? (
                reportData.records.map((r) => {
                  const isHigh = r.waste_percentage > 18;
                  return (
                    <tr key={r.id}>
                      <td style={{ color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {r.date}
                      </td>
                      <td style={{ fontWeight: '700', color: '#0F172A' }}>{r.food_name}</td>
                      <td>
                        <span className="badge badge-secondary">{r.category}</span>
                      </td>
                      <td>
                        <span className="badge badge-info">{r.meal_type}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{r.quantity_prepared.toFixed(2)}</td>
                      <td style={{ fontWeight: '600', color: '#15803D' }}>{r.quantity_served.toFixed(2)}</td>
                      <td style={{ fontWeight: '800', color: isHigh ? '#DC2626' : '#C2410C' }}>
                        {r.quantity_waste.toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`}>
                          {r.waste_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>{r.waste_reason}</td>
                      <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{r.action_taken}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                    No audit records found for the chosen filters.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Summary Footer */}
            {reportData && reportData.records && reportData.records.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#F8FAFC', fontWeight: '800', borderTop: '2px solid #CBD5E1' }}>
                  <td colSpan="4" style={{ padding: '14px 16px', color: '#0F172A' }}>
                    AUDIT TOTALS ({reportData.record_count} items)
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1E40AF' }}>
                    {reportData.total_prepared_kg.toFixed(2)} kg
                  </td>
                  <td style={{ padding: '14px 16px', color: '#15803D' }}>
                    {reportData.total_served_kg.toFixed(2)} kg
                  </td>
                  <td style={{ padding: '14px 16px', color: '#DC2626' }}>
                    {reportData.total_wasted_kg.toFixed(2)} kg
                  </td>
                  <td style={{ padding: '14px 16px', color: '#C2410C' }}>
                    {reportData.waste_percentage.toFixed(1)}%
                  </td>
                  <td colSpan="2" style={{ padding: '14px 16px', color: '#64748B', fontSize: '0.8rem' }}>
                    Clean audit generated
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
