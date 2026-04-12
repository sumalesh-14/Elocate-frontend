"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { getUserID } from "../../intermediary/sign-in/auth";
import { deviceCategoriesApi, deviceModelsApi, recycleRequestApi } from "@/lib/admin-api";
import { categoryBrandApi } from "@/lib/category-brand-api";
import { useToast } from "@/context/ToastContext";

const SearchableSelect: React.FC<{
    label: string;
    options: { id: string; name: string }[];
    value: string;
    onChange: (id: string, name: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder: string;
    required?: boolean;
}> = ({ label, options, value, onChange, isLoading, disabled, placeholder, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const filtered = options.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const selected = options.find(o => o.id === value);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div className="form-group" ref={ref} style={{ position: "relative" }}>
            <label className="form-label">{label}{required && " *"}</label>
            <div
                onClick={() => !disabled && !isLoading && setIsOpen(o => !o)}
                className="form-input"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: disabled || isLoading ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, userSelect: "none" }}
            >
                <span style={{ color: selected ? "inherit" : "#9ca3af" }}>
                    {isLoading ? "Loading..." : selected ? selected.name : placeholder}
                </span>
                {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />}
            </div>
            {isOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.12)", marginTop: 4, overflow: "hidden" }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid #f3f4f6", position: "relative" }}>
                        <Search size={14} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                        <input autoFocus type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="form-input" style={{ paddingLeft: "2rem", paddingTop: 6, paddingBottom: 6, fontSize: "0.85rem" }} />
                    </div>
                    <div style={{ maxHeight: 200, overflowY: "auto" }}>
                        {filtered.length > 0 ? filtered.map(opt => (
                            <div key={opt.id}
                                onClick={() => { onChange(opt.id, opt.name); setIsOpen(false); setSearchTerm(""); }}
                                style={{ padding: "10px 16px", cursor: "pointer", fontSize: "0.9rem", background: opt.id === value ? "#f0fdf4" : "transparent", color: opt.id === value ? "#16a34a" : "#374151", fontWeight: opt.id === value ? 600 : 400 }}
                                onMouseEnter={e => { if (opt.id !== value) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                                onMouseLeave={e => { if (opt.id !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >{opt.name}</div>
                        )) : <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>No results found</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

const SchedulePickupPage = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cascading dropdown data
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
    const [models, setModels] = useState<{ id: string; name: string }[]>([]);
    const [loadingCats, setLoadingCats] = useState(false);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);

    // Selected device
    const [categoryId, setCategoryId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [modelId, setModelId] = useState("");

    // Form fields
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [stateVal, setStateVal] = useState("");
    const [pincode, setPincode] = useState("");
    const [condition, setCondition] = useState("GOOD");
    const [quantity, setQuantity] = useState(1);
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [notes, setNotes] = useState("");

    const today = new Date().toISOString().split("T")[0];

    const timeSlots = ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "01:00 PM - 03:00 PM", "03:00 PM - 05:00 PM", "05:00 PM - 07:00 PM"];
    const conditions = [{ value: "EXCELLENT", label: "Working" }, { value: "GOOD", label: "Minor Issues" }, { value: "FAIR", label: "Broken" }, { value: "POOR", label: "Parts Only" }];

    // Load categories
    useEffect(() => {
        setLoadingCats(true);
        deviceCategoriesApi.getAll({ size: 100 })
            .then(res => {
                const list = res.data?.content || res.data || [];
                setCategories(list.map((c: any) => ({ id: c.id, name: c.name })));
            })
            .catch(() => showToast("Failed to load categories", "error"))
            .finally(() => setLoadingCats(false));
    }, []);

    // Load brands when category changes
    useEffect(() => {
        if (!categoryId) { setBrands([]); setBrandId(""); setModels([]); setModelId(""); return; }
        setLoadingBrands(true);
        setBrandId(""); setModels([]); setModelId("");
        categoryBrandApi.getBrandsByCategory(categoryId, 0, 100)
            .then(res => {
                const list = res.data?.content || res.data || [];
                setBrands(list.map((b: any) => ({ id: b.brand?.id || b.id, name: b.brand?.name || b.name })));
            })
            .catch(() => showToast("Failed to load brands", "error"))
            .finally(() => setLoadingBrands(false));
    }, [categoryId]);

    // Load models when brand changes
    useEffect(() => {
        if (!brandId || !categoryId) { setModels([]); setModelId(""); return; }
        setLoadingModels(true);
        setModelId("");
        deviceModelsApi.getAll({ categoryId, brandId, size: 100 })
            .then(res => {
                const list = res.data?.content || res.data || [];
                setModels(list.map((m: any) => ({ id: m.id, name: m.modelName || m.name })));
            })
            .catch(() => showToast("Failed to load models", "error"))
            .finally(() => setLoadingModels(false));
    }, [brandId, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modelId) { showToast("Please select a device model", "error"); return; }

        const userId = getUserID();
        if (!userId) { showToast("Not authenticated", "error"); router.push("/intermediary/sign-in"); return; }

        setIsSubmitting(true);
        try {
            const payload = {
                deviceModelId: modelId,
                conditionCode: condition,
                fulfillmentType: "PICKUP",
                facilityId: null,
                pickupAddressId: null,
                notes: notes || `Scheduled by intermediary. Customer: ${customerName}. Qty: ${quantity}. Slot: ${pickupTime}`,
                address,
                city,
                state: stateVal,
                pincode,
                latitude: null,
                longitude: null,
            };
            await recycleRequestApi.create(userId, payload);
            showToast("Pickup scheduled successfully!", "success");
            router.push("/intermediary/collections");
        } catch (error: any) {
            showToast(error?.response?.data?.message || "Failed to schedule pickup", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Schedule Pickup</h1>
                <p>Manually schedule a waste pickup for a client.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Customer Information */}
                <div className="settings-section">
                    <h2 className="section-title">Customer Information</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Customer Name *</label>
                            <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="form-input" placeholder="Enter full name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <input type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="form-input" placeholder="+91 98765 43210" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="form-input" placeholder="customer@example.com" />
                        </div>
                    </div>
                    <div className="form-grid" style={{ marginTop: "1rem" }}>
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Pickup Address *</label>
                            <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="form-input" placeholder="Street address, Apt, Suite" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City *</label>
                            <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="form-input" placeholder="City" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State *</label>
                            <input type="text" required value={stateVal} onChange={e => setStateVal(e.target.value)} className="form-input" placeholder="State" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pincode *</label>
                            <input type="text" required value={pincode} onChange={e => setPincode(e.target.value)} className="form-input" placeholder="560001" />
                        </div>
                    </div>
                </div>

                {/* Device Details */}
                <div className="settings-section">
                    <h2 className="section-title">Device Details</h2>
                    <div className="form-grid">
                        <SearchableSelect
                            label="Category" required
                            options={categories} value={categoryId}
                            onChange={(id, name) => { setCategoryId(id); }}
                            isLoading={loadingCats} placeholder="Select Category"
                        />
                        <SearchableSelect
                            label="Brand" required
                            options={brands} value={brandId}
                            onChange={(id) => setBrandId(id)}
                            isLoading={loadingBrands} disabled={!categoryId}
                            placeholder={!categoryId ? "Select category first" : "Select Brand"}
                        />
                        <SearchableSelect
                            label="Model" required
                            options={models} value={modelId}
                            onChange={(id) => setModelId(id)}
                            isLoading={loadingModels} disabled={!brandId}
                            placeholder={!brandId ? "Select brand first" : "Select Model"}
                        />
                        <div className="form-group">
                            <label className="form-label">Condition *</label>
                            <select required value={condition} onChange={e => setCondition(e.target.value)} className="form-input">
                                {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Quantity</label>
                            <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="form-input" />
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="settings-section">
                    <h2 className="section-title">Schedule Pickup</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Pickup Date *</label>
                            <input type="date" required min={today} value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time Slot *</label>
                            <select required value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="form-input">
                                <option value="">Select Time Slot</option>
                                {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: "1.5rem" }}>
                        <label className="form-label">Additional Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-input" rows={3} placeholder="Gate code, special instructions, etc." />
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Scheduling..." : "Confirm Pickup"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default SchedulePickupPage;
