"use client";

import { useState, useEffect } from "react";
import { Loader2, UserCheck, Truck, ShieldAlert } from "lucide-react";
import { getToken } from '../../sign-in/auth';

export default function DriverStatsView() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch('/api/v1/reports/drivers', { headers });
        const json = await response.json();
        if (json.success) {
          setDrivers(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch drivers data:", error);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drivers.map((d, i) => (
        <div key={i} className="bg-white border flex flex-col border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-bold text-lg rounded-full flex flex-col items-center justify-center">
                {d.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-black text-gray-900">{d.name}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{d.vehicleType}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${d.availability === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${d.availability === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {d.availability}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><Truck size={14}/> Total Pickups</p>
              <p className="text-xl font-black text-gray-900">{d.totalPickups}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5"><ShieldAlert size={14}/> Success Rate</p>
              <p className="text-xl font-black text-gray-900">{d.successRate}%</p>
            </div>
          </div>
        </div>
      ))}
      
      {drivers.length === 0 && (
         <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
           <p className="text-gray-500 font-bold">No driver statistics available.</p>
         </div>
      )}
    </div>
  );
}
