import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Map, 
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, isBefore } from 'date-fns';

export default function Dashboard() {
  const [activeYear, setActiveYear] = useState(2025);
  const [stats, setStats] = useState({
    totalRecipients: 0,
    totalHectares: 0,
    expiringItems: 0,
    utilizationRate: 0
  });

  // Mock data for visualization (would be fetched from Supabase)
  const genderData = [
    { name: 'Women', value: 45, color: '#10b981' },
    { name: 'Youth', value: 25, color: '#3b82f6' },
    { name: 'Seniors', value: 30, color: '#f59e0b' },
  ];

  const distributionTrend = [
    { name: 'Jan', amount: 400 },
    { name: 'Feb', amount: 300 },
    { name: 'Mar', amount: 600 },
    { name: 'Apr', amount: 800 },
    { name: 'May', amount: 500 },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Year Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">The Command Center</h2>
          <p className="text-stone-500">Real-time agricultural program monitoring.</p>
        </div>
        <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
          {[2024, 2025, 2026].map((year) => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeYear === year 
                  ? 'bg-[#141414] text-white shadow-md' 
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              FY {year}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Land Area Served" 
          value="1,240 Ha" 
          subtitle="Based on distributed seeds"
          icon={Map}
          color="emerald"
        />
        <StatCard 
          title="Stock Out-of-Date" 
          value="12 Items" 
          subtitle="Expiring within 30 days"
          icon={AlertTriangle}
          color="red"
          alert
        />
        <StatCard 
          title="Verified Recipients" 
          value="3,842" 
          subtitle="RSBSA Registered"
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Program Utilization" 
          value="84.2%" 
          subtitle="Budget vs Actual"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Distribution Trend</h3>
            <button className="p-2 hover:bg-stone-50 rounded-lg border border-stone-100">
              <Filter size={18} className="text-stone-400" />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distributionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-lg mb-8">Sector Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {genderData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm text-stone-600">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, alert }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border ${alert ? 'border-red-200' : 'border-stone-200'} shadow-sm relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 p-4 ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">{title}</p>
      <h4 className="text-3xl font-bold mt-2 mb-1">{value}</h4>
      <p className="text-xs text-stone-400 font-medium">{subtitle}</p>
      {alert && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg">
          <AlertTriangle size={14} />
          ACTION REQUIRED
        </div>
      )}
    </div>
  );
}
