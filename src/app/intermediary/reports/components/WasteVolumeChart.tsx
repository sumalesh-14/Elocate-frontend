"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

import { getToken } from '../../sign-in/auth';

export default function WasteVolumeChart() {
  const [data, setData] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch('/api/v1/reports/overview', { headers });
        const json = await response.json();
        if (json.success) {
          setData(json.data);
          setAggregates(json.aggregates);
        }
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/50 border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Waste Processed Over Time</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-widest">Weight in Kilograms (KG)</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Laptops</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Phones</span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Large Appliances</span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
              <Tooltip 
                cursor={{fill: '#F3F4F6', opacity: 0.4}} 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px'}}
                labelStyle={{fontWeight: 800, color: '#111827', marginBottom: '4px'}}
              />
              <Bar dataKey="whiteGoods" stackId="a" fill="#F59E0B" radius={[0, 0, 6, 6]} maxBarSize={48} />
              <Bar dataKey="phones" stackId="a" fill="#3B82F6" maxBarSize={48} />
              <Bar dataKey="laptops" stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Category Breakdown Sidebar Insights */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border flex-1 border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-max mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <p className="text-3xl font-black text-gray-900">{aggregates?.itEquipmentKg?.toLocaleString()} <span className="text-lg text-gray-400">kg</span></p>
            <p className="text-sm font-bold text-gray-500 mt-1">IT Equipment (ITEW1-5)</p>
        </div>
        <div className="bg-white border flex-1 border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-center">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-max mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18.5"/><path d="M8 14v4.5"/><path d="M8 14h8"/></svg>
            </div>
            <p className="text-3xl font-black text-gray-900">{aggregates?.whiteGoodsKg?.toLocaleString()} <span className="text-lg text-gray-400">kg</span></p>
            <p className="text-sm font-bold text-gray-500 mt-1">White Goods (CEEW1-4)</p>
        </div>
      </div>
    </div>
  );
}
