import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  UserPlus, 
  CheckCircle2, 
  Clock,
  MoreHorizontal,
  FileText,
  X,
  Loader2,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Recipients() {
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    rsbsa_number: '',
    full_name: '',
    gender: 'Male',
    farmer_type: [] as string[],
    civil_status: 'Married',
    membership: '',
    latitude: null as number | null,
    longitude: null as number | null,
    is_verified: false
  });

  const farmerTypes = ['Rice', 'Corn', 'High-Value Crops', 'Livestock', 'Fisherfolk'];

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase.from('recipients').insert([formData]);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        fetchRecipients();
      }, 1500);
      setFormData({
        rsbsa_number: '',
        full_name: '',
        gender: 'Male',
        farmer_type: [],
        civil_status: 'Married',
        membership: '',
        latitude: null,
        longitude: null,
        is_verified: false
      });
    }
    setSubmitting(false);
  };

  const toggleFarmerType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      farmer_type: prev.farmer_type.includes(type)
        ? prev.farmer_type.filter(t => t !== type)
        : [...prev.farmer_type, type]
    }));
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RSBSA Masterlist</h2>
          <p className="text-stone-500">Verified farmer database with geolocation.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all"
        >
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#141414] text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">Register New Farmer</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 border border-emerald-100">
                  <CheckCircle2 size={20} />
                  <span className="font-bold">Farmer registered successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">RSBSA Number</label>
                  <input 
                    required
                    type="text"
                    value={formData.rsbsa_number}
                    onChange={(e) => setFormData({...formData, rsbsa_number: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="07-12-34-567-890"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Gender</label>
                  <select 
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Civil Status</label>
                  <select 
                    required
                    value={formData.civil_status}
                    onChange={(e) => setFormData({...formData, civil_status: e.target.value})}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase">Farmer Type (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {farmerTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFarmerType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.farmer_type.includes(type)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase">Farmers Association / Cooperative</label>
                <input 
                  type="text"
                  value={formData.membership}
                  onChange={(e) => setFormData({...formData, membership: e.target.value})}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. San Isidro Farmers Association"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase">Farm Geotagging</p>
                    <p className="text-[10px] text-blue-600">
                      {formData.latitude ? `${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}` : 'Location not captured'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={captureLocation}
                  className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Capture GPS
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <input 
                  type="checkbox"
                  id="is_verified"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                  className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_verified" className="text-sm font-bold text-stone-600">
                  Mark as Verified (RSBSA Validated)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#141414] text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Register Farmer Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
