import styles from './StaffList.module.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../lib/api-client';
import { OwnerTopNav } from '../../../dashboard/components/OwnerDashboard/OwnerTopNav';
import { Users, UserCheck, UserX, Eye, ToggleLeft, ToggleRight, Save, Plus, X } from 'lucide-react';
interface Staffs {
    id: string;
    username: string;
    fullName: string;
    status: string;
}
export const StaffList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Staffs[] | null>(null);
    const [originalData, setOriginalData] = useState<Staffs[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    // Create Staff Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        username: '', email: '', firstName: '', lastName: '', password: '', 
        salary: '', dayOffAmount: '100', address: '', phone: ''
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const handleCreateStaffSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);
        apiClient(`/owner/staff`, {
            method: 'POST',
            data: {
                ...createForm,
                salary: parseInt(createForm.salary) || 0,
                dayOffAmount: parseInt(createForm.dayOffAmount) || 100
            }
        }).then((res: any) => {
            const newStaff = res;
            const updatedData = data ? [...data, newStaff] : [newStaff];
            setData(updatedData);
            setOriginalData(JSON.parse(JSON.stringify(updatedData)));
            
            setIsCreateModalOpen(false);
            setCreateForm({
                username: '', email: '', firstName: '', lastName: '', password: '', 
                salary: '', dayOffAmount: '100', address: '', phone: ''
            });
            alert("Staff created successfully!");
        }).catch((err) => {
            console.error("Failed to create staff:", err);
            setCreateError(err.response?.data?.message || "Failed to create staff. Please check inputs.");
        }).finally(() => {
            setCreateLoading(false);
        });
    };
    useEffect(() => {
        apiClient<Staffs[]>(`/owner/staff`)
            .then((res) => {
                setData(res);
                setOriginalData(JSON.parse(JSON.stringify(res)));
                setLoading(false);
            })
            .catch((err) => {
                console.error("staff loading failed:", err);
                setError("      Failed to load staff list.");
                setLoading(false);
            });
    }, []);
    if (loading) {
        return <div className={styles.loadingContainer}>Loading staff…</div>;
    }
    if (error) {
        return (
            <div className={styles.loadingContainer} style={{ color: '#dc2626' }}>
                {error}
            </div>
        );
    }
    // Toggle status handler
    const handleToggleStatus = (id: string) => {
        setData((currentList) => {
                if (!currentList) return null;
                return currentList.map((staff) =>
                    staff.id === id ? {...staff, status: staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'} : staff
                );
            }
        );
    };
    // Detail view handler
    const handleViewDetail = (id: string) => {
        navigate(`/owner/staff/${id}`);
    };
    // Save changes handler
    const handleSaveChanges = () => {
        if (!data || !originalData) return;
        const updates = data.filter((staff) => {
            const originalStaff = originalData.find(o => o.id === staff.id);
            return originalStaff && originalStaff.status !== staff.status;
        }).map(staff => ({
            id: staff.id,
            status: staff.status
        }));
        if (updates.length === 0) {
            alert("No changes to save.");
            return;
        }
        setIsSaving(true);
        apiClient(`/owner/staff-update-status`, {
            method: 'PUT',
            data: updates
        }).then(() => {
            setOriginalData(JSON.parse(JSON.stringify(data)));
            alert("Changes saved successfully!");
        })
            .catch((err) => {
                console.error("Save failed:", err);
                alert("Failed to save changes.");
            })
            .finally(() => {
                setIsSaving(false);
            });
    };
    const hasChanges = data && originalData
        ? data.some((staff) => {
            const orig = originalData.find(o => o.id === staff.id);
            return orig && orig.status !== staff.status;
        })
        : false;
    const activeCount = data?.filter(s => s.status === 'ACTIVE').length ?? 0;
    const inactiveCount = data?.filter(s => s.status !== 'ACTIVE').length ?? 0;
    const totalCount = data?.length ?? 0;
    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />
            {/* Navy Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <p className={styles.headerLabel}>Management</p>
                        <h1 className={styles.pageTitle}>Staff Management</h1>
                        <p className={styles.subtitle}>Manage employee access and view details.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className={styles.createBtn}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Create Staff
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className={styles.saveBtn}
                            disabled={isSaving || !hasChanges}
                        >
                            <Save size={16} strokeWidth={2.5} />
                            {isSaving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>
            {/* Stats Cards */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#2D7FF9' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Staff</p>
                        <p className={styles.statValue}>{totalCount}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#22c55e' }}>
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Active</p>
                        <p className={styles.statValue}>{activeCount}</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ backgroundColor: '#ef4444' }}>
                        <UserX size={20} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Inactive</p>
                        <p className={styles.statValue}>{inactiveCount}</p>
                    </div>
                </div>
            </div>
            {/* Staff Table */}
            <div className={styles.mainContent}>
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <div className={styles.colUser}>Employee</div>
                        <div className={styles.colStatus}>Status</div>
                        <div className={styles.colActions}>Actions</div>
                    </div>
                    {!data || data.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Users size={48} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>No staff members found.</p>
                        </div>
                    ) : (
                        <ul className={styles.list}>
                            {data.map((staff) => (
                                <li key={staff.id} className={styles.listItem}>
                                    {/* Employee Column */}
                                    <div className={styles.colUser}>
                                        <div className={styles.avatar}>
                                            {staff.fullName.charAt(0)}
                                        </div>
                                        <div className={styles.userInfo}>
                                            <span className={styles.fullName}>{staff.fullName}</span>
                                            <span className={styles.username}>@{staff.username}</span>
                                        </div>
                                    </div>
                                    {/* Status Column */}
                                    <div className={styles.colStatus}>
                                        <span className={`${styles.badge} ${staff.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive}`}>
                                            <span className={`${styles.statusDot} ${staff.status === 'ACTIVE' ? styles.dotActive : styles.dotInactive}`} />
                                            {staff.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {/* Actions Column */}
                                    <div className={styles.colActions}>
                                        <button
                                            onClick={() => handleViewDetail(staff.id)}
                                            className={styles.btnDetail}
                                        >
                                            <Eye size={14} />
                                            Detail
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(staff.id)}
                                            className={staff.status === 'ACTIVE' ? styles.btnDeactivate : styles.btnActivate}
                                        >
                                            {staff.status === 'ACTIVE'
                                                ? <><ToggleRight size={14} /> Deactivate</>
                                                : <><ToggleLeft size={14} /> Activate</>
                                            }
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {/* Create Staff Modal */}
            {isCreateModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Create New Staff</h2>
                            <button className={styles.closeBtn} onClick={() => setIsCreateModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {createError && (
                                <div className={styles.errorAlert}>{createError}</div>
                            )}
                            <form id="createStaffForm" onSubmit={handleCreateStaffSubmit}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>First Name *</label>
                                        <input required className={styles.formInput} value={createForm.firstName} onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Last Name *</label>
                                        <input required className={styles.formInput} value={createForm.lastName} onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Username *</label>
                                    <input required className={styles.formInput} value={createForm.username} onChange={(e) => setCreateForm({...createForm, username: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Email *</label>
                                    <input required type="email" className={styles.formInput} value={createForm.email} onChange={(e) => setCreateForm({...createForm, email: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Temporary Password (min 8 chars) *</label>
                                    <input required minLength={8} type="password" className={styles.formInput} value={createForm.password} onChange={(e) => setCreateForm({...createForm, password: e.target.value})} />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Salary *</label>
                                        <input required type="number" min="0" className={styles.formInput} value={createForm.salary} onChange={(e) => setCreateForm({...createForm, salary: e.target.value})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Day Off Amount</label>
                                        <input type="number" min="0" className={styles.formInput} value={createForm.dayOffAmount} onChange={(e) => setCreateForm({...createForm, dayOffAmount: e.target.value})} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Phone</label>
                                    <input className={styles.formInput} value={createForm.phone} onChange={(e) => setCreateForm({...createForm, phone: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Address</label>
                                    <input className={styles.formInput} value={createForm.address} onChange={(e) => setCreateForm({...createForm, address: e.target.value})} />
                                </div>
                            </form>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                            <button type="submit" form="createStaffForm" className={styles.submitBtn} disabled={createLoading}>
                                {createLoading ? 'Creating...' : 'Create Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}