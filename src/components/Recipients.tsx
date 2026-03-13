import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  UserPlus, 
  CheckCircle2, 
  Clock,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Recipients() {
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipients();
  }, []);

  async function fetchRecipients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .eq('is_active', true)
      .order('full_name');
    
    if (data) setRecipients(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RSBSA Masterlist</h2>
          <p className="text-stone-500">Verified farmer database with geolocation.</p>
        </div>
        <button className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all">
          <UserPlus size={20} />
          Register Farmer
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Name or RSBSA Number..." 
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold outline-none">
            <option>All Farmer Types</option>
            <option>Rice</option>
            <option>Corn</option>
            <option>Livestock</option>
          </select>
          <select className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold outline-none">
            <option>All Status</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Recipients Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">RSBSA Number</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Full Name</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Farmer Type</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Location</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-4 h-16 bg-stone-50/50"></td>
                  </tr>
                ))
              ) : recipients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No recipients registered yet.
                  </td>
                </tr>
              ) : (
                recipients.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-4 font-mono text-xs font-bold">{r.rsbsa_number}</td>
                    <td className="p-4">
                      <div className="font-bold">{r.full_name}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-medium">{r.gender} • {r.civil_status}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {r.farmer_type?.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {r.latitude ? (
                        <button className="flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline">
                          <MapPin size={12} />
                          View Map
                        </button>
                      ) : (
                        <span className="text-stone-300 text-xs italic">Not Geotagged</span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.is_verified ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 size={14} />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                          <Clock size={14} />
                          Pending
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all">
                          <FileText size={16} className="text-stone-400" />
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-stone-200 transition-all">
                          <MoreHorizontal size={16} className="text-stone-400" />
                        </button>
                      </div>
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
}
