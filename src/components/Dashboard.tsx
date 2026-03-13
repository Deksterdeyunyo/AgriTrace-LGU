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
  Filter,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, subDays, isBefore, addDays } from 'date-fns';

export default function Dashboard() {
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecipients: 0,
    totalHectares: 0,
    expiringItems: 0,
    utilizationRate: 0
  });
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeYear]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Fetch Recipients Count
      const { count: recipientsCount } = await supabase
        .from('recipients')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 2. Fetch Inventory for Expiry Alert
      const thirtyDaysFromNow = addDays(new Date(), 30).toISOString();
      const { count: expiringCount } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('expiry_date', thirtyDaysFromNow);

      // 3. Fetch Distributions for Trends and Hectares
      const { data: distributions } = await supabase
        .from('distributions')
        .select(`
          quantity,
          created_at,
          recipient:recipients(gender)
        `)
        .gte('created_at', `${activeYear}-01-01`)
        .lte('created_at', `${activeYear}-12-31`);

      if (distributions) {
        // Calculate Hectares (Mock logic: 1 bag = 1 Ha for demo purposes)
        const totalQty = distributions.reduce((sum, d) => sum + Number(d.quantity), 0);
        
        // Calculate Sector Breakdown
        const sectors: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
        distributions.forEach(d => {
          const gender = (d.recipient as any)?.gender || 'Other';
          sectors[gender]++;
        });

        const sectorChart = Object.entries(sectors).map(([name, value]) => ({
          name,
          value: distributions.length > 0 ? Math.round((value / distributions.length) * 100) : 0,
          color: name === 'Female' ? '#10b981' : name === 'Male' ? '#3b82f6' : '#f59e0b'
        }));

        // Calculate Monthly Trend
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map(m => ({ name: m, amount: 0 }));
        distributions.forEach(d => {
          const monthIdx = new Date(d.created_at).getMonth();
          monthlyData[monthIdx].amount += Number(d.quantity);
        });

        setStats({
          totalRecipients: recipientsCount || 0,
          totalHectares: totalQty, // 1:1 ratio for demo
          expiringItems: expiringCount || 0,
          utilizationRate: totalQty > 0 ? 84 : 0 // Placeholder for utilization
        });
        setSectorData(sectorChart);
        setTrendData(monthlyData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Year Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">The Command Center</h2>
          <p className="text-stone-500">Real-time agricultural program monitoring for FY {activeYear}.</p>
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
          value={`${stats.totalHectares.toLocaleString()} Ha`} 
          subtitle="Based on distributed seeds"
          icon={Map}
          color="emerald"
        />
        <StatCard 
          title="Stock Out-of-Date" 
          value={stats.expiringItems} 
          subtitle="Expiring within 30 days"
          icon={AlertTriangle}
          color="red"
          alert={stats.expiringItems > 0}
        />
        <StatCard 
          title="Verified Recipients" 
          value={stats.totalRecipients.toLocaleString()} 
          subtitle="RSBSA Registered"
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Program Utilization" 
          value={`${stats.utilizationRate}%`} 
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
            <h3 className="font-bold text-lg">Distribution Trend (Qty)</h3>
            <button className="p-2 hover:bg-stone-50 rounded-lg border border-stone-100">
              <Filter size={18} className="text-stone-400" />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
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
          <h3 className="font-bold text-lg mb-8">Gender Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {sectorData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm text-stone-600">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
            {sectorData.length === 0 && (
              <p className="text-center text-xs text-stone-400 py-4">No distribution data yet.</p>
            )}
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
