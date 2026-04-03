'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBranch, updateBranch, deleteBranch, toggleBranchStatus, getGeocodeAction } from '@/actions/admin/branches';
import { Plus, Pencil, Trash2, X, Loader2, MapPin, Phone, Search, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './branches.module.css';
import { Branch } from '@prisma/client';

interface Props {
    initialBranches: Branch[];
}

export default function BranchClientManager({ initialBranches }: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Branch | null>(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [hours, setHours] = useState('Mon - Fri: 9:00 AM - 5:00 PM');
    const [lat, setLat] = useState('40.7128');
    const [lng, setLng] = useState('-74.0060');
    const [isActive, setIsActive] = useState(true);
    const [hasAtm, setHasAtm] = useState(true);
    const [hasDriveThru, setHasDriveThru] = useState(false);
    const [hasNotary, setHasNotary] = useState(false);

    const handleAutoGeocode = async () => {
        if (!address || !city) {
            toast.error("Please enter Address and City first.");
            return;
        }

        setGeoLoading(true);

        const result = await getGeocodeAction(`${address}, ${city}`);

        if (result.success && result.lat && result.lng) {
            setLat(result.lat.toString());
            setLng(result.lng.toString());
            toast.success("Coordinates found!");
        } else {
            toast.error(result.message || "Could not find coordinates.");
        }

        setGeoLoading(false);
    };

    const openAddModal = () => {
        setEditingItem(null);
        setName('');
        setAddress('');
        setCity('');
        setPhone('');
        setEmail('');
        setHours('Mon - Fri: 9:00 AM - 5:00 PM');
        setLat('40.7128');
        setLng('-74.0060');
        setIsActive(true);
        setHasAtm(true);
        setHasDriveThru(false);
        setHasNotary(false);
        setIsModalOpen(true);
    };

    const openEditModal = (branch: Branch) => {
        setEditingItem(branch);
        setName(branch.name);
        setAddress(branch.address);
        setCity(branch.city);
        setPhone(branch.phone);
        setEmail(branch.email || '');
        setHours(branch.hours || 'Mon - Fri: 9:00 AM - 5:00 PM');
        setLat(branch.lat.toString());
        setLng(branch.lng.toString());
        setIsActive(branch.isActive);
        setHasAtm(branch.hasAtm);
        setHasDriveThru(branch.hasDriveThru);
        setHasNotary(branch.hasNotary);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this branch?")) return;
        setLoading(true);
        const res = await deleteBranch(id);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleToggleStatus = async (branch: Branch) => {
        setLoading(true);
        const res = await toggleBranchStatus(branch.id, branch.isActive);
        if (res.success) {
            toast.success(`Branch ${branch.isActive ? 'Closed' : 'Activated'}`);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("address", address);
        formData.append("city", city);
        formData.append("phone", phone);
        formData.append("email", email);
        formData.append("hours", hours);
        formData.append("lat", lat);
        formData.append("lng", lng);
        if (isActive) formData.append("isActive", "on");
        if (hasAtm) formData.append("hasAtm", "on");
        if (hasDriveThru) formData.append("hasDriveThru", "on");
        if (hasNotary) formData.append("hasNotary", "on");

        const res = editingItem
            ? await updateBranch(editingItem.id, formData)
            : await createBranch(formData);

        if (res.success) {
            toast.success(res.message);
            setIsModalOpen(false);
            router.refresh();
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.backLinkContainer}>
                <Link href="/admin/settings" className={styles.backLink}>
                    <ArrowLeft size={18} />
                    Back to Settings
                </Link>
            </div>
            <div className={styles.header}>
                <h1 className={styles.title}>Branch Locations</h1>
                <button onClick={openAddModal} className={styles.addBtn} disabled={loading}>
                    <Plus size={18} /> Add Branch
                </button>
            </div>

            <div className={styles.list}>
                {initialBranches.length === 0 ? (
                    <p className={styles.emptyState}>No branches added yet.</p>
                ) : (
                    initialBranches.map((branch) => (
                        <div key={branch.id} className={styles.card}>
                            <div>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.branchName}>{branch.name}</h3>
                                    <span className={`${styles.statusBadge} ${branch.isActive ? styles.active : styles.closed}`}>
                                        {branch.isActive ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span className={styles.metaItem}><MapPin size={14} /> {branch.city}</span>
                                    <span className={styles.metaItem}><Phone size={14} /> {branch.phone}</span>
                                </div>
                                <div className={styles.metaAddress}>{branch.address}</div>
                            </div>
                            <div className={styles.actions}>
                                <button onClick={() => handleToggleStatus(branch)} className={styles.iconBtn} title="Toggle Status">
                                    {branch.isActive ? <X size={20} color="var(--danger)" /> : <Plus size={20} color="var(--success)" />}
                                </button>
                                <button onClick={() => openEditModal(branch)} className={`${styles.iconBtn} ${styles.iconBtnEdit}`}>
                                    <Pencil size={20} />
                                </button>
                                <button onClick={() => handleDelete(branch.id)} className={`${styles.iconBtn} ${styles.iconBtnDelete}`}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingItem ? 'Edit Branch' : 'Add New Branch'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Branch Name</label>
                                <input className={styles.input} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Downtown HQ" />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Address</label>
                                <input className={styles.input} value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Finance St" />
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>City</label>
                                    <input className={styles.input} value={city} onChange={e => setCity(e.target.value)} required placeholder="New York" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone</label>
                                    <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 (555)..." />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Opening Hours</label>
                                <input className={styles.input} value={hours} onChange={e => setHours(e.target.value)} placeholder="Mon - Fri: 9AM - 5PM" />
                            </div>

                            <div className={styles.grid3}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Coordinates</label>
                                    <button
                                        type="button"
                                        onClick={handleAutoGeocode}
                                        disabled={geoLoading}
                                        className={styles.autoFillBtn}
                                    >
                                        {geoLoading ? <Loader2 size={12} className={styles.spin} /> : <Search size={16} />}
                                        Auto-Fill Coords
                                    </button>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Latitude</label>
                                    <input type="number" step="any" className={styles.input} value={lat} onChange={e => setLat(e.target.value)} required placeholder="Latitude" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Longitude</label>
                                    <input type="number" step="any" className={styles.input} value={lng} onChange={e => setLng(e.target.value)} required placeholder="Longitude" />
                                </div>
                            </div>

                            <div className={`${styles.grid3} ${styles.serviceCheckboxes}`}>
                                <label className={styles.checkboxWrapper}>
                                    <input type="checkbox" checked={hasAtm} onChange={e => setHasAtm(e.target.checked)} className={styles.checkbox} />
                                    <span>24/7 ATM</span>
                                </label>
                                <label className={styles.checkboxWrapper}>
                                    <input type="checkbox" checked={hasDriveThru} onChange={e => setHasDriveThru(e.target.checked)} className={styles.checkbox} />
                                    <span>Drive-Thru</span>
                                </label>
                                <label className={styles.checkboxWrapper}>
                                    <input type="checkbox" checked={hasNotary} onChange={e => setHasNotary(e.target.checked)} className={styles.checkbox} />
                                    <span>Notary</span>
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxWrapper}>
                                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className={styles.checkbox} />
                                    <span>Branch is currently open for business</span>
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 className={styles.spin} /> : (editingItem ? 'Update Branch' : 'Add Branch')}
                            </button>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}



//GOOGLE API
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { createBranch, updateBranch, deleteBranch, toggleBranchStatus } from '@/actions/admin/branches';
// import { Plus, Pencil, Trash2, X, Loader2, MapPin, Phone, Search, ArrowLeft } from 'lucide-react';
// import toast from 'react-hot-toast';
// import styles from './branches.module.css';
// import { Branch } from '@prisma/client';
// import { useJsApiLoader } from '@react-google-maps/api';

// interface Props {
//     initialBranches: Branch[];
// }

// const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

// export default function BranchClientManager({ initialBranches }: Props) {
//     const router = useRouter();

//     // Google Maps Script for Geocoding
//     const { isLoaded } = useJsApiLoader({
//         id: 'google-map-script-admin',
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//         libraries: LIBRARIES
//     });

//     const [loading, setLoading] = useState(false);
//     const [geoLoading, setGeoLoading] = useState(false);

//     // Modal
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingItem, setEditingItem] = useState<Branch | null>(null);

//     // Form Fields
//     const [name, setName] = useState('');
//     const [address, setAddress] = useState('');
//     const [city, setCity] = useState('');
//     const [phone, setPhone] = useState('');
//     const [email, setEmail] = useState('');
//     const [hours, setHours] = useState('Mon - Fri: 9:00 AM - 5:00 PM');
//     const [lat, setLat] = useState('40.7128');
//     const [lng, setLng] = useState('-74.0060');

//     const [isActive, setIsActive] = useState(true);
//     const [hasAtm, setHasAtm] = useState(true);
//     const [hasDriveThru, setHasDriveThru] = useState(false);

//     // Geocoding Function
//     const handleAutoGeocode = async () => {
//         if (!isLoaded || !window.google) {
//             toast.error("Google Maps not loaded yet.");
//             return;
//         }
//         if (!address || !city) {
//             toast.error("Please enter Address and City first.");
//             return;
//         }

//         setGeoLoading(true);
//         try {
//             const geocoder = new window.google.maps.Geocoder();
//             const fullAddress = `${address}, ${city}`;

//             const result = await geocoder.geocode({ address: fullAddress });

//             if (result.results && result.results.length > 0) {
//                 const location = result.results[0].geometry.location;
//                 setLat(location.lat().toString());
//                 setLng(location.lng().toString());
//                 toast.success("Coordinates found!");
//             } else {
//                 toast.error("Could not find coordinates for this address.");
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error("Geocoding failed. Check API key restrictions.");
//         }
//         setGeoLoading(false);
//     };

//     const openAddModal = () => {
//         setEditingItem(null);
//         setName('');
//         setAddress('');
//         setCity('');
//         setPhone('');
//         setEmail('');
//         setHours('Mon - Fri: 9:00 AM - 5:00 PM');
//         setLat('40.7128');
//         setLng('-74.0060');
//         setIsActive(true);
//         setHasAtm(true);
//         setHasDriveThru(false);
//         setIsModalOpen(true);
//     };

//     const openEditModal = (branch: Branch) => {
//         setEditingItem(branch);
//         setName(branch.name);
//         setAddress(branch.address);
//         setCity(branch.city);
//         setPhone(branch.phone);
//         setEmail(branch.email || '');
//         setHours(branch.hours || 'Mon - Fri: 9:00 AM - 5:00 PM');
//         setLat(branch.lat.toString());
//         setLng(branch.lng.toString());
//         setIsActive(branch.isActive);
//         setHasAtm(branch.hasAtm);
//         setHasDriveThru(branch.hasDriveThru);
//         setIsModalOpen(true);
//     };

//     const handleDelete = async (id: string) => {
//         if (!confirm("Are you sure you want to delete this branch?")) return;
//         setLoading(true);
//         const res = await deleteBranch(id);
//         if (res.success) {
//             toast.success(res.message);
//             router.refresh();
//         } else {
//             toast.error(res.message);
//         }
//         setLoading(false);
//     };

//     const handleToggleStatus = async (branch: Branch) => {
//         setLoading(true);
//         const res = await toggleBranchStatus(branch.id, branch.isActive);
//         if (res.success) {
//             toast.success(`Branch ${branch.isActive ? 'Closed' : 'Activated'}`);
//             router.refresh();
//         } else {
//             toast.error(res.message);
//         }
//         setLoading(false);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);

//         const formData = new FormData();
//         formData.append("name", name);
//         formData.append("address", address);
//         formData.append("city", city);
//         formData.append("phone", phone);
//         formData.append("email", email);
//         formData.append("hours", hours);
//         formData.append("lat", lat);
//         formData.append("lng", lng);
//         if (isActive) formData.append("isActive", "on");
//         if (hasAtm) formData.append("hasAtm", "on");
//         if (hasDriveThru) formData.append("hasDriveThru", "on");

//         const res = editingItem
//             ? await updateBranch(editingItem.id, formData)
//             : await createBranch(formData);

//         if (res.success) {
//             toast.success(res.message);
//             setIsModalOpen(false);
//             router.refresh();
//         } else {
//             toast.error(res.message);
//         }
//         setLoading(false);
//     };

//     return (
//         <div className={styles.container}>
//             <div style={{ marginBottom: '1rem' }}>
//                 <Link href="/admin/settings" className={styles.backLink}>
//                     <ArrowLeft size={18} />
//                     Back to Settings
//                 </Link>
//             </div>
//             <div className={styles.header}>
//                 <h1 className={styles.title}>Branch Locations</h1>
//                 <button onClick={openAddModal} className={styles.addBtn} disabled={loading}>
//                     <Plus size={18} /> Add Branch
//                 </button>
//             </div>

//             <div className={styles.list}>
//                 {initialBranches.length === 0 ? (
//                     <p className={styles.emptyState}>No branches added yet.</p>
//                 ) : (
//                     initialBranches.map((branch) => (
//                         <div key={branch.id} className={styles.card}>
//                             <div>
//                                 <div className={styles.cardHeader}>
//                                     <h3 className={styles.branchName}>{branch.name}</h3>
//                                     <span className={`${styles.statusBadge} ${branch.isActive ? styles.active : styles.closed}`}>
//                                         {branch.isActive ? 'Open' : 'Closed'}
//                                     </span>
//                                 </div>
//                                 <div className={styles.metaRow}>
//                                     <span className={styles.metaItem}><MapPin size={14} /> {branch.city}</span>
//                                     <span className={styles.metaItem}><Phone size={14} /> {branch.phone}</span>
//                                 </div>
//                                 <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
//                                     {branch.address}
//                                 </div>
//                             </div>
//                             <div className={styles.actions}>
//                                 <button onClick={() => handleToggleStatus(branch)} className={styles.iconBtn} title="Toggle Status">
//                                     {branch.isActive ? <X size={16} color="var(--danger)" /> : <Plus size={16} color="var(--success)" />}
//                                 </button>
//                                 <button onClick={() => openEditModal(branch)} className={styles.iconBtn}>
//                                     <Pencil size={16} />
//                                 </button>
//                                 <button onClick={() => handleDelete(branch.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`}>
//                                     <Trash2 size={16} />
//                                 </button>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>

//             {isModalOpen && (
//                 <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
//                     <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//                         <div className={styles.modalHeader}>
//                             <h2 className={styles.modalTitle}>{editingItem ? 'Edit Branch' : 'Add New Branch'}</h2>
//                             <button onClick={() => setIsModalOpen(false)} className={styles.closeModalBtn}>
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         <form onSubmit={handleSubmit}>
//                             {/* BASIC INFO */}
//                             <div className={styles.formGroup}>
//                                 <label className={styles.label}>Branch Name</label>
//                                 <input className={styles.input} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Downtown HQ" />
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label className={styles.label}>Address</label>
//                                 <input className={styles.input} value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Finance St" />
//                             </div>

//                             <div className={styles.grid2}>
//                                 <div className={styles.formGroup}>
//                                     <label className={styles.label}>City</label>
//                                     <input className={styles.input} value={city} onChange={e => setCity(e.target.value)} required placeholder="New York" />
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label className={styles.label}>Phone</label>
//                                     <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 (555)..." />
//                                 </div>
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label className={styles.label}>Opening Hours</label>
//                                 <input className={styles.input} value={hours} onChange={e => setHours(e.target.value)} placeholder="Mon - Fri: 9AM - 5PM" />
//                             </div>

//                             {/* COORDINATES + AUTO FILL BUTTON */}
//                             <div className={styles.formGroup}>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                                     <label className={styles.label} style={{ marginBottom: 0 }}>Coordinates</label>
//                                     <button
//                                         type="button"
//                                         onClick={handleAutoGeocode}
//                                         disabled={geoLoading || !isLoaded}
//                                         style={{
//                                             background: '#eff6ff', color: 'var(--primary)', border: 'none',
//                                             padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem',
//                                             fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
//                                         }}
//                                     >
//                                         {geoLoading ? <Loader2 size={12} className={styles.spin} /> : <Search size={12} />}
//                                         Auto-Fill from Address
//                                     </button>
//                                 </div>
//                                 <div className={styles.grid2}>
//                                     <input type="number" step="any" className={styles.input} value={lat} onChange={e => setLat(e.target.value)} required placeholder="Latitude" />
//                                     <input type="number" step="any" className={styles.input} value={lng} onChange={e => setLng(e.target.value)} required placeholder="Longitude" />
//                                 </div>
//                             </div>

//                             {/* CHECKBOXES */}
//                             <div className={styles.grid2} style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
//                                 <label className={styles.checkboxWrapper}>
//                                     <input type="checkbox" checked={hasAtm} onChange={e => setHasAtm(e.target.checked)} className={styles.checkbox} />
//                                     <span>24/7 ATM</span>
//                                 </label>
//                                 <label className={styles.checkboxWrapper}>
//                                     <input type="checkbox" checked={hasDriveThru} onChange={e => setHasDriveThru(e.target.checked)} className={styles.checkbox} />
//                                     <span>Drive-Thru</span>
//                                 </label>
//                             </div>

//                             <div className={styles.formGroup}>
//                                 <label className={styles.checkboxWrapper}>
//                                     <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className={styles.checkbox} />
//                                     <span>Branch is currently open for business</span>
//                                 </label>
//                             </div>

//                             <button type="submit" className={styles.submitBtn} disabled={loading}>
//                                 {loading ? <Loader2 className={styles.spin} /> : (editingItem ? 'Update Branch' : 'Add Branch')}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }