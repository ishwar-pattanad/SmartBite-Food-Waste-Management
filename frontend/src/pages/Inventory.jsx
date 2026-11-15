import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Layers,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import Modal from '../components/Modal';
import NotificationToast from '../components/NotificationToast';
import { inventoryAPI } from '../services/api';

const CATEGORIES = [
  'All',
  'Grains & Cereals',
  'Curries & Gravies',
  'Snacks & Starters',
  'Desserts & Sweets',
  'Beverages',
  'Salads & Sides',
  'Other',
];

const MEAL_TYPES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    food_name: '',
    category: 'Grains & Cereals',
    quantity_prepared: '',
    date: new Date().toISOString().split('T')[0],
    meal_type: 'Lunch',
    prepared_by: 'Main Kitchen Mess Team',
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, selectedMealType, selectedDate]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedMealType !== 'All') params.meal_type = selectedMealType;
      if (selectedDate) params.date = selectedDate;

      const data = await inventoryAPI.getAll(params);
      setItems(data || []);
    } catch (err) {
      showToast('error', 'Error loading inventory', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setFormData({
      food_name: '',
      category: 'Grains & Cereals',
      quantity_prepared: '',
      date: new Date().toISOString().split('T')[0],
      meal_type: 'Lunch',
      prepared_by: 'Main Kitchen Mess Team',
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
      quantity_prepared: item.quantity_prepared,
      date: item.date,
      meal_type: item.meal_type,
      prepared_by: item.prepared_by || 'Main Kitchen Mess Team',
      notes: item.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const qty = parseFloat(formData.quantity_prepared);
    if (!formData.food_name.trim()) {
      setFormError('Please enter a valid food item name.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity prepared must be greater than 0 kg.');
      return;
    }

    try {
      if (isEditing) {
        await inventoryAPI.update(currentItemId, {
          ...formData,
          quantity_prepared: qty,
        });
        showToast('success', 'Item Updated', `${formData.food_name} preparation record has been updated.`);
      } else {
        await inventoryAPI.create({
          ...formData,
          quantity_prepared: qty,
        });
        showToast('success', 'Item Added', `${formData.food_name} logged into today's kitchen inventory.`);
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please verify input.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await inventoryAPI.delete(deleteConfirmId);
      showToast('success', 'Item Removed', 'Preparation record deleted from database.');
      setDeleteConfirmId(null);
      fetchInventory();
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
            Food Inventory Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '2px 0 0' }}>
            Record and supervise daily meal batches prepared in the college dining hall.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Log New Food Preparation
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
              placeholder="Search by food name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Type Filter */}
          <div>
            <select
              className="form-select"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
            >
              {MEAL_TYPES.map((meal) => (
                <option key={meal} value={meal}>
                  Meal: {meal}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="btn btn-secondary btn-sm"
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Inventory Items Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Food Item Name</th>
              <th>Category</th>
              <th>Meal Shift</th>
              <th>Prepared Qty (kg)</th>
              <th>Cook Date</th>
              <th>Prepared By</th>
              <th>Notes / Details</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#15803D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Loading inventory items...</span>
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0F172A' }}>
                      <UtensilsCrossed size={16} color="#15803D" />
                      <span>{item.food_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{item.category}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{item.meal_type}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>
                      {item.quantity_prepared.toFixed(2)}
                    </span>{' '}
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>kg</span>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.825rem' }}>{item.date}</td>
                  <td style={{ color: '#64748B', fontSize: '0.825rem' }}>{item.prepared_by || 'Kitchen Team'}</td>
                  <td style={{ color: '#64748B', fontSize: '0.8rem', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-secondary btn-icon"
                        title="Edit Item"
                      >
                        <Edit2 size={14} color="#0F172A" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="btn btn-danger-light btn-icon"
                        title="Delete Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <UtensilsCrossed size={26} />
                    </div>
                    <div className="empty-state-title">No Food Preparation Records Found</div>
                    <div className="empty-state-desc">
                      No dishes matched your selected category, meal type, or search keyword. Log a new batch or clear filters.
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary btn-sm">
                      <Plus size={14} /> Log New Food Preparation
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Food Preparation Record' : 'Log New Food Preparation Batch'}
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
            <label className="form-label">Food Item Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Veg Dum Biryani, Chapati, Dal Makhani"
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
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meal Type *</label>
              <select
                className="form-select"
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              >
                {MEAL_TYPES.filter((m) => m !== 'All').map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Quantity Prepared (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="form-input"
                placeholder="e.g. 45.0"
                value={formData.quantity_prepared}
                onChange={(e) => setFormData({ ...formData, quantity_prepared: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preparation Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kitchen Team / Prepared By</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Main Kitchen Mess Team"
              value={formData.prepared_by}
              onChange={(e) => setFormData({ ...formData, prepared_by: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preparation Notes / Special Event</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Special menu for college cultural fest, staggered morning cooking"
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
              {isEditing ? 'Save Changes' : 'Record Preparation'}
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
            Delete this food preparation entry?
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '320px', margin: '0 auto' }}>
            This will permanently remove the record from the database. Any linked waste statistics will lose this inventory reference.
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

export default Inventory;
