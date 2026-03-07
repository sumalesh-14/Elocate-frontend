'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Users, Recycle, Battery, Activity, Clock, AlertTriangle, CheckCircle2, Leaf } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-eco-950">Dashboard Overview</h2>
          <p className="text-eco-600 mt-1">Real-time insights into the e-waste management network.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-eco-700 hover:bg-eco-50 shadow-sm transition-colors">
            Download Report
          </button>
          <button className="px-4 py-2 bg-eco-900 text-white rounded-lg text-sm font-medium shadow-lg shadow-eco-900/20 hover:bg-eco-800 transition-colors">
            System Health Check
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Recycled', value: '2,845', unit: 'tons', change: '+12.5%', isPositive: true, icon: Recycle, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Centers', value: '142', unit: 'locations', change: '+4', isPositive: true, icon: Users, color: 'bg-tech-lime/20 text-eco-700' },
          { label: 'CO2 Offset', value: '8.4', unit: 'k tons', change: '+22.1%', isPositive: true, icon: Leaf, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Approvals', value: '18', unit: 'requests', change: '-2', isPositive: false, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-eco-900">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">{stat.unit}</div>
            <div className="text-xs text-gray-400 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Simple Bar Chart Visualization (CSS) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-xl text-eco-900">Monthly Collection Trends</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-eco-900"></span>Consumer</span>
              <span className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className="w-2 h-2 rounded-full bg-tech-lime"></span>Industrial</span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 h-64 w-full">
            {[45, 70, 55, 85, 60, 95, 75, 50].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 group relative cursor-pointer">
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-eco-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  {height * 10} tons
                </div>
                <div className="w-full bg-eco-900/10 rounded-t-lg relative overflow-hidden" style={{ height: `${height}%` }}>
                  <div className="absolute bottom-0 left-0 w-full bg-eco-900 transition-all duration-500 hover:bg-eco-800" style={{ height: '60%' }}></div>
                  <div className="absolute top-0 left-0 w-full bg-tech-lime transition-all duration-500 hover:bg-lime-400" style={{ height: '40%' }}></div>
                </div>
                <div className="text-center text-xs text-gray-400 font-medium">Week {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Pulse / Live Feed */}
        <div className="bg-eco-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-tech-lime rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">Live Network</h3>
              <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-tech-lime animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-tech-lime"></span>
                LIVE
              </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { text: "New center registered in Portland, OR", time: "2m ago", type: "center" },
                { text: "Large batch (500kg) processed at EcoHub", time: "12m ago", type: "process" },
                { text: "Verified Partner Application: GreenTech Inc.", time: "45m ago", type: "alert" },
                { text: "System maintenance scheduled for 2 AM", time: "2h ago", type: "system" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="mt-1 relative">
                    <div className="w-2 h-2 rounded-full bg-tech-lime/50 group-hover:bg-tech-lime transition-colors"></div>
                    {i !== 3 && <div className="absolute top-3 left-1 w-px h-12 bg-white/10"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 leading-snug group-hover:text-white transition-colors">{item.text}</p>
                    <span className="text-xs text-eco-400/70">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs text-eco-400">System Status</div>
                <div className="text-sm font-bold text-tech-lime">99.9% Operational</div>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-tech-lime w-[98%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* E-Waste Density Map / Impact Visualizer */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-eco-900">E-Waste Density Impact Map</h3>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className="w-3 h-3 rounded-full bg-red-400"></span>High Density</span>
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className="w-3 h-3 rounded-full bg-yellow-400"></span>Medium</span>
            <span className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className="w-3 h-3 rounded-full bg-green-400"></span>Low</span>
          </div>
        </div>
        <div className="relative w-full h-96 bg-gray-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-gray-100">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            {/* Stylized region text */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-300/40 font-display text-4xl font-bold uppercase tracking-[1rem] select-none pointer-events-none">India Operations</div>

            {/* Hotspots */}
            <div className="absolute top-[30%] left-[25%] flex flex-col items-center group cursor-pointer tooltip" title="Maharashtra: 4.2k tons">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" style={{ animationDuration: '3s' }}></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 border-2 border-white shadow-md"></span>
              </span>
              <span className="mt-2 text-xs font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">Maharashtra</span>
            </div>

            <div className="absolute top-[45%] right-[30%] flex flex-col items-center group cursor-pointer tooltip" title="Bengaluru: 2.8k tons">
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" style={{ animationDuration: '2.5s' }}></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-yellow-500 border-2 border-white shadow-md"></span>
              </span>
              <span className="mt-2 text-xs font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">Karnataka</span>
            </div>

            <div className="absolute top-[20%] right-[45%] flex flex-col items-center group cursor-pointer tooltip" title="Delhi NCR: 5.1k tons">
              <span className="relative flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" style={{ animationDuration: '2s' }}></span>
                <span className="relative inline-flex rounded-full h-10 w-10 bg-red-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-md">MAX</span>
              </span>
              <span className="mt-2 text-xs font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">Delhi NCR</span>
            </div>

            <div className="absolute bottom-[20%] left-[40%] flex flex-col items-center group cursor-pointer tooltip" title="Kerala: 800 tons">
              <span className="relative flex h-4 w-4">
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border border-white shadow-md"></span>
              </span>
              <span className="mt-2 text-xs font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">Kerala</span>
            </div>

            <div className="absolute top-[60%] right-[20%] flex flex-col items-center group cursor-pointer tooltip" title="Tamil Nadu: 1.5k tons">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" style={{ animationDuration: '4s' }}></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white shadow-md"></span>
              </span>
              <span className="mt-2 text-xs font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">Tamil Nadu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-display font-bold text-xl text-eco-900">Recent Transactions</h3>
          <button className="text-sm font-medium text-eco-600 hover:text-eco-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { id: "#TRX-9822", entity: "TechCycle Solutions", date: "Oct 24, 2024", status: "Completed", amount: "1,250 kg" },
                { id: "#TRX-9821", entity: "Urban Mining Corp", date: "Oct 24, 2024", status: "Processing", amount: "840 kg" },
                { id: "#TRX-9820", entity: "Green Earth Pickup", date: "Oct 23, 2024", status: "Pending", amount: "210 kg" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm font-medium text-eco-900">{row.id}</td>
                  <td className="px-8 py-4 text-sm text-gray-600">{row.entity}</td>
                  <td className="px-8 py-4 text-sm text-gray-500">{row.date}</td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        row.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-gray-700">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
