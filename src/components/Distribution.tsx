import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  User, 
  Package, 
  MapPin, 
  Camera, 
  Signature,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Distribution() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    recipient_id: '',
    item_id: '',
    quantity: 1,
    mode: 'Individual Pick-up',
    representative_name: '',
    representative_relationship: '',
    remarks: ''
  });

  const [recipients, setRecipients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchData();
    captureLocation();
  }, []);

  async function fetchData() {
    const { data: r } = await supabase.from('recipients').select('id, full_name, rsbsa_number').eq('is_verified', true);
    const { data: i } = await supabase.from('inventory').select('id, item_name, quantity, unit').gt('quantity', 0);
    if (r) setRecipients(r);
    if (i) setInventory(i);
  }

  function captureLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (err) => {
        console.warn("Geolocation error:", err);
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    const { error: distError } = await supabase.from('distributions').insert({
      ...formData,
      latitude: location?.lat,
      longitude: location?.lng,
      encoder_id: user?.id
    });

    if (distError) {
      setError(distError.message);
    } else {
      // Update inventory quantity
      const item = inventory.find(i => i.id === formData.item_id);
      if (item) {
        await supabase.from('inventory').update({ 
          quantity: item.quantity - formData.quantity 
        }).eq('id', formData.item_id);
      }
      
      setSuccess(true);
      setFormData({
        recipient_id: '',
        item_id: '',
        quantity: 1,
        mode: 'Individual Pick-up',
        representative_name: '',
        representative_relationship: '',
        remarks: ''
      });
      setTimeout(() => setSuccess(false), 3000);
      fetchData(); // Refresh inventory
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Traceability Engine</h2>
        <p className="text-stone-500">Record item distribution with audit-ready metadata.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3 border border-emerald-100 animate-bounce">
            <CheckCircle2 size={24} />
            <span className="font-bold">Distribution recorded successfully! Audit trail updated.</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={24} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Recipient Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <User size={14} />
            Recipient Information
          </div>
          <select 
            required
            value={formData.recipient_id}
            onChange={(e) => setFormData({...formData, recipient_id: e.target.value})}
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          >
            <option value="">Select Verified Farmer...</option>
            {recipients.map(r => (
              <option key={r.id} value={r.id}>{r.full_name} ({r.rsbsa_number})</option>
            ))}
          </select>
        </div>

        {/* Item Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <Package size={14} />
              Item to Distribute
            </div>
            <select 
              required
              value={formData.item_id}
              onChange={(e) => setFormData({...formData, item_id: e.target.value})}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              <option value="">Select Stock Item...</option>
              {inventory.map(i => (
                <option key={i.id} value={i.id}>{i.item_name} (Avail: {i.quantity} {i.unit})</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
              Quantity
            </div>
            <input 
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Mode of Distribution */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            Mode of Distribution
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Individual Pick-up', 'Barangay Drop-off', 'Mass Distribution'].map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setFormData({...formData, mode: mode as any})}
                className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                  formData.mode === mode 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Representative Info (Conditional) */}
        <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-4">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Representative (Optional)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text"
              placeholder="Full Name"
              value={formData.representative_name}
              onChange={(e) => setFormData({...formData, representative_name: e.target.value})}
              className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none"
            />
            <input 
              type="text"
              placeholder="Relationship"
              value={formData.representative_relationship}
              onChange={(e) => setFormData({...formData, representative_relationship: e.target.value})}
              className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Audit Metadata (Auto-captured) */}
        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">
            <MapPin size={12} />
            GPS: {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Capturing...'}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase">
            <Camera size={12} />
            Photo/Signature Required
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#141414] text-white p-5 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (
            <>
              <Send size={24} />
              Confirm Distribution
            </>
          )}
        </button>
      </form>
    </div>
  );
}
