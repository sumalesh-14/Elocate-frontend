"use client";

export default function Page() {
    return (
        <>
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back! Here's an overview of your E-Waste management system.</p>
            </div>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">📱</div>
                    <div className="stat-value">24</div>
                    <div className="stat-label">Device Categories</div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-value">156</div>
                    <div className="stat-label">Device Brands</div>
                </div>

                <div className="stat-card yellow">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">892</div>
                    <div className="stat-label">Device Models</div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-icon">♻️</div>
                    <div className="stat-value">2.4K</div>
                    <div className="stat-label">Recycled Devices</div>
                </div>
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1e293b" }}>Quick Actions</h2>
                <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                    Manage your e-waste device database efficiently. Use the sidebar to navigate to different sections.
                </p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <a href="/admin/device-categories" className="btn btn-primary">Manage Categories</a>
                    <a href="/admin/device-brands" className="btn btn-primary">Manage Brands</a>
                    <a href="/admin/device-models" className="btn btn-primary">Manage Models</a>
                </div>
            </div>
        </>
    );
}
