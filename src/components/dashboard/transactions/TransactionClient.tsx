'use client';

import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Download, Search, ArrowUpRight, ArrowDownLeft,
    RefreshCcw, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, Filter, FileText
} from 'lucide-react';
import styles from "./transactions.module.css";

// Define the shape of our Transaction based on Prisma
interface Transaction {
    id: string;
    amount: number | string; // Prisma Decimal comes as string often
    description: string;
    accountName?: string;
    status: string; // 'COMPLETED', 'PENDING', 'FAILED'
    type: string;   // 'DEPOSIT', 'WITHDRAWAL', 'CRYPTO_BUY', etc.
    direction: string; // 'CREDIT', 'DEBIT'
    createdAt: Date | string;
}

export default function TransactionClient({ transactions }: { transactions: Transaction[] }) {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    // 1. FILTERING LOGIC (Aligns with Backend Enums)
    const filtered = useMemo(() => {
        return transactions.filter((t: Transaction) => {
            const query = search.toLowerCase();
            const type = t.type || "";

            // Search Logic
            const matchesSearch =
                (t.description?.toLowerCase() || "").includes(query) ||
                (t.accountName?.toLowerCase() || "").includes(query) ||
                (t.status?.toLowerCase() || "").includes(query) ||
                t.amount?.toString().includes(query) ||
                new Date(t.createdAt).toLocaleDateString().toLowerCase().includes(query);

            // Filter Logic
            const isCrypto = type.startsWith("CRYPTO"); // Covers CRYPTO_BUY, CRYPTO_SEND, etc.
            let matchesType = true;

            switch (filterType) {
                // --- BANK FILTERS ---
                case "BANK":
                    // Show Bank Deposits, Withdrawals, Transfers, Bills
                    matchesType = !isCrypto;
                    break;
                case "BANK_IN":
                    matchesType = t.direction === "CREDIT" && !isCrypto;
                    break;
                case "BANK_OUT":
                    matchesType = t.direction === "DEBIT" && !isCrypto;
                    break;

                // --- CRYPTO FILTERS ---
                case "CRYPTO":
                    matchesType = isCrypto;
                    break;
                case "CRYPTO_BUY":
                    matchesType = type === "CRYPTO_BUY";
                    break;
                case "CRYPTO_SELL":
                    matchesType = type === "CRYPTO_SELL";
                    break;
                case "CRYPTO_SEND":
                    matchesType = type === "CRYPTO_SEND";
                    break;
                case "CRYPTO_RECEIVE":
                    matchesType = type === "CRYPTO_RECEIVE";
                    break;

                default: // ALL
                    matchesType = true;
            }

            return matchesSearch && matchesType;
        });
    }, [search, filterType, transactions]);

    // 2. DYNAMIC SUMMARY STATS
    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;
        filtered.forEach(t => {
            if (t.status === 'COMPLETED') { // Only count completed
                const val = Number(t.amount);
                if (t.direction === 'CREDIT') income += val;
                else expense += val;
            }
        });
        return { income, expense };
    }, [filtered]);

    // 3. PAGINATION
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);

    // 4. EXPORT PDF
    const handleExport = () => {
        const doc = new jsPDF();
        doc.setFillColor(5, 5, 5);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Account Statement", 14, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

        const tableData = filtered.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            t.description,
            t.accountName || 'N/A',
            t.status,
            (t.direction === 'CREDIT' ? '+' : '-') + `$${Number(t.amount).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Date', 'Description', 'Account', 'Status', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [200, 200, 200] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        doc.save("TrustBank_Statement.pdf");
    };

    // Helper to render icon
    const renderIcon = (t: Transaction) => {
        const type = t.type || "";
        // Crypto Icons
        if (type === 'CRYPTO_BUY') return <TrendingUp size={18} />;
        if (type === 'CRYPTO_SELL') return <TrendingDown size={18} />;
        if (type === 'CRYPTO_SEND') return <ArrowUpRight size={18} />;
        if (type === 'CRYPTO_RECEIVE') return <ArrowDownLeft size={18} />;

        // Bank Icons
        if (type === 'WIRE_TRANSFER' || type === 'TRANSFER') return <RefreshCcw size={18} />;
        if (t.direction === 'CREDIT') return <ArrowDownLeft size={18} />; // Money In
        return <ArrowUpRight size={18} />; // Money Out
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Transactions</h1>
                    <p className={styles.subtitle}>{filtered.length} entries found</p>
                </div>

                {/* DYNAMIC SUMMARY CARDS */}
                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Total In</span>
                        <span className={styles.summaryValueIncome}>
                            +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.income)}
                        </span>
                    </div>
                    <div className={styles.summarySeparator}></div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Total Out</span>
                        <span className={styles.summaryValueExpense}>
                            -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.expense)}
                        </span>
                    </div>
                </div>
            </header>

            {/* CONTROLS BAR */}
            <div className={styles.controlsBar}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        placeholder="Search transactions..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <div className={styles.actionGroup}>
                    <div className={styles.selectWrapper}>
                        <Filter size={16} className={styles.selectIcon} />
                        <select
                            className={styles.filterSelect}
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">All Transactions</option>

                            <optgroup label="Bank / Fiat">
                                <option value="BANK">All Bank</option>
                                <option value="BANK_IN">Deposits (In)</option>
                                <option value="BANK_OUT">Withdrawals (Out)</option>
                            </optgroup>

                            <optgroup label="Crypto">
                                <option value="CRYPTO">All Crypto</option>
                                <option value="CRYPTO_BUY">Crypto Buys</option>
                                <option value="CRYPTO_SELL">Crypto Sells</option>
                                <option value="CRYPTO_SEND">Crypto Sends</option>
                                <option value="CRYPTO_RECEIVE">Crypto Receives</option>
                            </optgroup>
                        </select>
                    </div>

                    <button onClick={handleExport} className={styles.exportBtn}>
                        <Download size={18} /> <span>PDF</span>
                    </button>
                </div>
            </div>

            {/* GLASS TABLE */}
            <div className={styles.tableCard}>
                <div className={styles.tableScroll}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Description</th>
                                <th>Account</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className={styles.right}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.empty}>
                                        <div className={styles.emptyStateContent}>
                                            <FileText size={40} />
                                            <p>No transactions match your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(t => (
                                    <tr key={t.id}>
                                        <td data-label="Description">
                                            <div className={styles.descCell}>
                                                <div className={`${styles.iconBox} ${t.type.startsWith('CRYPTO') ? styles.cryptoIcon :
                                                    t.direction === 'CREDIT' ? styles.creditIcon : styles.debitIcon
                                                    }`}>
                                                    {renderIcon(t)}
                                                </div>
                                                <div className={styles.descText}>
                                                    <span className={styles.merchant}>{t.description}</span>
                                                    {/* Format: CRYPTO_BUY -> Crypto Buy */}
                                                    <span className={styles.subType}>
                                                        {t.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Account" className={styles.accInfo}>{t.accountName || 'Primary'}</td>
                                        <td data-label="Date" className={styles.dateInfo}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td data-label="Status">
                                            <span className={`${styles.badge} ${styles[t.status]}`}>{t.status}</span>
                                        </td>

                                        <td data-label="Amount" className={`${styles.right} ${styles.amount}`}>
                                            <span className={t.direction === 'CREDIT' ? styles.greenText : styles.whiteText}>
                                                {t.direction === 'CREDIT' ? '+' : '-'}
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(t.amount))}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className={styles.pageBtn}
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className={styles.pageBtn}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}