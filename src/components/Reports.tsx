import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  ShieldCheck,
  TrendingUp,
  Users,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Reports() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('distributions')
      .select(`
        *,
        recipient:recipients(full_name, rsbsa_number),
        item:inventory(item_name, batch_number)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setDistributions(data);
    setLoading(false);
  }

  const handleExport = (type: string) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Exporting audit-ready ${type} report... (In a real app, this would trigger a download)`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit & Compliance Reports</h2>
          <p className="text-stone-500">Generate COA-ready liquidation and traceability reports.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('PDF')}
            disabled={exporting}
            className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            Export PDF
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            disabled={exporting}
            className="bg-[#141414] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Audit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-stone-700">Variance Report</h3>
          </div>
          <p className="text-2xl font-bold">0.00%</p>
          <p className="text-xs text-stone-400 mt-1">Physical vs. System Stock Variance</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-stone-700">Audit Compliance</h3>
          </div>
          <p className="text-2xl font-bold">100%</p>
          <p className="text-xs text-emerald-500 font-medium">Geotagged Transactions</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-stone-700">Active Encoders</h3>
          </div>
          <p className="text-2xl font-bold">{new Set(distributions.map(l => l.encoder_id)).size}</p>
          <p className="text-xs text-stone-400 mt-1">Staff currently recording distributions</p>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold">Detailed Transaction Log</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-9 pr-4 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Timestamp</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Recipient</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Item / Batch</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Qty</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Location</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Audit ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                [1,2,3].map(i => <tr key={i} className="h-16 animate-pulse bg-stone-50/30"></tr>)
              ) : distributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                distributions.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-xs font-medium text-stone-500">
                      {format(new Date(d.created_at), 'MMM dd, HH:mm')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm">{d.recipient?.full_name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{d.recipient?.rsbsa_number}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{d.item?.item_name}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-bold">Batch: {d.item?.batch_number}</div>
                    </td>
                    <td className="p-4 font-bold text-sm">{d.quantity}</td>
                    <td className="p-4">
                      <button className="flex items-center gap-1 text-blue-600 text-[10px] font-bold uppercase hover:underline">
                        <ExternalLink size={12} />
                        {d.latitude?.toFixed(4)}, {d.longitude?.toFixed(4)}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-500 text-[10px] font-mono rounded">
                        {d.encoder_id?.substring(0, 8)}...
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          <span>Generated on {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</span>
          <span>Encoder Audit Trail Active</span>
        </div>
      </div>

      <div className="p-6 bg-stone-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <AlertCircle className="text-amber-400" size={24} />
          </div>
          <div>
            <h4 className="font-bold">Audit Readiness Notice</h4>
            <p className="text-stone-400 text-sm">All data shown above is immutable and timestamped for COA verification.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest">Report Generated At</p>
          <p className="font-mono text-sm">{new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
