import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../../../lib/api-client.ts';
import { StaffTopNav } from '../../../dashboard/components/StaffDashboard/StaffTopNav.tsx';
import styles from './StaffDayOffRequests.module.css';
import { CalendarPlus } from 'lucide-react';

interface LeaveDayResponse {
    id: number;
    staffUuid: string;
    username: string;
    staffName: string;
    startDate: string;
    endDate: string;
    status: string;
    date: string;
}

interface LeaveDayRequest {
    startDate: string;
    endDate: string;
}

export const StaffDayOffRequests = () => {
    const [leaveDays, setLeaveDays] = useState<LeaveDayResponse[]>([]);
    const [remainingDayOffAmount, setRemainingDayOffAmount] = useState<number>(0);
    const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [modalError, setModalError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const showToast = (msg: string, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), isError ? 6000 : 3000);
    };

    const fetchLeaveDays = useCallback(async () => {
        try {
            const data = await apiClient<LeaveDayResponse[]>('/staff/leave-days');
            setLeaveDays(data || []);
            const amountData = await apiClient<{ amount: number }>('/staff/leave-days/amount');
            if (amountData) setRemainingDayOffAmount(amountData.amount);
        } catch (error) {
            console.error('Failed to fetch leave days:', error);
        }
    }, []);

    useEffect(() => {
        fetchLeaveDays();
        const interval = setInterval(fetchLeaveDays, 30000);
        return () => clearInterval(interval);
    }, [fetchLeaveDays]);

    const handleCancelLeaveDay = async (id: number) => {
        try {
            await apiClient(`/staff/leave-days/${id}`, { method: 'DELETE' });
            showToast('Leave day request canceled.');
            fetchLeaveDays();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to cancel request.';
            showToast(message, true);
        }
    };

    const handleDayOffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        if (!startDate || !endDate) {
            setModalError('Please select both start and end dates.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setModalError('End date must be on or after start date.');
            return;
        }
        try {
            const requestData: LeaveDayRequest = { startDate, endDate };
            await apiClient('/staff/leave-days', {
                method: 'POST',
                data: requestData,
            });
            showToast('Day-off request submitted successfully.');
            setIsModalOpen(false);
            setStartDate('');
            setEndDate('');
            fetchLeaveDays();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit request';
            setModalError(message);
        }
    };

    const sortedLeaveDays = [...leaveDays].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const pendingRequests = sortedLeaveDays.filter(req => req.status === 'PENDING');
    const approvedRequests = sortedLeaveDays.filter(req => req.status === 'APPROVED');
    const notApprovedRequests = sortedLeaveDays.filter(req => req.status === 'NOT_APPROVED');

    const renderLeaveDayCard = (req: LeaveDayResponse) => (
        <div key={req.id} className={styles.leaveDayCard}>
            <div className={styles.leaveDayHeader}>
                <span className={styles.leaveDayDates}>
                    {req.startDate} to {req.endDate}
                </span>
                <span className={`${styles.statusBadge} ${
                    req.status === 'APPROVED' ? styles.statusApproved :
                    req.status === 'NOT_APPROVED' ? styles.statusNotApproved :
                    styles.statusPending
                }`}>
                    {req.status === 'NOT_APPROVED' ? 'DECLINED' : req.status}
                </span>
            </div>
            <div className={styles.leaveDayDateInfo}>
                Requested on: {new Date(req.date).toLocaleDateString()}
            </div>
            {req.status === 'PENDING' && (
                <button
                    onClick={() => handleCancelLeaveDay(req.id)}
                    className={styles.cancelLeaveBtn}
                >
                    Cancel Request
                </button>
            )}
        </div>
    );

    return (
        <div className={styles.page}>
            <StaffTopNav />

            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Day-Off Requests</h1>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span className={styles.badge} style={{ background: '#3b82f6', fontSize: '0.875rem', padding: '6px 12px' }}>
                            {remainingDayOffAmount} days left
                        </span>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={styles.requestBtn}
                        >
                            <CalendarPlus size={18} />
                            Request Day Off
                        </button>
                    </div>
                </div>

                <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                    <h2 className={styles.sectionTitle}>Pending Requests</h2>
                </div>
                <div className={styles.leaveDaysContainer}>
                    {pendingRequests.length === 0 ? (
                        <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>No pending requests.</div>
                    ) : (
                        pendingRequests.map(renderLeaveDayCard)
                    )}
                </div>

                <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                    <h2 className={styles.sectionTitle}>Approved</h2>
                </div>
                <div className={styles.leaveDaysContainer}>
                    {approvedRequests.length === 0 ? (
                        <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>No approved requests.</div>
                    ) : (
                        approvedRequests.map(renderLeaveDayCard)
                    )}
                </div>

                <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                    <h2 className={styles.sectionTitle}>Declined</h2>
                </div>
                <div className={styles.leaveDaysContainer}>
                    {notApprovedRequests.length === 0 ? (
                        <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>No declined requests.</div>
                    ) : (
                        notApprovedRequests.map(renderLeaveDayCard)
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Request Day Off</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>&times;</button>
                        </div>
                        <form onSubmit={handleDayOffSubmit} className={styles.modalBody}>
                            {modalError && <div className={styles.errorAlert}>{modalError}</div>}
                            <div className={styles.inputGroup}>
                                <div>
                                    <label className={styles.inputLabel}>Start Date</label>
                                    <input
                                        type="date"
                                        min={today}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={styles.dateInput}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={styles.inputLabel}>End Date</label>
                                    <input
                                        type="date"
                                        min={startDate || today}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={styles.dateInput}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};
