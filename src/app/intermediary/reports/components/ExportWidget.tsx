"use client";

import { useState } from "react";
import { DownloadCloud, FileText, FileSpreadsheet, Loader2 } from "lucide-react";

import { getToken } from '../../sign-in/auth';
import { useToast } from "@/context/ToastContext";

export default function ExportWidget() {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setIsExporting(format);
    setIsOpen(false);
    
    try {
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/v1/reports/export/compliance?formatType=${format}`, { headers });
      const json = await response.json();
      
      if (json.success && json.logs) {
        
        let csvContent = "Id,Date,Code,Description,Quantity,Weight,Source,Status\n";
        json.logs.forEach((log: any) => {
          csvContent += `"${log.id}","${log.date}","${log.code}","${log.desc}",${log.qty},${log.weight},"${log.source}","${log.status}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          setIsExporting(null);
          showToast(`Report Downloaded\nSuccessfully generated report in ${format.toUpperCase()} format!`, 'success');
        }, 1200);
      } else {
        throw new Error("Export failed in mock API");
      }
    } catch (err) {
      console.error(err);
      setIsExporting(null);
      showToast("Export Failed\nAn error occurred while generating the report.", 'error');
    }
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!isExporting}
        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-900/20 px-5 py-2.5 rounded-xl shadow-md transition-all font-semibold disabled:opacity-70"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
        {isExporting ? "Exporting..." : "Export Data"}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden divide-y divide-gray-50">
            <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Format</span>
            </div>
            <button onClick={() => handleExport("pdf")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50 text-gray-700 hover:text-red-700 font-semibold text-sm transition-colors group">
              <FileText size={16} className="text-red-400 group-hover:text-red-600" /> Download as PDF
            </button>
            <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-semibold text-sm transition-colors group">
              <FileSpreadsheet size={16} className="text-emerald-400 group-hover:text-emerald-600" /> Export to CSV
            </button>
            <button onClick={() => handleExport("excel")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold text-sm transition-colors group">
              <FileSpreadsheet size={16} className="text-blue-400 group-hover:text-blue-600" /> Excel Spreadsheet
            </button>
          </div>
        </>
      )}
    </div>
  );
}
