import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = [
  'Academic Block', 'Hostel', 'Canteen', 'Lab', 'Washroom', 'Campus Ground', 'Office', 'Other',
];

const categoryColors = {
  'Academic Block': 'bg-blue-50 text-blue-700 border-blue-200',
  'Hostel': 'bg-purple-50 text-purple-700 border-purple-200',
  'Canteen': 'bg-amber-50 text-amber-700 border-amber-200',
  'Lab': 'bg-teal-50 text-teal-700 border-teal-200',
  'Washroom': 'bg-rose-50 text-rose-700 border-rose-200',
  'Campus Ground': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Office': 'bg-slate-50 text-slate-700 border-slate-200',
  'Other': 'bg-gray-50 text-gray-700 border-gray-200',
};

const emptyForm = {
  name: '', department: '', category: 'Academic Block', incharge: '', complianceThreshold: 70,
};

const Locations = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/locations', { params: search ? { search } : {} });
      setLocations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, complianceThreshold: Number(form.complianceThreshold) };
      if (editingId) {
        await api.put(`/locations/${editingId}`, payload);
      } else {
        await api.post('/locations', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (loc) => {
    setEditingId(loc._id);
    setForm({
      name: loc.name || '',
      department: loc.department || '',
      category: loc.category || 'Other',
      incharge: loc.incharge || '',
      complianceThreshold: loc.complianceThreshold ?? 70,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus location?')) return;
    try {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredLocations = selectedCategory
    ? locations.filter((l) => l.category === selectedCategory)
    : locations;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Locations</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage institutional buildings, blocks, and target compliance standards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (editingId) {
                  setEditingId(null);
                  setForm(emptyForm);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>{showForm ? '✕ Close Form' : '+ Add Location'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Add / Edit Collapsible Form */}
      {isAdmin && showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-lg shadow-emerald-950/5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{editingId ? 'Edit Location Details' : 'Register New Campus Location'}</span>
            </h3>
            <span className="text-xs text-slate-400">All fields required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Location Name
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Science Block C"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Physics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                In-Charge Person
              </label>
              <input
                name="incharge"
                value={form.incharge}
                onChange={handleChange}
                placeholder="e.g. Dr. Ramesh"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Threshold (%)
              </label>
              <input
                type="number"
                name="complianceThreshold"
                min="0"
                max="100"
                value={form.complianceThreshold}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              {editingId ? 'Save Changes' : 'Confirm & Register'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location name or department..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            All Categories ({locations.length})
          </button>
          {CATEGORIES.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Locations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Facility / Location</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">In-Charge</th>
                <th className="px-6 py-4">Target Threshold</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading campus locations...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No matching locations found.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{loc.name}</div>
                      <div className="text-[11px] text-slate-400">ID: {loc._id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {loc.department || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          categoryColors[loc.category] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {loc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                          👤
                        </span>
                        <span>{loc.incharge || 'Not Assigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${loc.complianceThreshold}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{loc.complianceThreshold}%</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(loc)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(loc._id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Locations;
