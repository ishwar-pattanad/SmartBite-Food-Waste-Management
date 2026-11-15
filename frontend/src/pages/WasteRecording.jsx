import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Search,
  Filter,
  Calculator,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Edit2,
  TrendingDown,
  Info
} from 'lucide-react';
import Modal from '../components/Modal';
import NotificationToast from '../components/NotificationToast';
import { wasteAPI, inventoryAPI } from '../services/api';

const WASTE_REASONS = [
  'All',
  'Excess food preparation',
  'Low student attendance',
  'Poor food demand prediction',
  'Food quality issues',
  'Other',
];

const MEAL_TYPES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const WasteRecording = () => {
  const [records, setRecords] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReason, setSelectedReason] = useState('All');
  const [selectedMeal, setSelectedMeal] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    food_name: '',
    category: 'Grains & Cereals',
    meal_type: 'Lunch',
    quantity_prepared: '',
    quantity_served: '',
    waste_reason: 'Excess food preparation',
    recorded_date: new Date().toISOString().split('T')[0],
    recorded_by: 'Canteen Staff',
    action_taken: '',
    inventory_id: null,
  });

  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  // Auto-calculated properties
  const prep = parseFloat(formData.quantity_prepared) || 0;
  const serv = parseFloat(formData.quantity_served) || 0;
  const autoWasteKg = prep > 0 && serv <= prep ? (prep - serv).toFixed(2) : '0.00';
  const autoWastePct = prep > 0 && serv <= prep ? (((prep - serv) / prep) * 100).toFixed(1) : '0.0';
  const isInvalidServed = serv > prep && prep > 0;

  useEffect(() => {
    fetchRecords();
    loadInventoryDropdown();
  }, [selectedReason, selectedMeal]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedReason !== 'All') params.waste_reason = selectedReason;
      if (selectedMeal !== 'All') params.meal_type = selectedMeal;

      const data = await wasteAPI.getAll(params);
      setRecords(data || []);
    } catch (err) {
      showToast('error', 'Failed to load records', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryDropdown = async () => {
    try {
      const items = await inventoryAPI.getAll();
      setInventoryList(items || []);
    } catch (err) {
      console.error('Could not load inventory items for dropdown:', err);
    }
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInventorySelect = (e) => {
    const invId = parseInt(e.target.value);
    if (!invId) return;

    const selected = inventoryList.find((i) => i.id === invId);
    if (selected) {
      setFormData({
        ...formData,
        inventory_id: selected.id,
        food_name: selected.food_name,
        category: selected.category,
        meal_type: selected.meal_type,
        quantity_prepared: selected.quantity_prepared,
        recorded_date: selected.date,
      });
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentRecordId(null);
    setFormData({
      food_name: '',
      category: 'Grains & Cereals',
      meal_type: 'Lunch',
      quantity_prepared: '',
      quantity_served: '',
      waste_reason: 'Excess food preparation',
      recorded_date: new Date().toISOString().split('T')[0],
      recorded_by: 'Rajesh Kumar (Head Chef)',
      action_taken: '',
      inventory_id: null,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec) => {
    setIsEditing(true);
    setCurrentRecordId(rec.id);
    setFormData({
      food_name: rec.food_name,
      category: rec.category,
      meal_type: rec.meal_type,
      quantity_prepared: rec.quantity_prepared,
      quantity_served: rec.quantity_served,
      waste_reason: rec.waste_reason,
      recorded_date: rec.recorded_date,
      recorded_by: rec.recorded_by || 'Canteen Staff',
      action_taken: rec.action_taken || '',
      inventory_id: rec.inventory_id,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.food_name.trim()) {
      setFormError('Please enter a valid food item name.');
      return;
    }

    if (prep <= 0) {
      setFormError('Quantity prepared must be greater than 0 kg.');
      return;
    }

    if (serv < 0) {
      setFormError('Quantity served cannot be negative.');
      return;
    }

    if (serv > prep) {
      setFormError('Quantity served cannot be greater than quantity prepared.');
      return;
    }

    try {
      const payload = {
        food_name: formData.food_name.trim(),
        category: formData.category,
        meal_type: formData.meal_type,
        quantity_prepared: prep,
        quantity_served: serv,
        waste_reason: formData.waste_reason,
        recorded_date: formData.recorded_date,
        recorded_by: formData.recorded_by,
        action_taken: formData.action_taken,
        inventory_id: formData.inventory_id,
      };

      if (isEditing) {
        await wasteAPI.update(currentRecordId, payload);
        showToast('success', 'Record Updated', `Waste entry for ${formData.food_name} updated successfully.`);
      } else {
        await wasteAPI.create(payload);
        showToast('success', 'Waste Logged', `${autoWasteKg} kg waste logged for ${formData.food_name}.`);
      }
      setIsModalOpen(false);
      fetchRecords();
    } catch (err) {
      setFormError(err.message || 'Failed to submit waste log.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await wasteAPI.delete(deleteConfirmId);
      showToast('success', 'Record Deleted', 'Food waste record removed from system.');
      setDeleteConfirmId(null);
      fetchRecords();
    } catch (err) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  return (
    <div className="page-container">
      <NotificationToast toast={toast} onClose={() => setToast(null)} />

      {/* Header & Controls */}
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
            Food Waste & Leftover Recording
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
            Document leftover dining food with automatic waste calculation and reason tracking.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Record Leftover / Food Waste
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search food item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
          </div>

          {/* Waste Reason Filter */}
          <div>
            <select
              className="form-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              {WASTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  Reason: {r}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Shift Filter */}
          <div>
            <select
              className="form-select"
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  Meal: {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Waste Records Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Food Item</th>
              <th>Meal Shift</th>
              <th>Prepared (kg)</th>
              <th>Served (kg)</th>
              <th>Food Waste (kg)</th>
              <th>Waste (%)</th>
              <th>Waste Cause / Reason</th>
              <th>Date</th>
              <th>Action Taken</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#15803D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Loading recorded food waste logs...</span>
                </td>
              </tr>
            ) : records.length > 0 ? (
              records.map((rec) => {
                const isHighWaste = rec.waste_percentage > 18;
                return (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0F172A' }}>{rec.food_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{rec.category}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{rec.meal_type}</span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#0F172A' }}>
                      {rec.quantity_prepared.toFixed(2)} kg
                    </td>
                    <td style={{ fontWeight: '600', color: '#15803D' }}>
                      {rec.quantity_served.toFixed(2)} kg
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: '800',
                          fontSize: '0.95rem',
                          color: isHighWaste ? '#DC2626' : '#C2410C',
                        }}
                      >
                        {rec.quantity_waste.toFixed(2)} kg
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isHighWaste ? 'badge-danger' : 'badge-warning'}`}>
                        {rec.waste_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#475569',
                          backgroundColor: '#F1F5F9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {rec.waste_reason}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {rec.recorded_date}
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.8rem', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.action_taken || 'Standard protocol'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(rec)}
                          className="btn btn-secondary btn-icon"
                          title="Edit Entry"
                        >
                          <Edit2 size={14} color="#0F172A" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(rec.id)}
                          className="btn btn-danger-light btn-icon"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Trash2 size={26} />
                    </div>
                    <div className="empty-state-title">No Food Waste Records Found</div>
                    <div className="empty-state-desc">
                      No waste entries match your filter. Log leftover food after a meal shift to update analytics.
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Record Food Waste Now
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Waste Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Food Waste Record' : 'Record Leftover / Canteen Food Waste'}
        maxWidth="600px"
      >
        {formError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* Quick Select from Inventory */}
          {!isEditing && inventoryList.length > 0 && (
            <div className="form-group" style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
              <label className="form-label" style={{ color: '#15803D' }}>
                Quick Autofill from Today's Food Inventory (Optional)
              </label>
              <select className="form-select" onChange={handleInventorySelect}>
                <option value="">-- Choose an item from prepared inventory --</option>
                {inventoryList.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.food_name} ({inv.meal_type} • {inv.quantity_prepared} kg)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Food Item Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Steamed Rice, Paneer Butter Masala, Roti"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Curries & Gravies">Curries & Gravies</option>
                <option value="Snacks & Starters">Snacks & Starters</option>
                <option value="Desserts & Sweets">Desserts & Sweets</option>
                <option value="Salads & Sides">Salads & Sides</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meal Type *</label>
              <select
                className="form-select"
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          {/* Quantities & Automated Calculation Card */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity Prepared (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  placeholder="e.g. 50.0"
                  value={formData.quantity_prepared}
                  onChange={(e) => setFormData({ ...formData, quantity_prepared: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity Served / Consumed (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={`form-input ${isInvalidServed ? 'form-input-error' : ''}`}
                  placeholder="e.g. 42.5"
                  value={formData.quantity_served}
                  onChange={(e) => setFormData({ ...formData, quantity_served: e.target.value })}
                  required
                />
              </div>
            </div>

            {isInvalidServed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '0.78rem', marginBottom: '10px' }}>
                <AlertTriangle size={14} />
                <span>Validation Error: Served quantity cannot exceed prepared quantity!</span>
              </div>
            )}

            {/* Live Automated Calculation Display */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isInvalidServed ? '#FEE2E2' : '#EFF6FF',
                border: `1px solid ${isInvalidServed ? '#FECACA' : '#BFDBFE'}`,
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>
                  Auto Food Waste:
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: isInvalidServed ? '#DC2626' : '#1E40AF' }}>
                  {autoWasteKg} <span style={{ fontSize: '0.8rem' }}>kg</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  (Prepared - Served)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>
                  Waste Percentage:
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: isInvalidServed ? '#DC2626' : '#C2410C' }}>
                  {autoWastePct}%
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  (Waste / Prepared × 100)
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Primary Waste Reason *</label>
              <select
                className="form-select"
                value={formData.waste_reason}
                onChange={(e) => setFormData({ ...formData, waste_reason: e.target.value })}
              >
                {WASTE_REASONS.filter((r) => r !== 'All').map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Record Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.recorded_date}
                onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Action Taken / Leftover Handling</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Transferred to hot holding for surplus donation, composted peels"
              value={formData.action_taken}
              onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '0 -24px -24px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isInvalidServed}>
              {isEditing ? 'Update Waste Log' : 'Save Waste Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Record Deletion"
        maxWidth="440px"
      >
        <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Trash2 size={24} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
            Delete this food waste record?
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '320px', margin: '0 auto' }}>
            This will permanently remove the record and recalculate today's analytics and reports.
          </p>
        </div>

        <div className="modal-footer" style={{ margin: '0 -24px -24px' }}>
          <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={confirmDelete} className="btn btn-danger">
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default WasteRecording;
