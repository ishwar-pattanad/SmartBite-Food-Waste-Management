import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Filter,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Building2,
  Trash2,
  Edit2
} from 'lucide-react';
import Modal from '../components/Modal';
import NotificationToast from '../components/NotificationToast';
import { surplusAPI } from '../services/api';

const STATUS_OPTIONS = ['All', 'Available', 'Reserved', 'Distributed', 'Discarded'];

const Surplus = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    food_name: '',
    category: 'Grains & Cereals',
    available_quantity: '',
    meal_type: 'Lunch',
    prepared_time: 'Today, 12:00 PM',
    safe_consumption_deadline: 'Today, 04:30 PM',
    storage_temperature: 'Insulated Hot Holding Container (>65°C)',
    status: 'Available',
    recipient_organization: '',
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSurplusItems();
  }, [selectedStatus]);

  const fetchSurplusItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const data = await surplusAPI.getAll(params);
      setItems(data || []);
    } catch (err) {
      showToast('error', 'Error loading surplus items', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleQuickStatusChange = async (itemId, newStatus) => {
    try {
      await surplusAPI.updateStatus(itemId, { status: newStatus });
      showToast('success', 'Status Updated', `Item status set to ${newStatus}.`);
      fetchSurplusItems();
    } catch (err) {
      showToast('error', 'Failed to update status', err.message);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setFormData({
      food_name: '',
      category: 'Grains & Cereals',
      available_quantity: '',
      meal_type: 'Lunch',
      prepared_time: 'Today, 12:00 PM',
      safe_consumption_deadline: 'Today, 04:30 PM',
      storage_temperature: 'Insulated Hot Holding Container (>65°C)',
      status: 'Available',
      recipient_organization: '',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setCurrentItemId(item.id);
    setFormData({
      food_name: item.food_name,
      category: item.category,
      available_quantity: item.available_quantity,
      meal_type: item.meal_type,
      prepared_time: item.prepared_time,
      safe_consumption_deadline: item.safe_consumption_deadline,
      storage_temperature: item.storage_temperature || 'Hot Holding (>65°C)',
      status: item.status,
      recipient_organization: item.recipient_organization || '',
      notes: item.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const qty = parseFloat(formData.available_quantity);
    if (!formData.food_name.trim()) {
      setFormError('Please enter the food dish name.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setFormError('Available quantity must be greater than 0 kg.');
      return;
    }

    try {
      if (isEditing) {
        await surplusAPI.update(currentItemId, {
          ...formData,
          available_quantity: qty,
        });
        showToast('success', 'Surplus Updated', `${formData.food_name} record updated.`);
      } else {
        await surplusAPI.create({
          ...formData,
          available_quantity: qty,
        });
        showToast('success', 'Surplus Registered', `${formData.food_name} added to donation registry.`);
      }
      setIsModalOpen(false);
      fetchSurplusItems();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await surplusAPI.delete(deleteConfirmId);
      showToast('success', 'Record Removed', 'Surplus listing deleted.');
      setDeleteConfirmId(null);
      fetchSurplusItems();
    } catch (err) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="badge badge-success">Available for Pickup</span>;
      case 'Reserved':
        return <span className="badge badge-warning">Reserved by NGO</span>;
      case 'Distributed':
        return <span className="badge badge-info">Successfully Distributed</span>;
      case 'Discarded':
        return <span className="badge badge-danger">Unsafe / Discarded</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <NotificationToast toast={toast} onClose={() => setToast(null)} />

      {/* Mandatory Food Safety Warning Banner */}
      <div
        style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={22} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#92400E', margin: '0 0 2px' }}>
            Campus Food Safety & Redistribution Protocol
          </h4>
          <p style={{ fontSize: '0.825rem', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
            <strong>CRITICAL SAFETY MANDATE:</strong> Only wholesome, unserved food prepared in certified hygienic conditions and held strictly at safe temperatures (<strong>Hot Holding &gt;60°C</strong> or <strong>Refrigerated &lt;5°C</strong>) must be cleared for redistribution. <em>Never donate or consume food that has exceeded its safe consumption deadline or shows sensory deterioration.</em>
          </p>
        </div>
      </div>

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
            Food Donation & Surplus Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
            Coordinate safe redistribution of unconsumed canteen food with student volunteers and verified food banks.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Register Surplus Food Batch
        </button>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search surplus dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSurplusItems()}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Surplus Items Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Food Item Name</th>
              <th>Available Qty</th>
              <th>Meal Shift</th>
              <th>Cook Time</th>
              <th>Safe Deadline</th>
              <th>Storage Temp / Condition</th>
              <th>Status</th>
              <th>Recipient NGO / Volunteer</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#15803D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Loading surplus donation records...</span>
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{item.food_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{item.category}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', color: '#15803D', fontSize: '1rem' }}>
                      {item.available_quantity.toFixed(1)}
                    </span>{' '}
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>kg</span>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{item.meal_type}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>{item.prepared_time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '700', color: '#B91C1C' }}>
                      <Clock size={13} />
                      <span>{item.safe_consumption_deadline}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '160px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Thermometer size={13} color="#2563EB" />
                      <span>{item.storage_temperature}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: '600' }}>
                    {item.recipient_organization || <span style={{ color: '#94A3B8' }}>Unassigned</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {/* Quick Status Dropdown */}
                      <select
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                      >
                        <option value="Available">Set: Available</option>
                        <option value="Reserved">Set: Reserved</option>
                        <option value="Distributed">Set: Distributed</option>
                        <option value="Discarded">Set: Discarded</option>
                      </select>

                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-secondary btn-icon"
                        title="Edit Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="btn btn-danger-light btn-icon"
                        title="Delete Listing"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <HeartHandshake size={26} />
                    </div>
                    <div className="empty-state-title">No Surplus Food Listed</div>
                    <div className="empty-state-desc">
                      There are currently no surplus batches matching your status filter. Register a newly verified leftover batch to initiate distribution.
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Register Surplus Food Batch
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Surplus Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Surplus Donation Entry' : 'Register Surplus Food for Redistribution'}
        maxWidth="580px"
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
          <div className="form-group">
            <label className="form-label">Food Item / Dish *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Steamed Rice & Sambar, Chapati Packs"
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
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Available Surplus Quantity (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="form-input"
                placeholder="e.g. 5.5"
                value={formData.available_quantity}
                onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Cook / Prepared Time *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Today, 11:30 AM"
                value={formData.prepared_time}
                onChange={(e) => setFormData({ ...formData, prepared_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Safe Consumption Deadline *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Today, 04:30 PM"
                value={formData.safe_consumption_deadline}
                onChange={(e) => setFormData({ ...formData, safe_consumption_deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Storage Temperature & Holding Condition *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Insulated Hot Holding (>65°C), Refrigerated (<5°C)"
              value={formData.storage_temperature}
              onChange={(e) => setFormData({ ...formData, storage_temperature: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Distribution Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Distributed">Distributed</option>
                <option value="Discarded">Discarded (Unfit)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Partner / NGO</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Robin Hood Army, Community Shelter"
                value={formData.recipient_organization}
                onChange={(e) => setFormData({ ...formData, recipient_organization: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Packaging & Safety Notes</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Sealed in food-grade thermal containers; volunteer vehicle expected by 2 PM"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Register Surplus'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
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
            Delete this surplus food record?
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '320px', margin: '0 auto' }}>
            This will permanently remove the item from the active surplus donation ledger.
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

export default Surplus;
