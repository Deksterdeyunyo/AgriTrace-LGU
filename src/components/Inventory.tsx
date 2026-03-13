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
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

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
