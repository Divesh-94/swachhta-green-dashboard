import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const CATEGORIES = [
  'Sanitation', 'Waste Management', 'Water Wastage', 'Energy Wastage', 'Green Cover Damage', 'Other',
];
const SEVERITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

const severityBadge = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusBadge = {
  Open: 'bg-rose-100 text-rose-800 border-rose-200',
  'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const emptyForm = {
  location: '', category: 'Sanitation', description: '', severity: 'Medium',
};

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [vioRes, locRes] = await Promise.all([
        api.get('/violations', { params: filterStatus ? { status: filterStatus } : {} }),
        api.get('/locations'),
      ]);
      setViolations(vioRes.data);
      setLocations(locRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filterStatus]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.location) return setError('Please select a campus location');
    try {
      await api.post('/violations', form);
      setForm(emptyForm);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report violation');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/violations/${id}`, { status });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const filteredViolations = filterSeverity
    ? violations.filter((v) => v.severity === filterSeverity)
    : violations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Environmental Violations</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Log, track, and resolve campus cleanliness and sustainability non-compliances.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center space-x-2"
          >
            <span>{showForm ? '✕ Close Form' : '+ Report Violation'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Report Violation Collapsible Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-emerald-950/5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Report Non-Compliance Infraction</span>
            </h3>
            <span className="text-xs text-slate-400">All fields required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <select
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              >
                <option value="">-- Choose Facility --</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Violation Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SEVERITIES.map((s) => (
                  <label
                    key={s}
                    className={`flex items-center justify-center py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      form.severity === s
                        ? s === 'High'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : s === 'Medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={s}
                      checked={form.severity === s}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description & Corrective Guidance
            </label>
            <textarea
              name="description"
              required
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Specify the issue (e.g. Broken water pipe leaking in basement; mixed garbage bins)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              Submit Violation Report
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Severity Filter Pills */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          Severity:
        </span>
        <button
          onClick={() => setFilterSeverity('')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            filterSeverity === ''
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All ({violations.length})
        </button>
        {SEVERITIES.map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(filterSeverity === sev ? '' : sev)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === sev
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Issue Description</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading violations log...
                  </td>
                </tr>
              ) : filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No violations recorded under current filter.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{v.location?.name || '—'}</div>
                      <div className="text-[11px] text-slate-400">{v.location?.department || 'General'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{v.category}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-sm text-xs leading-relaxed">
                      {v.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          severityBadge[v.severity] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            v.severity === 'High'
                              ? 'bg-rose-500'
                              : v.severity === 'Medium'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        {v.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                      {v.reportedBy?.name || 'Auditor'}
                    </td>
                    <td className="px-6 py-4">
                      {/* Interactive Status Selector */}
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusChange(v._id, e.target.value)}
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-all shadow-2xs ${
                          statusBadge[v.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            ● {s}
                          </option>
                        ))}
                      </select>
                    </td>
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

export default Violations;
