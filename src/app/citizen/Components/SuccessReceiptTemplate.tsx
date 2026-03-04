import React from "react";
import { ShieldCheck, Calendar, Clock, MapPin, Phone, Mail, User, CheckCircle2, Leaf, Recycle, Info, AlertTriangle } from "lucide-react";

interface ReceiptProps {
    id: string;
    formData: any;
    userName: string;
    date: string;
}

const SuccessReceiptTemplate: React.FC<ReceiptProps> = ({ id, formData, userName, date }) => {
    return (
        <div
            id="receipt-download-template"
            className="bg-white p-16 text-slate-900 border border-slate-200 w-[794px] mx-auto overflow-hidden font-sans flex flex-col"
            style={{ height: '1123px' }}
        >
            {/* Header Section */}
            <div className="flex justify-between items-center border-b-4 border-emerald-500 pb-8 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-slate-900">ELOCATE</h1>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.4em] mt-1.5 ml-0.5">Sustainability Bureau</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-900 leading-none mb-3 uppercase tracking-tight">Receipt</h2>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reference ID</p>
                        <p className="text-xs font-bold text-slate-900 leading-none pb-2">#{id || 'ELC-772910-X'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Issue Date</p>
                        <p className="text-xs font-bold text-slate-900 leading-none">{date}</p>
                    </div>
                </div>
            </div>

            {/* Content Wrapper */}
            <div className="flex-1">
                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    {/* Citizen Col */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <User size={14} className="text-emerald-600" />
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Citizen Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 pl-1">
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Full Name</span>
                                <p className="text-sm font-bold text-slate-900">{userName}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Email</span>
                                    <p className="text-[11px] text-slate-600 font-bold">{formData.contactEmail}</p>
                                </div>
                                <div className="flex-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Phone</span>
                                    <p className="text-[11px] text-slate-600 font-bold">{formData.contactPhone}</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Primary Location</span>
                                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                                    {formData.address || 'Registered System Address'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Service Col */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Logistics & Service</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 pl-1">
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Service Mode</span>
                                    <p className="text-sm font-black text-slate-900">{formData.serviceType?.toUpperCase()}</p>
                                </div>
                                <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-md flex items-center justify-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest leading-none">Confirmed</p>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Fulfillment Details</span>
                                <div className="space-y-1.5">
                                    {formData.serviceType === 'Pickup' ? (
                                        <div className="flex gap-3">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-600 border border-slate-100">
                                                <Calendar size={12} /> {formData.pickupDate}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-600 border border-slate-100">
                                                <Clock size={12} /> {formData.pickupTime}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{formData.facilityName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="mb-10">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="text-left bg-slate-900 text-white rounded-tl-xl px-6 py-4 text-[11px] font-black uppercase tracking-widest">Item Specification</th>
                                <th className="text-center bg-slate-900 text-white px-6 py-4 text-[11px] font-black uppercase tracking-widest">Quality Grading</th>
                                <th className="text-right bg-slate-900 text-white rounded-tr-xl px-6 py-4 text-[11px] font-black uppercase tracking-widest w-24">Unit Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white border-x border-b border-slate-200">
                            <tr>
                                <td className="px-6 py-8">
                                    <p className="text-lg font-black text-slate-900 mb-1">{formData.brand} {formData.model}</p>
                                    <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Type: {formData.deviceType}
                                    </div>
                                </td>
                                <td className="px-6 py-8 text-center">
                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest inline-flex items-center justify-center leading-none">
                                    {formData.condition}
                                </span>
                                </td>
                                <td className="px-6 py-8 text-right">
                                    <p className="text-2xl font-black text-slate-900">{formData.quantity.toString().padStart(2, '0')}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Technical Report & Educational Content */}
                <div className="grid grid-cols-2 gap-10 mb-10">
                    <div className="space-y-6">
                        <section>
                            <div className="flex items-center gap-2 mb-3 h-4">
                                <Info size={14} className="text-emerald-600 shrink-0" />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Technical Notes</h3>
                            </div>
                            <div className="p-4 bg-slate-50 border-l-4 border-emerald-500 rounded-sm italic">
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {formData.notes ? `"${formData.notes}"` : "No additional diagnostics recorded at time of surrender."}
                                </p>
                            </div>
                        </section>

                        <section className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <Leaf size={60} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Eco Performance</h3>
                            <p className="text-[11px] font-medium leading-relaxed opacity-90">
                                This submission prevents approximately <span className="font-black">2.4kg of CO2</span> from entering the atmosphere. By recycling, you've recovered precious rare-earth metals that would otherwise require destructive mining.
                            </p>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <div className="flex items-center gap-2 mb-3 h-4">
                                <Recycle size={14} className="text-emerald-600 shrink-0" />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Environmental Impact Guidance</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                        <span className="text-xs font-black text-emerald-600">01</span>
                                    </div>
                                    <div className="text-[11px]">
                                        <p className="font-black text-slate-900 uppercase">Total Erasure</p>
                                        <p className="text-slate-500">Your device will undergo NIST 800-88 standard data destruction to ensure privacy.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                        <span className="text-xs font-black text-emerald-600">02</span>
                                    </div>
                                    <div className="text-[11px]">
                                        <p className="font-black text-slate-900 uppercase">Resource Recovery</p>
                                        <p className="text-slate-500">Up to 98% of the materials in this device are recoverable for future circular manufacturing.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="p-4 border border-amber-100 bg-amber-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1.5 text-amber-700">
                                <AlertTriangle size={14} />
                                <h3 className="text-[9px] font-black uppercase tracking-widest">Legal Disclaimer</h3>
                            </div>
                            <p className="text-[9px] text-amber-600 leading-relaxed font-bold">
                                Surrender of equipment is final. ELocate is not responsible for data loss. All property rights are transferred to ELocate Logistics upon confirmation of this receipt.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Signature Area */}
            <div className="mt-auto border-t-2 border-slate-900 pt-8 grid grid-cols-2 items-end">
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Official Certification</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-[340px]">
                        This document serves as legal evidence of physical surrender. The ELocate Sustainability Bureau hereby validates that the logistics chain for this item is fully authenticated and compliant with National E-Waste Regulations (2025).
                    </p>
                </div>
                <div className="flex flex-col items-end gap-6 h-full justify-end pb-2">
                    <div className="text-right mb-4">
                        <div className="font-serif italic text-2xl text-slate-400 mb-[-10px] opacity-40 select-none pr-4">Logistics Bureau</div>
                        <p className="text-sm font-black text-slate-900 border-b-2 border-emerald-500 pb-1 inline-block">Logistics Liaison Officer</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Electronic Signature Verified</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm relative group overflow-visible">
                        <div className="text-right pr-3 border-r border-slate-200">
                            <span className="text-[8px] font-black text-slate-400 uppercase block leading-none mb-1">System ID</span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none">SECURE-ELC-PRM</span>
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                                <ShieldCheck size={18} strokeWidth={3} />
                            </div>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Verified 100%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Brand */}
            <div className="mt-10 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] border-t border-slate-50 pt-4">
                <span>ELocate Global v1.2</span>
                <span className="text-emerald-600">RECYCLE WITH PURPOSE</span>
            </div>
        </div>
    );
};

export default SuccessReceiptTemplate;
