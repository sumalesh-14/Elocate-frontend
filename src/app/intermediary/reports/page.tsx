"use client";

import React, { useState } from "react";

interface Report {
    id: string;
    name: string;
    type: string;
    dateGenerated: string;
    status: "Ready" | "Generating" | "Failed";
    format: "PDF" | "CSV" | "Excel";
}

const ReportsPage = () => {
    // Generator State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportType, setReportType] = useState("collection-summary");
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock History Data
    const [reports, setReports] = useState<Report[]>([
        { id: "RPT-1024", name: "Jan 2026 Monthly Summary", type: "Collection Summary", dateGenerated: "2026-02-01", status: "Ready", format: "PDF" },
        { id: "RPT-1023", name: "Q4 2025 Financials", type: "Financial Statement", dateGenerated: "2026-01-15", status: "Ready", format: "Excel" },
        { id: "RPT-1022", name: "E-Waste Audit Log", type: "Environmental Impact", dateGenerated: "2026-01-10", status: "Ready", format: "CSV" },
        { id: "RPT-1021", name: "Client Activity Report", type: "Client Activity", dateGenerated: "2026-01-05", status: "Ready", format: "PDF" },
    ]);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        // Simulate generation delay
        setTimeout(() => {
            const newReport: Report = {
                id: `RPT-${Math.floor(Math.random() * 1000) + 1000}`,
                name: `${reportType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} (${startDate} - ${endDate})`,
                type: reportType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                dateGenerated: new Date().toISOString().split('T')[0],
                status: "Ready",
                format: "PDF" // Defaulting to PDF for demo
            };

            setReports([newReport, ...reports]);
            setIsGenerating(false);
        }, 1500);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Ready": return "status-completed";
            case "Generating": return "status-pending";
            case "Failed": return "status-cancelled";
            default: return "";
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Reports & Documentation</h1>
                <p>Generate and manage your operational and financial reports.</p>
            </div>

            {/* Report Generator */}
            <div className="settings-section">
                <h2 className="section-title">Generate New Report</h2>
                <form onSubmit={handleGenerate}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Report Type</label>
                            <select
                                className="form-input"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="collection-summary">Collection Summary</option>
                                <option value="financial-statement">Financial Statement</option>
                                <option value="environmental-impact">Environmental Impact</option>
                                <option value="client-activity">Client Activity</option>
                                <option value="driver-performance">Driver Performance</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date Range Start</label>
                            <input
                                type="date"
                                className="form-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date Range End</label>
                            <input
                                type="date"
                                className="form-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ justifyContent: "flex-end" }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ marginTop: "auto" }}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "Generating..." : "Generate Report"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Recent Reports Table */}
            <h2 className="section-title" style={{ marginBottom: "1rem" }}>Recent Reports</h2>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Report Name</th>
                            <th>Type</th>
                            <th>Date Generated</th>
                            <th>Format</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id}>
                                <td>
                                    <strong>{report.name}</strong>
                                    <br />
                                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>ID: {report.id}</span>
                                </td>
                                <td>{report.type}</td>
                                <td>{report.dateGenerated}</td>
                                <td>
                                    <span style={{
                                        padding: "2px 6px",
                                        background: "#f1f5f9",
                                        borderRadius: "4px",
                                        fontSize: "0.8rem",
                                        fontWeight: "600",
                                        color: "#475569"
                                    }}>
                                        {report.format}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>
                                    <a href="#" className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                        Download
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ReportsPage;
