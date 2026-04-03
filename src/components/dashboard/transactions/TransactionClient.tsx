'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Download, Search, ArrowUpRight, ArrowDownLeft,
    RefreshCcw, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, Filter, FileText, XCircle, AlertTriangle
} from 'lucide-react';
import styles from "./transactions.module.css";

interface Transaction {
    id: string;
    amount: number | string;
    description: string;
    accountName?: string;
    status: string;
    type: string;
    direction: string;
    createdAt: Date | string;
}

interface TransactionClientProps {
    transactions: Transaction[];
    currency: string;
    rate: number;
}

export default function TransactionClient({ transactions, currency, rate }: TransactionClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    const filtered = useMemo(() => {
        return transactions.filter((t: Transaction) => {
            const query = search.toLowerCase();
            const type = t.type || "";

            const displayAmount = (Number(t.amount) * rate).toFixed(2);

            const matchesSearch =
                (t.description?.toLowerCase() || "").includes(query) ||
                (t.accountName?.toLowerCase() || "").includes(query) ||
                (t.status?.toLowerCase() || "").includes(query) ||
                displayAmount.includes(query) ||
                new Date(t.createdAt).toLocaleDateString().toLowerCase().includes(query);

            const isCrypto = type.startsWith("CRYPTO");
            let matchesType = true;

            switch (filterType) {
                case "BANK": matchesType = !isCrypto; break;
                case "BANK_IN": matchesType = t.direction === "CREDIT" && !isCrypto; break;
                case "BANK_OUT": matchesType = t.direction === "DEBIT" && !isCrypto; break;
                case "CRYPTO": matchesType = isCrypto; break;
                case "CRYPTO_BUY": matchesType = type === "CRYPTO_BUY"; break;
                case "CRYPTO_SELL": matchesType = type === "CRYPTO_SELL"; break;
                case "CRYPTO_SEND": matchesType = type === "CRYPTO_SEND"; break;
                case "CRYPTO_RECEIVE": matchesType = type === "CRYPTO_RECEIVE"; break;
                default: matchesType = true;
            }

            return matchesSearch && matchesType;
        });
    }, [search, filterType, transactions, rate]);

    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;
        filtered.forEach(t => {
            if (t.status === 'COMPLETED') {
                const val = Number(t.amount) * rate;
                if (t.direction === 'CREDIT') income += val;
                else expense += val;
            }
        });
        return { income, expense };
    }, [filtered, rate]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);

    const handleExport = () => {
        const doc = new jsPDF();
        doc.setFillColor(5, 5, 5);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Account Statement", 14, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} | Currency: ${currency}`, 14, 35);

        const tableData = filtered.map(t => {
            const isReversed = t.status === 'REVERSED';
            const isFailed = t.status === 'FAILED' || t.status === 'REJECTED';

            // Convert Amount for PDF
            const val = Number(t.amount) * rate;
            let amountStr = `${currency} ${val.toFixed(2)}`;

            if (isReversed) {
                amountStr = `(SECURITY) ${amountStr}`;
            } else if (isFailed) {
                amountStr = `(VOID) ${amountStr}`;
            } else {
                amountStr = (t.direction === 'CREDIT' ? '+' : '-') + amountStr;
            }

            return [
                new Date(t.createdAt).toLocaleDateString(),
                t.description,
                t.accountName || 'N/A',
                t.status,
                amountStr
            ];
        });

        autoTable(doc, {
            startY: 45,
            head: [['Date', 'Description', 'Account', 'Status', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [200, 200, 200] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        doc.save(`Transaction_History_${currency}.pdf`);
    };

    const renderIcon = (t: Transaction, statusType: 'REVERSED' | 'FAILED' | 'NORMAL') => {
        if (statusType === 'REVERSED') return <AlertTriangle size={18} />;
        if (statusType === 'FAILED') return <XCircle size={18} />;

        const type = t.type || "";
        if (type === 'CRYPTO_BUY') return <TrendingUp size={18} />;
        if (type === 'CRYPTO_SELL') return <TrendingDown size={18} />;
        if (type === 'CRYPTO_SEND') return <ArrowUpRight size={18} />;
        if (type === 'CRYPTO_RECEIVE') return <ArrowDownLeft size={18} />;
        if (type === 'WIRE_TRANSFER' || type === 'TRANSFER') return <RefreshCcw size={18} />;
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

                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Total In</span>
                        <span className={styles.summaryValueIncome}>
                            +{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(stats.income)}
                        </span>
                    </div>
                    <div className={styles.summarySeparator}></div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Total Out</span>
                        <span className={styles.summaryValueExpense}>
                            -{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(stats.expense)}
                        </span>
                    </div>
                </div>
            </header>

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
                            <option value="ALL" className={styles.filterSelectOption}>All Transactions</option>
                            <optgroup label="Bank / Fiat" className={styles.filterSelectOption}>
                                <option value="BANK" className={styles.filterSelectOption}>All Bank</option>
                                <option value="BANK_IN" className={styles.filterSelectOption}>Deposits (In)</option>
                                <option value="BANK_OUT" className={styles.filterSelectOption}>Withdrawals (Out)</option>
                            </optgroup>
                            <optgroup label="Crypto" className={styles.filterSelectOption}>
                                <option value="CRYPTO" className={styles.filterSelectOption}>All Crypto</option>
                                <option value="CRYPTO_BUY" className={styles.filterSelectOption}>Crypto Buys</option>
                                <option value="CRYPTO_SELL" className={styles.filterSelectOption}>Crypto Sells</option>
                                <option value="CRYPTO_SEND" className={styles.filterSelectOption}>Crypto Sends</option>
                                <option value="CRYPTO_RECEIVE" className={styles.filterSelectOption}>Crypto Receives</option>
                            </optgroup>
                        </select>
                    </div>

                    <button onClick={handleExport} className={styles.exportBtn}>
                        <Download size={18} /> <span>PDF</span>
                    </button>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableScroll}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.colDesc}>Description</th>
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
                                paginatedData.map(t => {
                                    let statusType: 'REVERSED' | 'FAILED' | 'NORMAL' = 'NORMAL';
                                    if (t.status === 'REVERSED') statusType = 'REVERSED';
                                    else if (t.status === 'FAILED') statusType = 'FAILED';

                                    const displayVal = Number(t.amount) * rate;

                                    return (
                                        <tr
                                            key={t.id}
                                            onClick={() => router.push(`/dashboard/transactions/${t.id}`)}
                                            className={styles.clickableRow}
                                        >
                                            <td data-label="Description">
                                                <div className={styles.descCell}>
                                                    <div className={`${styles.iconBox} ${statusType === 'REVERSED' ? styles.reversedIcon :
                                                        statusType === 'FAILED' ? styles.failedIcon :
                                                            t.type.startsWith('CRYPTO') ? styles.cryptoIcon :
                                                                t.direction === 'CREDIT' ? styles.creditIcon : styles.debitIcon
                                                        }`}>
                                                        {renderIcon(t, statusType)}
                                                    </div>
                                                    <div className={styles.descText}>
                                                        <span className={`${styles.merchant} ${statusType === 'REVERSED' ? styles.textReversed :
                                                            statusType === 'FAILED' ? styles.textFailed : ''
                                                            }`}>
                                                            {t.description}
                                                        </span>
                                                        <span className={styles.subType}>
                                                            {t.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Account" className={styles.accInfo}>{t.accountName || 'Primary'}</td>
                                            <td data-label="Date" className={styles.dateInfo}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td data-label="Status">
                                                <span className={`${styles.badge} ${styles[t.status]}`}>
                                                    {t.status === 'FAILED' ? 'DECLINED' : t.status}
                                                </span>
                                            </td>

                                            <td data-label="Amount" className={`${styles.right} ${styles.amount}`}>
                                                <span className={
                                                    statusType === 'REVERSED' ? styles.amountReversed :
                                                        statusType === 'FAILED' ? styles.amountFailed :
                                                            (t.direction === 'CREDIT' ? styles.greenText : styles.whiteText)
                                                }>
                                                    {t.direction === 'CREDIT' ? '+' : '-'}
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(displayVal)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

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