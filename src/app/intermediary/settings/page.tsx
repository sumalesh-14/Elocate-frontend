"use client";
import { useEffect, useState } from "react";
import { getToken, handleLogout } from "../sign-in/auth";
import {
  Building2, Lock, Bell, Trash2, Loader2,
  CheckCircle2, AlertCircle, Eye, EyeOff, Phone, Mail,
  MapPin, Clock, Hash, Layers
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
      ${ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">{icon}</div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-white rounded-xl ring-1 ring-inset ring-gray-300 border-0 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400 transition";
const readonlyCls = "w-full px-4 py-3 rounded-xl ring-1 ring-inset ring-gray-200 border-0 bg-gray-50 text-sm text-gray-500 cursor-not-allowed select-none";

type FacilityState = {
  facilityName: string; ownerName: string; registrationNumber: string; operatingHours: string;
  address: string; city: string; state: string; pincode: string; capacity: string;
  latitude: string; longitude: string;
};

export default function SettingsPage() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const [profile, setProfile] = useState({ email: "", mobileNumber: "" });
  const [facility, setFacility] = useState<FacilityState>({
    facilityName: "", ownerName: "", registrationNumber: "", operatingHours: "",
    address: "", city: "", state: "", pincode: "", capacity: "",
    latitude: "", longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [facilitySaving, setFacilitySaving] = useState(false);

  const [emailStep, setEmailStep] = useState<"idle" | "otp">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [mobileStep, setMobileStep] = useState<"idle" | "otp">("idle");
  const [newMobile, setNewMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileLoading, setMobileLoading] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [notifs, setNotifs] = useState({ newRequests: true, dailySummary: true, weeklyReport: false, marketing: false });
  const [notifSaving, setNotifSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${BASE}/api/v1/profile`, { headers: authHeaders() }),
      fetch(`${BASE}/api/v1/profile/notifications`, { headers: authHeaders() }),
    ]).then(async ([pRes, nRes]) => {
      if (cancelled) return;
      if (pRes.ok) {
        const d = await pRes.json();
        const u = d.user ?? {};
        const f = d.facility ?? {};
        setProfile({ email: u.email ?? "", mobileNumber: u.mobileNumber ?? "" });
        setFacility({
          facilityName: f.facilityName ?? "",
          ownerName: u.fullName || "",
          registrationNumber: f.registrationNumber ?? "",
          operatingHours: f.operatingHours ?? "",
          address: f.address ?? "",
          city: f.city ?? "",
          state: f.state ?? "",
          pincode: f.pincode ?? "",
          capacity: f.capacity != null ? String(f.capacity) : "",
          latitude: f.latitude != null ? String(f.latitude) : "",
          longitude: f.longitude != null ? String(f.longitude) : "",
        });
      }
      if (nRes.ok) setNotifs(await nRes.json());
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const saveFacility = async () => {
    setFacilitySaving(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/facility`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({
          facilityName: facility.facilityName,
          ownerName: facility.ownerName,
          operatingHours: facility.operatingHours,
          address: facility.address,
          city: facility.city,
          state: facility.state,
          pincode: facility.pincode,
          capacity: facility.capacity ? parseInt(facility.capacity) : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed to save");
      showToast("Facility profile updated");
    } catch (e: any) { showToast(e.message, false); }
    finally { setFacilitySaving(false); }
  };

  const requestEmailChange = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/change-email-request?newEmail=${encodeURIComponent(newEmail)}`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed");
      setEmailStep("otp"); showToast("OTP sent to new email address");
    } catch (e: any) { showToast(e.message, false); }
    finally { setEmailLoading(false); }
  };

  const verifyEmailChange = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/verify-email-change?newEmail=${encodeURIComponent(newEmail)}&otp=${emailOtp}`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed");
      setProfile(p => ({ ...p, email: newEmail }));
      setEmailStep("idle"); setNewEmail(""); setEmailOtp("");
      showToast("Email updated successfully");
    } catch (e: any) { showToast(e.message, false); }
    finally { setEmailLoading(false); }
  };

  const requestMobileChange = async () => {
    setMobileLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/change-mobile-request?newMobile=${encodeURIComponent(newMobile)}`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed");
      setMobileStep("otp"); showToast("OTP sent to your registered email");
    } catch (e: any) { showToast(e.message, false); }
    finally { setMobileLoading(false); }
  };

  const verifyMobileChange = async () => {
    setMobileLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/verify-mobile-change?newMobile=${encodeURIComponent(newMobile)}&otp=${mobileOtp}`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed");
      setProfile(p => ({ ...p, mobileNumber: newMobile }));
      setMobileStep("idle"); setNewMobile(""); setMobileOtp("");
      showToast("Mobile number updated successfully");
    } catch (e: any) { showToast(e.message, false); }
    finally { setMobileLoading(false); }
  };

  const changePassword = async () => {
    if (pwd.newPassword !== pwd.confirm) { showToast("Passwords do not match", false); return; }
    if (pwd.newPassword.length < 8) { showToast("Password must be at least 8 characters", false); return; }
    setPwdLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/change-password`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      showToast("Password reset email sent to your inbox");
    } catch (e: any) { showToast(e.message, false); }
    finally { setPwdLoading(false); }
  };

  const saveNotifs = async () => {
    setNotifSaving(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/notifications`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify(notifs),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Notification preferences saved");
    } catch (e: any) { showToast(e.message, false); }
    finally { setNotifSaving(false); }
  };

  const deleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/profile/delete-account`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json()).message ?? "Failed");
      showToast("Account deactivated. Logging out...");
      setTimeout(() => handleLogout(), 2000);
    } catch (e: any) { showToast(e.message, false); }
    finally { setDeleteLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  const fld = (key: keyof FacilityState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFacility(f => ({ ...f, [key]: e.target.value ?? "" }));

  return (
    <div className="space-y-6 w-full pb-8">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your facility, security, and preferences</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* ── Facility Profile ── */}
          <Section title="Facility Profile" icon={<Building2 size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Field label="Owner Name">
                <input className={inputCls} value={facility.ownerName} onChange={fld("ownerName")} placeholder="Full name of the owner" />
              </Field>

              <Field label="Facility Name">
                <input className={inputCls} value={facility.facilityName} onChange={fld("facilityName")} placeholder="e.g. Green Cycle Hub" />
              </Field>

              <Field label="Registration Number" hint="Issued by the regulatory authority — read only">
                <input className={readonlyCls} value={facility.registrationNumber} readOnly />
              </Field>

              <Field label="Operating Hours">
                <div className="relative">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input className={inputCls + " pl-9"} value={facility.operatingHours} onChange={fld("operatingHours")} placeholder="e.g. Mon–Sat 9AM–6PM" />
                </div>
              </Field>

              <Field label="Capacity (units/month)">
                <div className="relative">
                  <Layers size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input className={inputCls + " pl-9"} type="number" min={0} value={facility.capacity} onChange={fld("capacity")} placeholder="e.g. 1000" />
                </div>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Street Address">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input className={inputCls + " pl-9"} value={facility.address} onChange={fld("address")} placeholder="Street / locality" />
                  </div>
                </Field>
              </div>

              <Field label="City">
                <input className={inputCls} value={facility.city} onChange={fld("city")} placeholder="City" />
              </Field>

              <Field label="State">
                <input className={inputCls} value={facility.state} onChange={fld("state")} placeholder="State" />
              </Field>

              <Field label="Pincode">
                <input className={inputCls} value={facility.pincode} onChange={fld("pincode")} maxLength={6} placeholder="6-digit pincode" />
              </Field>

              <Field label="Latitude" hint="Auto-set during registration">
                <input className={readonlyCls} value={facility.latitude} readOnly />
              </Field>

              <Field label="Longitude" hint="Auto-set during registration">
                <input className={readonlyCls} value={facility.longitude} readOnly />
              </Field>

            </div>
            <div className="flex justify-end mt-5">
              <button onClick={saveFacility} disabled={facilitySaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {facilitySaving && <Loader2 size={14} className="animate-spin" />} Save Facility
              </button>
            </div>
          </Section>

          {/* ── Notification Preferences ── */}
          <Section title="Notification Preferences" icon={<Bell size={18} />}>
            <div className="space-y-1">
              {([
                { key: "newRequests",  label: "New Collection Requests",    desc: "Get notified when a new request comes in" },
                { key: "dailySummary", label: "Daily Summary",              desc: "Daily email with scheduled pickups" },
                { key: "weeklyReport", label: "Weekly Performance Report",  desc: "Weekly revenue and collection stats" },
                { key: "marketing",    label: "Marketing & Updates",        desc: "Product news and feature announcements" },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${notifs[key] ? "bg-emerald-500" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[key] ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={saveNotifs} disabled={notifSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {notifSaving && <Loader2 size={14} className="animate-spin" />} Save Preferences
              </button>
            </div>
          </Section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

          {/* ── Change Email ── */}
          <Section title="Change Email" icon={<Mail size={18} />}>
            <p className="text-sm text-gray-500 mb-4">
              Current: <span className="font-semibold text-gray-800">{profile.email}</span>
            </p>
            {emailStep === "idle" ? (
              <div className="flex gap-3">
                <input className={inputCls} type="email" placeholder="New email address" value={newEmail}
                  onChange={e => setNewEmail(e.target.value)} />
                <button onClick={requestEmailChange} disabled={emailLoading || !newEmail}
                  className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
                  {emailLoading && <Loader2 size={14} className="animate-spin" />} Send OTP
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  OTP sent to <strong>{newEmail}</strong>
                </p>
                <div className="flex gap-3">
                  <input className={inputCls} placeholder="6-digit OTP" value={emailOtp} maxLength={6}
                    onChange={e => setEmailOtp(e.target.value)} />
                  <button onClick={verifyEmailChange} disabled={emailLoading || emailOtp.length < 6}
                    className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
                    {emailLoading && <Loader2 size={14} className="animate-spin" />} Verify
                  </button>
                  <button onClick={() => { setEmailStep("idle"); setEmailOtp(""); }}
                    className="shrink-0 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* ── Change Mobile ── */}
          <Section title="Change Mobile Number" icon={<Phone size={18} />}>
            <p className="text-sm text-gray-500 mb-4">
              Current: <span className="font-semibold text-gray-800">{profile.mobileNumber || "—"}</span>
            </p>
            {mobileStep === "idle" ? (
              <div className="flex gap-3">
                <input className={inputCls} type="tel" placeholder="New mobile number" value={newMobile}
                  onChange={e => setNewMobile(e.target.value)} />
                <button onClick={requestMobileChange} disabled={mobileLoading || !newMobile}
                  className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
                  {mobileLoading && <Loader2 size={14} className="animate-spin" />} Send OTP
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  OTP sent to your registered email
                </p>
                <div className="flex gap-3">
                  <input className={inputCls} placeholder="6-digit OTP" value={mobileOtp} maxLength={6}
                    onChange={e => setMobileOtp(e.target.value)} />
                  <button onClick={verifyMobileChange} disabled={mobileLoading || mobileOtp.length < 6}
                    className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
                    {mobileLoading && <Loader2 size={14} className="animate-spin" />} Verify
                  </button>
                  <button onClick={() => { setMobileStep("idle"); setMobileOtp(""); }}
                    className="shrink-0 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* ── Security ── */}
          <Section title="Security" icon={<Lock size={18} />}>
            <div className="space-y-4">
              {(["current", "new", "confirm"] as const).map(f => (
                <Field key={f} label={f === "current" ? "Current Password" : f === "new" ? "New Password" : "Confirm New Password"}>
                  <div className="relative">
                    <input
                      type={showPwd[f] ? "text" : "password"}
                      className={inputCls + " pr-10"}
                      placeholder="••••••••"
                      value={f === "current" ? pwd.currentPassword : f === "new" ? pwd.newPassword : pwd.confirm}
                      onChange={e => setPwd(p => ({
                        ...p,
                        [f === "current" ? "currentPassword" : f === "new" ? "newPassword" : "confirm"]: e.target.value
                      }))}
                    />
                    <button type="button" onClick={() => setShowPwd(s => ({ ...s, [f]: !s[f] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd[f] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={changePassword}
                disabled={pwdLoading || !pwd.currentPassword || !pwd.newPassword || !pwd.confirm}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                {pwdLoading && <Loader2 size={14} className="animate-spin" />} Change Password
              </button>
            </div>
          </Section>

          {/* ── Danger Zone ── */}
          <Section title="Danger Zone" icon={<Trash2 size={18} />}>
            <p className="text-sm text-gray-500 mb-4">
              Deactivating your account will disable your facility and prevent new requests. Reversible by contacting support.
            </p>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-semibold transition">
                Deactivate Account
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 flex-1">Are you sure? This will deactivate your account and facility.</p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={deleteAccount} disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                    {deleteLoading && <Loader2 size={14} className="animate-spin" />} Yes, Deactivate
                  </button>
                  <button onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-white transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}
