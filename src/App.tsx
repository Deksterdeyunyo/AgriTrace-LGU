/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ClipboardCheck, 
  FileText, 
  LogOut,
  Menu,
  X,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

// Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Recipients from './components/Recipients';
import Distribution from './components/Distribution';
import Reports from './components/Reports';
import Auth from './components/Auth';

type View = 'dashboard' | 'inventory' | 'recipients' | 'distribution' | 'reports';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        seedInitialData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        seedInitialData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function seedInitialData() {
    const requestedPrograms = [
      { name: 'Organic Fertilizer Program', funding_year: 2026 },
      { name: 'Inorganic Fertilizer Support', funding_year: 2026 },
      { name: 'Livestock Deworming Initiative', funding_year: 2026 },
      { name: 'Anti-Rabies Campaign', funding_year: 2026 },
      { name: 'Pesticide & Pest Control', funding_year: 2026 }
    ];

    for (const prog of requestedPrograms) {
      const { data: existing } = await supabase
        .from('programs')
        .select('id')
        .eq('name', prog.name)
        .single();

      if (!existing) {
        const { data: newProg } = await supabase
          .from('programs')
          .insert([prog])
          .select()
          .single();

        if (newProg) {
          // Add sample inventory for this program
          const sampleItems: any = {
            'Organic Fertilizer Program': { item_name: 'Premium Organic Compost', unit: 'Bags', quantity: 500 },
            'Inorganic Fertilizer Support': { item_name: 'Urea 46-0-0', unit: 'Bags', quantity: 200 },
            'Livestock Deworming Initiative': { item_name: 'Albendazole Oral Suspension', unit: 'Bottles', quantity: 100 },
            'Anti-Rabies Campaign': { item_name: 'Rabies Vaccine (Vial)', unit: 'Vials', quantity: 300 },
            'Pesticide & Pest Control': { item_name: 'Broad Spectrum Insecticide', unit: 'Liters', quantity: 50 }
          };

          const item = sampleItems[prog.name];
          if (item) {
            await supabase.from('inventory').insert([{
              ...item,
              batch_number: `BATCH-${prog.funding_year}-${Math.floor(Math.random() * 1000)}`,
              supplier: 'DA-RFO7',
              storage_location: 'Warehouse A',
              expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              program_id: newProg.id
            }]);
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-full mb-4"></div>
          <p className="text-stone-500 font-medium">Loading AgriTrace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'recipients', label: 'Recipients', icon: Users },
    { id: 'distribution', label: 'Distribution', icon: ClipboardCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans flex">
      {/* Sidebar */}
      <aside 
        className={`bg-[#141414] text-white transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-emerald-500 rounded flex-shrink-0 flex items-center justify-center">
            <TrendingUp size={20} className="text-black" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight">AgriTrace LGU</span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                view === item.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 p-3 text-stone-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold capitalize">{view}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session.user.email}</p>
              <p className="text-xs text-stone-500">LGU Administrator</p>
            </div>
            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-600">
              {session.user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {view === 'dashboard' && <Dashboard />}
              {view === 'inventory' && <Inventory />}
              {view === 'recipients' && <Recipients />}
              {view === 'distribution' && <Distribution />}
              {view === 'reports' && <Reports />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
