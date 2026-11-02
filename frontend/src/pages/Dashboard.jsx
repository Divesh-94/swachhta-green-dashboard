import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-emerald-400 font-bold text-sm">
          {payload[0].name}: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-amber-400 font-bold text-sm">
          Violations: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, subtext, icon, colorClass, borderClass }) => (
  <div className={`bg-white rounded-2xl p-6 border ${borderClass || 'border-slate-100'} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs ${colorClass}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading compliance analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 text-center space-y-4 my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center text-2xl mx-auto">
          🔒
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Session Expired</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your login session has expired. Please sign in again to access the dashboard.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          Sign In to Refresh Session →
        </button>
      </div>
    );
  }

  const trendData = (summary.complianceTrend || []).map((t, i) => ({
    name: `Audit #${i + 1}`,
    score: t.complianceScore,
    date: new Date(t.inspectionDate).toLocaleDateString(),
  }));

  const categoryData = (summary.violationsByCategory || []).map((c) => ({
    category: c._id || 'General',
    count: c.count,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time Compliance Engine Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Green Overview
          </h2>
          <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
            Welcome back, <span className="font-bold text-white">{user?.name}</span>. Here is the latest cleanliness and environmental compliance audit status across campus.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/inspections"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            + New Audit
          </Link>
          <Link
            to="/violations"
            className="px-4 py-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 border border-white/20 text-white font-bold text-xs transition-all active:scale-95"
          >
            Track Violations
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Locations"
          value={summary.totalLocations}
          subtext="Campus zones monitored"
          icon="🏢"
          colorClass="bg-blue-50 text-blue-600 border border-blue-100"
        />
        <StatCard
          label="Total Audits"
          value={summary.totalInspections}
          subtext="Inspections conducted"
          icon="📋"
          colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
        />
        <StatCard
          label="Open Violations"
          value={summary.openViolations}
          subtext="Pending remediation"
          icon="⚠️"
          colorClass="bg-rose-50 text-rose-600 border border-rose-100"
          borderClass={summary.openViolations > 0 ? 'border-rose-200/80' : 'border-slate-100'}
        />
        <StatCard
          label="Avg. Compliance"
          value={`${summary.avgComplianceScore}%`}
          subtext="Across all facilities"
          icon="🌿"
          colorClass="bg-teal-50 text-teal-600 border border-teal-100"
        />
      </div>

      {/* Critical Compliance Alerts Banner */}
      {summary.alerts?.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <h3 className="text-sm font-bold text-rose-900">
                Action Required: {summary.alerts.length} Location(s) Below Threshold
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-200/60 text-rose-800">
              High Priority
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.alerts.map((a) => (
              <div
                key={a.locationId}
                className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{a.location}</span>
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                    {a.complianceScore}% / {a.threshold}% Target
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (a.complianceScore / a.threshold) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Last audit: {new Date(a.inspectionDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Score Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Compliance Score Trajectory</h3>
              <p className="text-xs text-slate-400">Score variations across historical audits</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              Target ≥ 70%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations by Category */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Infractions by Category</h3>
              <p className="text-xs text-slate-400">Distribution of campus compliance issues</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
              Active Issues
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
