import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertCircle, 
  FileUp,
  Package,
  History,
  Download,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, addDays } from 'date-fns';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    item_name: '',
    batch_number: '',
    supplier: '',
    storage_location: '',
    quantity: 0,
    unit: 'Bags',
    expiry_date: '',
    reorder_level: 10,
    program_id: ''
  });

  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory();
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    const { data } = await supabase.from('programs').select('*').eq('is_active', true);
    if (data) setPrograms(data);
  }

  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase.from('inventory').insert([formData]);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        fetchInventory();
      }, 1500);
      setFormData({
        item_name: '',
        batch_number: '',
        supplier: '',
        storage_location: '',
        quantity: 0,
        unit: 'Bags',
        expiry_date: '',
        reorder_level: 10,
        program_id: ''
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Modules</h2>
          <p className="text-stone-500">Traceable stock management for DA shipments.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all"
        >
          <Plus size={20} />
          Add Stock Entry
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Item Name or Batch Number..." 
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
          <button className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white animate-pulse rounded-2xl border border-stone-200"></div>)
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-stone-300">
            <Package size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 font-medium">No inventory records found.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Package size={24} />
                </div>
                <button className="p-2 text-stone-400 hover:text-stone-600">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{item.item_name}</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                <span>Batch: {item.batch_number}</span>
                <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                <span>{item.supplier}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Current Stock</p>
                  <p className="text-xl font-bold">{item.quantity} {item.unit}</p>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Expiry Date</p>
                  <p className={`text-sm font-bold ${isNearExpiry(item.expiry_date) ? 'text-red-500' : ''}`}>
                    {item.expiry_date ? format(new Date(item.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <History size={14} />
                  Last Updated: {format(new Date(item.created_at), 'HH:mm')}
                </div>
                {item.quantity <= item.reorder_level && (
                  <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold uppercase">
                    <AlertCircle size={12} />
                    Low Stock
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#141414] text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">New Stock Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddStock} className="p-8 space-y-6">
              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 size={20} />
                  <span className="font-bold">Stock added to inventory!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Item Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Hybrid Rice Seeds"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Batch / Lot Number</label>
                  <input 
                    required
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. BATCH-2025-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Program / Category</label>
                  <select 
                    required
                    value={formData.program_id}
                    onChange={(e) => setFormData({...formData, program_id: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Program...</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.funding_year})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Supplier / Origin</label>
                  <select 
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Supplier...</option>
                    <option value="PhilRice">PhilRice</option>
                    <option value="DA-RFO7">DA-RFO7</option>
                    <option value="Private Contractor">Private Contractor</option>
                    <option value="LGU Local Budget">LGU Local Budget</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Storage Location</label>
                  <select 
                    required
                    value={formData.storage_location}
                    onChange={(e) => setFormData({...formData, storage_location: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Location...</option>
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Office Stockroom">Office Stockroom</option>
                    <option value="Barangay Hall">Barangay Hall</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Quantity</label>
                  <input 
                    required
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Expiry Date</label>
                  <input 
                    required
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#141414] text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Save Stock Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function isNearExpiry(dateStr: string) {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry < thirtyDaysFromNow;
}
