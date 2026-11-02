import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const DEFAULT_CRITERIA = [
  { name: 'Cleanliness & Sanitation', maxScore: 10, obtainedScore: 8 },
  { name: 'Waste Segregation & Disposal', maxScore: 10, obtainedScore: 7 },
  { name: 'Water & Energy Conservation', maxScore: 10, obtainedScore: 8 },
  { name: 'Green Cover / Plantation Upkeep', maxScore: 10, obtainedScore: 9 },
  { name: 'Signage & Awareness Compliance', maxScore: 10, obtainedScore: 8 },
];

const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [insRes, locRes] = await Promise.all([
        api.get('/inspections', { params: filterStatus ? { status: filterStatus } : {} }),
        api.get('/locations'),
      ]);
      setInspections(insRes.data);
      setLocations(locRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filterStatus]);

  const updateScore = (index, value) => {
    const updated = [...criteria];
    const num = Math.max(0, Math.min(updated[index].maxScore, Number(value) || 0));
    updated[index] = { ...updated[index], obtainedScore: num };
    setCriteria(updated);
  };

  const livePreview = () => {
    const max = criteria.reduce((s, c) => s + c.maxScore, 0);
    const got = criteria.reduce((s, c) => s + c.obtainedScore, 0);
    return max ? Math.round((got / max) * 100) : 0;
  };

  const currentScore = livePreview();
  const isLikelyCompliant = currentScore >= 70;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!locationId) return setError('Please select a campus location to inspect');
    try {
      await api.post('/inspections', { location: locationId, criteria, notes });
      setShowForm(false);
      setLocationId('');
      setCriteria(DEFAULT_CRITERIA);
      setNotes('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inspection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compliance Audits</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Record physical cleanliness inspections and standard scoring.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Audit Results</option>
            <option value="Compliant">✓ Compliant</option>
            <option value="Non-Compliant">✕ Non-Compliant</option>
          </select>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center space-x-2"
          >
            <span>{showForm ? '✕ Close Form' : '+ New Audit'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Audit Entry Modal / Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-emerald-950/5 space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Conduct Standard Environmental Audit</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluate each parameter from 0 to 10 marks. Scores auto-calculate in real time.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCriteria(criteria.map((c) => ({ ...c, obtainedScore: 10 })))}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100"
              >
                Max All
              </button>
              <button
                type="button"
                onClick={() => setCriteria(criteria.map((c) => ({ ...c, obtainedScore: 5 })))}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Reset 50%
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Column: Location Selection & Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Location
                </label>
                <select
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Choose Campus Block --</option>
                  {locations.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.department}) - Pass: {l.complianceThreshold}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Dynamic Score Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isLikelyCompliant
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-rose-50/80 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Calculated Score
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      isLikelyCompliant
                        ? 'bg-emerald-200/60 text-emerald-800'
                        : 'bg-rose-200/60 text-rose-800'
                    }`}
                  >
                    {isLikelyCompliant ? 'Compliant Target' : 'Below Target'}
                  </span>
                </div>
                <div
                  className={`text-4xl font-extrabold mt-2 tracking-tight ${
                    isLikelyCompliant ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {currentScore}%
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Computed via Mongoose server-side pre-save hook.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Auditor Remarks / Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record observations, specific issues observed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Right Column: 5 Weighted Criteria Scoring Sliders */}
            <div className="md:col-span-2 space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Scoring Parameters (0 - 10 Marks Each)
              </p>
              {criteria.map((c, i) => (
                <div
                  key={c.name}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-400">Parameter #{i + 1}</div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max={c.maxScore}
                      value={c.obtainedScore}
                      onChange={(e) => updateScore(i, e.target.value)}
                      className="w-28 sm:w-36 accent-emerald-600 cursor-pointer"
                    />
                    <div className="w-14 text-center py-1 px-2 rounded-lg bg-slate-100 font-extrabold text-xs text-slate-800 border border-slate-200">
                      {c.obtainedScore} / {c.maxScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              Submit & Finalize Inspection
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Inspections History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Facility Monitored</th>
                <th className="px-6 py-4">Assigned Auditor</th>
                <th className="px-6 py-4">Audit Date</th>
                <th className="px-6 py-4">Final Score</th>
                <th className="px-6 py-4">Status Result</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading audit records...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No inspection audits recorded yet.
                  </td>
                </tr>
              ) : (
                inspections.map((ins) => {
                  const isCompliant = ins.status === 'Compliant';
                  return (
                    <tr key={ins._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{ins.location?.name || '—'}</div>
                        <div className="text-[11px] text-slate-400">{ins.location?.category || 'General'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs">👤</span>
                          <span>{ins.auditor?.name || 'Authorized Auditor'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {new Date(ins.inspectionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {ins.complianceScore}%
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isCompliant
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              isCompliant ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></span>
                          {ins.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                        {ins.notes || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedInspection(ins)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Breakdown ↗
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criteria Breakdown Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedInspection.location?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Audit Date: {new Date(selectedInspection.inspectionDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {(selectedInspection.criteria || []).map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs"
                >
                  <span className="font-semibold text-slate-700">{c.name}</span>
                  <span className="font-extrabold text-slate-900 px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                    {c.obtainedScore} / {c.maxScore}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">Overall Final Compliance Score:</span>
              <span className="text-lg font-black text-emerald-700">
                {selectedInspection.complianceScore}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspections;
