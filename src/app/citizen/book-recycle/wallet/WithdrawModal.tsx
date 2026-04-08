"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { getToken } from "@/app/citizen/sign-in/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Props {
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const empty = {
  amount: "", accountHolderName: "", mobileNumber: "",
  accountNumber: "", bankName: "", ifscCode: "", upiId: "", email: "",
};

export default function WithdrawModal({ availableBalance, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt)) e.amount = "Enter a valid amount";
    else if (amt < 100) e.amount = "Minimum ₹100";
    else if (amt > availableBalance) e.amount = "Exceeds balance";
    if (!form.accountHolderName.trim()) e.accountHolderName = "Required";
    if (!/^[0-9]{10}$/.test(form.mobileNumber)) e.mobileNumber = "10 digits required";
    if (!/^[0-9]{9,18}$/.test(form.accountNumber)) e.accountNumber = "Invalid";
    if (!form.bankName.trim()) e.bankName = "Required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.toUpperCase())) e.ifscCode = "e.g. HDFC0001234";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/v1/citizen/withdrawal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          accountHolderName: form.accountHolderName,
          mobileNumber: form.mobileNumber,
          accountNumber: form.accountNumber,
          bankName: form.bankName,
          ifscCode: form.ifscCode.toUpperCase(),
          upiId: form.upiId || null,
          email: form.email || null,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2400);
    } catch (e: any) {
      setErrors({ submit: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modal = (
    // Full viewport overlay — rendered into document.body via portal so it covers everything
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(10, 20, 15, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: "min(900px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 48px)",
          background: "#f4fbf5",
          borderRadius: "1.75rem",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: "2rem 2.5rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", fontFamily: "'Manrope', sans-serif", margin: 0 }}>
              Withdraw Funds
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Transfer your balance securely to your verified bank account.
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "4px", marginTop: "2px" }}>
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1rem" }}>
            <div style={{ width: 64, height: 64, background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={36} color="#059669" />
            </div>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", fontFamily: "'Manrope', sans-serif" }}>Request Submitted!</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center", maxWidth: 320 }}>
              Your withdrawal is pending review. You'll be notified once it's processed.
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "0 2.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Amount card */}
              <div style={{ background: "#e8f5ee", borderRadius: "1.25rem", padding: "1.75rem 2rem" }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1rem" }}>
                  Withdrawal Amount
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" }}>
                  {/* Big input */}
                  <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "3rem", fontWeight: 700, color: "#065f46", marginRight: "0.5rem", fontFamily: "'Manrope', sans-serif", lineHeight: 1 }}>₹</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={e => set("amount", e.target.value)}
                      placeholder="0.00"
                      style={{
                        flex: 1, background: "transparent", border: "none", outline: "none",
                        fontSize: "3.5rem", fontWeight: 800, color: "#111827",
                        fontFamily: "'Manrope', sans-serif", lineHeight: 1,
                        minWidth: 0,
                      }}
                    />
                  </div>
                  {/* Right controls */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#065f46", background: "#bbf7d0", padding: "0.3rem 0.75rem", borderRadius: "9999px" }}>
                      ℹ Minimum ₹100
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[500, 1000].map(v => (
                        <button key={v} onClick={() => set("amount", String(v))}
                          style={{ padding: "0.35rem 1rem", borderRadius: "9999px", background: "white", border: "1px solid #d1d5db", fontSize: "0.8rem", fontWeight: 700, color: "#374151", cursor: "pointer" }}>
                          ₹{v}
                        </button>
                      ))}
                      <button onClick={() => set("amount", String(availableBalance))}
                        style={{ padding: "0.35rem 1rem", borderRadius: "9999px", background: "white", border: "1px solid #d1d5db", fontSize: "0.8rem", fontWeight: 700, color: "#374151", cursor: "pointer" }}>
                        Max
                      </button>
                    </div>
                  </div>
                </div>
                {errors.amount && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.5rem" }}>{errors.amount}</p>}
              </div>

              {/* Bank details */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", padding: "0 0.25rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", fontFamily: "'Manrope', sans-serif", margin: 0 }}>Bank Account Details</h2>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Secure 256-bit Encryption</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <BF label="Account Holder Name" value={form.accountHolderName} onChange={v => set("accountHolderName", v)} placeholder="Enter Full Legal Name" error={errors.accountHolderName} />
                  </div>
                  <BF label="Mobile Number" value={form.mobileNumber} onChange={v => set("mobileNumber", v)} placeholder="+91 00000 00000" error={errors.mobileNumber} type="tel" />
                  <div style={{ gridColumn: "span 3" }}>
                    <BF label="Account Number" value={form.accountNumber} onChange={v => set("accountNumber", v)} placeholder="0000 0000 0000 0000" error={errors.accountNumber} />
                  </div>
                  <BF label="Bank Name" value={form.bankName} onChange={v => set("bankName", v)} placeholder="e.g. HDFC Bank" error={errors.bankName} />
                  <BF label="IFSC Code" value={form.ifscCode} onChange={v => set("ifscCode", v.toUpperCase())} placeholder="HDFC0001234" error={errors.ifscCode} />
                </div>
              </div>

              {/* Optional */}
              <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                <div style={{ width: "220px", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", fontFamily: "'Manrope', sans-serif", marginBottom: "0.35rem" }}>Optional Channels</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.5 }}>Add these for real-time notifications and alternative settlement routes.</p>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <BF label="UPI ID (Optional)" value={form.upiId} onChange={v => set("upiId", v)} placeholder="username@bank" />
                  <BF label="Email Address (Optional)" value={form.email} onChange={v => set("email", v)} placeholder="notifications@example.com" type="email" />
                </div>
              </div>

              {/* Security */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <ShieldCheck size={16} color="#059669" />
                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Your funds are protected by end-to-end security protocols.</p>
              </div>

              {errors.submit && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#dc2626", textAlign: "center" }}>
                  {errors.submit}
                </div>
              )}
            </div>

            {/* CTA */}
            <div style={{ padding: "1rem 2.5rem 2rem", flexShrink: 0 }}>
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                  padding: "1.1rem", borderRadius: "1rem", border: "none", cursor: loading ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #006c4d 0%, #12b786 100%)",
                  boxShadow: "0 16px 40px -8px rgba(0,108,77,0.4)",
                  color: "white", fontSize: "1rem", fontWeight: 700,
                  fontFamily: "'Manrope', sans-serif",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.2s",
                }}
              >
                {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {loading ? "Submitting..." : "Submit Withdrawal Request"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function BF({ label, value, onChange, placeholder, error, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; type?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem", marginLeft: "0.25rem" }}>
        {label}
      </label>
      <div style={{
        background: error ? "#fef2f2" : "rgba(229,231,235,0.5)", borderRadius: "0.75rem",
        padding: "0.75rem 1rem",
        outline: error ? "2px solid #fca5a5" : "none",
        transition: "all 0.15s",
      }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}
        />
      </div>
      {error && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.25rem", marginLeft: "0.25rem" }}>{error}</p>}
    </div>
  );
}
