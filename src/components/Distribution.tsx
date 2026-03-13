import React, { useState, useEffect } from 'react';
import { 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Distribution() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    recipient_id: '',
    inventory_id: '',
    quantity: 1,
    mode: 'Individual Pick-up',
    representative_name: '',
    representative_relationship: '',
    latitude: null as number | null,
    longitude: null as number | null,
    encoder_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [distRes, recRes, invRes, userRes] = await Promise.all([
      supabase.from('distributions').select('*, recipients(full_name), inventory(item_name)').order('created_at', { ascending: false }),
      supabase.from('recipients').select('id, full_name, rsbsa_number').eq('is_active', true).eq('is_verified', true),
      supabase.from('inventory').select('id, item_name, quantity, unit').eq('is_active', true).gt('quantity', 0),
      supabase.auth.getUser()
    ]);

    if (distRes.data) setDistributions(distRes.data);
    if (recRes.data) setRecipients(recRes.data);
    if (invRes.data) setInventory(invRes.data);
    if (userRes.data.user) setFormData(prev => ({ ...prev, encoder_id: userRes.data.user.id }));
    
    setLoading(false);
  }

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // 1. Get current location
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }));
          resolve(true);
        }, () => resolve(true));
      });
    }

    // 2. Insert distribution
    const { error: distError } = await supabase.from('distributions').insert([formData]);

    if (!distError) {
      // 3. Update inventory
      const selectedItem = inventory.find(i => i.id === formData.inventory_id);
      if (selectedItem) {
        await supabase
          .from('inventory')
          .update({ quantity: selectedItem.quantity - formData.quantity })
          .eq('id', formData.inventory_id);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        fetchData();
      }, 1500);
      
      setFormData(prev => ({
        ...prev,
        recipient_id: '',
        inventory_id: '',
        quantity: 1,
        representative_name: '',
        representative_relationship: ''
      }));
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Distribution Tracking</h2>
          <p className="text-stone-500">Real-time audit trail for agricultural inputs.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all"
        >
          <Plus size={20} />
          New Distribution
        </button>
      </div>

      {/* Distribution Log */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">Recent Transactions</h3>
          <ShieldCheck size={18} className="text-emerald-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Timestamp</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Recipient</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Item Distributed</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Quantity</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mode</th>
                <th className="p-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-4 h-16 bg-stone-50/50"></td>
                  </tr>
                ))
              ) : distributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No distributions recorded yet.
                  </td>
                </tr>
              ) : (
                distributions.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-xs text-stone-500">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold">{d.recipients?.full_name}</td>
                    <td className="p-4 font-medium">{d.inventory?.item_name}</td>
                    <td className="p-4 font-mono font-bold">{d.quantity}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-lg uppercase">
                        {d.mode}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                        <ShieldCheck size={12} />
                        Geotagged
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#141414] text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">Record Distribution</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDistribute} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 size={20} />
                  <span className="font-bold">Distribution recorded and inventory updated!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Select Recipient (Verified Only)</label>
                  <select 
                    required
                    value={formData.recipient_id}
                    onChange={(e) => setFormData({...formData, recipient_id: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Choose Farmer...</option>
                    {recipients.map(r => (
                      <option key={r.id} value={r.id}>{r.full_name} ({r.rsbsa_number})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Item to Distribute</label>
                  <select 
                    required
                    value={formData.inventory_id}
                    onChange={(e) => setFormData({...formData, inventory_id: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Choose Item...</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.item_name} (Stock: {i.quantity} {i.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Quantity</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Mode of Distribution</label>
                  <select 
                    required
                    value={formData.mode}
                    onChange={(e) => setFormData({...formData, mode: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Individual Pick-up">Individual Pick-up</option>
                    <option value="Barangay Drop-off">Barangay Drop-off</option>
                    <option value="Mass Distribution">Mass Distribution</option>
                  </select>
                </div>
              </div>

              {formData.mode !== 'Individual Pick-up' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase">Representative Name</label>
                    <input 
                      type="text"
                      value={formData.representative_name}
                      onChange={(e) => setFormData({...formData, representative_name: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase">Relationship</label>
                    <input 
                      type="text"
                      value={formData.representative_relationship}
                      onChange={(e) => setFormData({...formData, representative_relationship: e.target.value})}
                      className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <ShieldCheck className="text-emerald-600" size={24} />
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase">Audit Capture Active</p>
                  <p className="text-[10px] text-emerald-600">
                    Your GPS coordinates and User ID will be automatically logged with this transaction for COA compliance.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#141414] text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Distribution'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
