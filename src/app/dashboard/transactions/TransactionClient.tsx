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

export default function TransactionClient({ transactions }: { transactions: any[] }) {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    // 1. FILTERING LOGIC (Memoized for performance)
    const filtered = useMemo(() => {
        return transactions.filter(t => {
            const query = search.toLowerCase();

            // Search Logic
            const matchesSearch =
                (t.description?.toLowerCase() || "").includes(query) ||
                (t.accountName?.toLowerCase() || "").includes(query) ||
                (t.status?.toLowerCase() || "").includes(query) ||
                t.amount?.toString().includes(query) ||
                new Date(t.createdAt).toLocaleDateString().toLowerCase().includes(query);

            // Filter Logic
            const isCrypto = t.type.includes("CRYPTO");
            let matchesType = true;

            switch (filterType) {
                case "BANK_IN":
                    matchesType = t.direction === "CREDIT" && !isCrypto;
                    break;
                case "BANK_OUT":
                    matchesType = t.direction === "DEBIT" && !isCrypto;
                    break;
                case "CRYPTO_BUY":
                    matchesType = t.type === "CRYPTO_BUY";
                    break;
                case "CRYPTO_SELL":
                    matchesType = t.type === "CRYPTO_SELL";
                    break;
                default: // ALL
                    matchesType = true;
            }

            return matchesSearch && matchesType;
        });
    }, [search, filterType, transactions]);

    // 2. DYNAMIC SUMMARY STATS (Calculates totals for visible search results)
    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;
        filtered.forEach(t => {
            if (t.direction === 'CREDIT') income += t.amount;
            else expense += t.amount;
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
        doc.setFillColor(5, 5, 5); // Dark background header
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Account Statement", 14, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

        const tableData = filtered.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            t.description,
            t.accountName,
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
    const renderIcon = (t: any) => {
        if (t.type === 'CRYPTO_BUY') return <TrendingUp size={18} />;
        if (t.type === 'CRYPTO_SELL') return <TrendingDown size={18} />;
        if (t.type === 'WIRE') return <RefreshCcw size={18} />;
        if (t.direction === 'CREDIT') return <ArrowDownLeft size={18} />;
        return <ArrowUpRight size={18} />;
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
                        <span className={styles.summaryLabel}>Total Income</span>
                        <span className={styles.summaryValueIncome}>
                            +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.income)}
                        </span>
                    </div>
                    <div className={styles.summarySeparator}></div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Total Expenses</span>
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
                        placeholder="Search by merchant, amount, or date..."
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
                            <option value="BANK_IN">Deposits (Income)</option>
                            <option value="BANK_OUT">Withdrawals (Expenses)</option>
                            <option value="CRYPTO_BUY">Crypto Buys</option>
                            <option value="CRYPTO_SELL">Crypto Sells</option>
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
                                        {/* DESC */}
                                        <td data-label="Description">
                                            <div className={styles.descCell}>
                                                <div className={`${styles.iconBox} ${t.type.includes('CRYPTO') ? styles.cryptoIcon :
                                                        t.direction === 'CREDIT' ? styles.creditIcon : styles.debitIcon
                                                    }`}>
                                                    {renderIcon(t)}
                                                </div>
                                                <div className={styles.descText}>
                                                    <span className={styles.merchant}>{t.description}</span>
                                                    <span className={styles.subType}>{t.type.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td data-label="Account" className={styles.accInfo}>{t.accountName}</td>
                                        <td data-label="Date" className={styles.dateInfo}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td data-label="Status">
                                            <span className={`${styles.badge} ${styles[t.status]}`}>{t.status}</span>
                                        </td>

                                        <td data-label="Amount" className={`${styles.right} ${styles.amount}`}>
                                            <span className={t.direction === 'CREDIT' ? styles.greenText : styles.whiteText}>
                                                {t.direction === 'CREDIT' ? '+' : '-'}
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
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