"use client";

import React, { useState } from "react";

// ---------------------------------------------------------------------------
// Path label maps — scoped per role
// ---------------------------------------------------------------------------

export const CITIZEN_PATH_LABELS: Record<string, string> = {
    "/citizen": "Citizen Home",
    "/citizen/sign-in": "Sign In",
    "/citizen/about": "About",
    "/citizen/analyze": "Analyze Device",
    "/citizen/book-recycle": "Book Recycle",
    "/citizen/book-recycle/new": "New Request",
    "/citizen/book-recycle/requests": "My Requests",
    "/citizen/book-recycle/settings": "Settings",
    "/citizen/e-facilities": "Find Facilities",
    "/citizen/education": "Education Lab",
    "/citizen/rules": "Recycling Rules",
    "/citizen/support": "Support",
    "/citizen/contactus": "Contact Us",
    "/citizen/profile": "My Profile",
    "/citizen/profile/edit-profile": "Edit Profile",
    "/citizen/profile/settings": "Profile Settings",
    "/citizen/privacypolicy": "Privacy Policy",
    "/citizen/termsandservices": "Terms of Service",
};

export const INTERMEDIARY_PATH_LABELS: Record<string, string> = {
    "/intermediary": "Intermediary Portal",
    "/intermediary/sign-in": "Sign In",
    "/intermediary/dashboard": "Dashboard",
    "/intermediary/collections": "Collections",
    "/intermediary/clients": "Clients",
    "/intermediary/assign-drivers": "Assign Drivers",
    "/intermediary/schedule": "Schedule",
    "/intermediary/reports": "Reports",
    "/intermediary/transactions": "Transactions",
    "/intermediary/withdrawals": "Withdrawals",
    "/intermediary/settings": "Settings",
};

// ---------------------------------------------------------------------------
// Inline markdown renderer — shared by both widgets
// ---------------------------------------------------------------------------

export const renderInline = (
    raw: string,
    keyPrefix: string,
    pathLabels: Record<string, string>,
    pillClassName: string
): React.ReactNode[] => {
    // Split on **bold**, `code`, and [text](url) markdown links
    const parts = raw.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
    return parts.map((part, j) => {
        const key = `${keyPrefix}-${j}`;

        // **bold**
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>;
        }

        // [label](url) — external link, opens in new tab
        const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (linkMatch) {
            return (
                <a
                    key={key}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-2 text-[1.3rem] font-medium transition-colors"
                >
                    ⬇ {linkMatch[1]}
                </a>
            );
        }

        // `code` or `/path` pill
        if (part.startsWith("`") && part.endsWith("`")) {
            const inner = part.slice(1, -1);
            if (inner.startsWith("/")) {
                const label =
                    pathLabels[inner] ||
                    inner.split("/").filter(Boolean).pop() ||
                    inner;
                return (
                    <a
                        key={key}
                        href={inner}
                        className={pillClassName}
                        style={{ display: "inline-block", margin: "0 4px", whiteSpace: "nowrap" }}
                    >
                        → {label}
                    </a>
                );
            }
            return (
                <code key={key} className="bg-opacity-20 px-1 rounded text-[1.3rem] font-mono">
                    {inner}
                </code>
            );
        }
        return <React.Fragment key={key}>{part}</React.Fragment>;
    });
};

// ---------------------------------------------------------------------------
// Paginated table component — 5 rows per page with prev/next controls
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5;

