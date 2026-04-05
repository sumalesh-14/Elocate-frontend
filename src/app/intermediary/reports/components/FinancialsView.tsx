"use client";

import { useState, useEffect } from "react";
import { Loader2, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { getToken } from '../../sign-in/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialsView() {
  const [data, setData] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch('/api/v1/reports/financials', { headers });
        const json = await response.json();
        if (json.success) {
          setData(json.data);
          setAggregates(json.aggregates);
        }
      } catch (error) {
        console.error("Failed to fetch financials data:", error);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
               <DollarSign size={20} className="stroke-[2.5]" />
             </div>
             <p className="text-sm font-bold text-gray-500">Total Payouts</p>
           </div>
           <p className="text-3xl font-black text-gray-900 mt-4">${aggregates?.totalPayouts?.toLocaleString() || "0.00"}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
               <TrendingUp size={20} className="stroke-[2.5]" />
             </div>
             <p className="text-sm font-bold text-gray-500">Avg. Per Request</p>
           </div>
           <p className="text-3xl font-black text-gray-900 mt-4">${aggregates?.avgPerRequest?.toLocaleString() || "0.00"}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
               <Wallet size={20} className="stroke-[2.5]" />
             </div>
             <p className="text-sm font-bold text-gray-500">Total Escrow Volume</p>
           </div>
           <p className="text-3xl font-black text-gray-900 mt-4">${aggregates?.totalVolume?.toLocaleString() || "0.00"}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-[350px]">
         <div className="mb-6">
           <h3 className="text-lg font-black text-gray-900 tracking-tight">Payout Volume</h3>
         </div>
         <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px 16px'}}
                labelStyle={{fontWeight: 800, color: '#111827', marginBottom: '4px'}}
                formatter={(value: any) => [`$${value}`, "Payout"]}
              />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}