interface PaginatedTableProps {
    rows: string[][];
    pathLabels: Record<string, string>;
    pillClassName: string;
    blockKey: string | number;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({ rows, pathLabels, pillClassName, blockKey }) => {
    const [page, setPage] = useState(0);
    const [header, ...body] = rows;
    const totalPages = Math.ceil(body.length / PAGE_SIZE);
    const pageRows = body.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="my-2">
            <div className="overflow-x-auto rounded-lg border border-emerald-200/50">
                <table className="w-full text-[1.25rem] border-collapse bg-white">
                    <thead>
                        <tr className="bg-emerald-600/10 text-emerald-800">
                            {header.map((cell, ci) => (
                                <th key={ci} className="px-3 py-2 text-left font-semibold border-b border-emerald-200/50 whitespace-nowrap">
                                    {renderInline(cell, `${blockKey}-h${ci}`, pathLabels, pillClassName)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((row, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? "bg-emerald-50/20" : "bg-white"}>
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-3 py-2 border-b border-emerald-100/60 align-top text-gray-800">
                                        {renderInline(cell, `${blockKey}-r${ri}c${ci}`, pathLabels, pillClassName)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination controls — only show if more than one page */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-[1.2rem] text-emerald-600/70 font-medium font-outfit">
                        Page {page + 1} of {totalPages} &nbsp;·&nbsp; {body.length} total
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="text-[1.2rem] px-3 py-1 rounded-full border border-emerald-300/50 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium font-outfit"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="text-[1.2rem] px-3 py-1 rounded-full border border-emerald-300/50 text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium font-outfit"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// ---------------------------------------------------------------------------
// Text normaliser — merges LLM line-broken sentences
// ---------------------------------------------------------------------------

const isNewBlockStarter = (t: string): boolean =>
    /^\d+\.\s/.test(t) || /^[*\-•]\s/.test(t) || /^#{1,3}\s/.test(t) || /^\|/.test(t);

export const normaliseText = (raw: string): string => {
    const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const out: string[] = [];
    let pendingBlank = false;

    for (const line of lines) {
        const t = line.trim();
        if (!t) { pendingBlank = true; continue; }

        // Table rows and block starters always get their own line — never merged
        if (isNewBlockStarter(t)) {
            if (pendingBlank && out.length > 0) out.push("");
            out.push(t);
            pendingBlank = false;
            continue;
        }

        if (out.length > 0 && !pendingBlank) {
            const joiner = /^[.,!?]/.test(t) ? "" : " ";
            out[out.length - 1] = out[out.length - 1].trimEnd() + joiner + t;
        } else if (out.length > 0 && pendingBlank) {
            const prev = out[out.length - 1].trim();
            if (isNewBlockStarter(prev) || prev === "") {
                const joiner = /^[.,!?]/.test(t) ? "" : " ";
                out[out.length - 1] = out[out.length - 1].trimEnd() + joiner + t;
            } else {
                out.push("");
                out.push(t);
            }
            pendingBlank = false;
        } else {
            out.push(t);
            pendingBlank = false;
        }
    }
    return out.join("\n");
};

// ---------------------------------------------------------------------------
// FormattedText component — parameterised by path labels and pill style
// ---------------------------------------------------------------------------

interface FormattedTextProps {
    text: string;
    pathLabels: Record<string, string>;
    pillClassName: string;
    numberColor: string;   // e.g. "text-eco-500" or "text-emerald-400"
    bulletColor: string;   // e.g. "text-eco-400" or "text-emerald-500"
    headingColor: string;  // e.g. "text-eco-800" or "text-emerald-300"
}

export const FormattedText: React.FC<FormattedTextProps> = ({
    text,
    pathLabels,
    pillClassName,
    numberColor,
    bulletColor,
    headingColor,
}) => {
    const normalised = normaliseText(text);
    const lines = normalised.split("\n");

    // Group consecutive table rows (lines starting and ending with |) into table blocks
    const blocks: Array<{ type: "table"; rows: string[][] } | { type: "line"; content: string; index: number }> = [];
    let i = 0;
    while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith("|") && t.endsWith("|")) {
            const tableRows: string[][] = [];
            while (i < lines.length) {
                const row = lines[i].trim();
                if (!row.startsWith("|") || !row.endsWith("|")) break;
                // Skip separator rows like |---|---|
                if (/^\|[\s\-:|]+\|$/.test(row)) { i++; continue; }
                const cells = row.slice(1, -1).split("|").map(c => c.trim());
                tableRows.push(cells);
                i++;
            }
            if (tableRows.length > 0) blocks.push({ type: "table", rows: tableRows });
        } else {
            blocks.push({ type: "line", content: t, index: i });
            i++;
        }
    }

    return (
        <div className="text-[1.4rem] leading-7 space-y-1.5">
            {blocks.map((block, bi) => {
                // ── TABLE BLOCK ──
                if (block.type === "table") {
                    return (
                        <PaginatedTable
                            key={bi}
                            rows={block.rows}
                            pathLabels={pathLabels}
                            pillClassName={pillClassName}
                            blockKey={bi}
                        />
                    );
                }

                // ── REGULAR LINE ──
                const t = block.content;
                const idx = block.index;
                if (!t) return <div key={bi} className="h-1" />;

                const numMatch = t.match(/^(\d+)\.\s+([\s\S]+)/);
                if (numMatch) {
                    return (
                        <div key={bi} style={{ display: "grid", gridTemplateColumns: "2rem 1fr", gap: "0.25rem" }}>
                            <span className={`${numberColor} font-semibold text-[1.3rem] pt-[0.3rem] text-right inline-block`}>
                                {numMatch[1]}.
                            </span>
                            <span className="inline-block">
                                {renderInline(numMatch[2], String(idx), pathLabels, pillClassName)}
                            </span>
                        </div>
                    );
                }

                const bulletMatch = t.match(/^[*\-•]\s+([\s\S]+)/);
                if (bulletMatch) {
                    return (
                        <div key={bi} style={{ display: "grid", gridTemplateColumns: "1.5rem 1fr", gap: "0.25rem" }}>
                            <span className={`${bulletColor} text-[1.5rem] pt-[0.1rem] text-center inline-block`}>•</span>
                            <span className="inline-block">
                                {renderInline(bulletMatch[1], String(idx), pathLabels, pillClassName)}
                            </span>
                        </div>
                    );
                }

                const headingMatch = t.match(/^#{1,3}\s+([\s\S]+)/);
                if (headingMatch) {
                    return (
                        <div key={bi} className={`font-semibold ${headingColor} text-[1.6rem] mt-2 mb-1`}>
                            {headingMatch[1]}
                        </div>
                    );
                }

                return <div key={bi}>{renderInline(t, String(idx), pathLabels, pillClassName)}</div>;
            })}
        </div>
    );
};
