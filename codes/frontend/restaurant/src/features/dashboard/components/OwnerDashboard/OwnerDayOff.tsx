import { useMemo, useState } from 'react';
import { CalendarClock, Plus, Sparkles, UserRoundCheck, Clock3 } from 'lucide-react';
import { OwnerTopNav } from './OwnerTopNav';
import styles from './OwnerDayOff.module.css';

type DayOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface DayOffRequest {
    id: number;
    staffName: string;
    role: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: DayOffStatus;
}

const initialRequests: DayOffRequest[] = [
    {
        id: 1,
        staffName: 'Maria Santos',
        role: 'Shift Lead',
        startDate: '2026-07-15',
        endDate: '2026-07-16',
        days: 2,
        reason: 'Family event',
        status: 'PENDING',
    },
    {
        id: 2,
        staffName: 'James Chen',
        role: 'Cashier',
        startDate: '2026-07-20',
        endDate: '2026-07-20',
        days: 1,
        reason: 'Medical appointment',
        status: 'APPROVED',
    },
    {
        id: 3,
        staffName: 'Nina Patel',
        role: 'Cook',
        startDate: '2026-07-24',
        endDate: '2026-07-27',
        days: 4,
        reason: 'Personal travel',
        status: 'REJECTED',
    },
];

const statusLabel: Record<DayOffStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

export function OwnerDayOff() {
    const [requests, setRequests] = useState(initialRequests);
    const [form, setForm] = useState({
        staffName: 'Alicia Wong',
        role: 'Server',
        startDate: '2026-07-29',
        endDate: '2026-07-30',
        reason: 'Wedding leave',
    });

    const summary = useMemo(() => {
        const pending = requests.filter((item) => item.status === 'PENDING').length;
        const approved = requests.filter((item) => item.status === 'APPROVED').length;
        return { pending, approved };
    }, [requests]);

    const handleAddRequest = (event: React.FormEvent) => {
        event.preventDefault();
        const days = Math.max(1, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const nextRequest: DayOffRequest = {
            id: Date.now(),
            staffName: form.staffName,
            role: form.role,
            startDate: form.startDate,
            endDate: form.endDate,
            days,
            reason: form.reason,
            status: 'PENDING',
        };

        setRequests((current) => [nextRequest, ...current]);
        setForm({
            staffName: '',
            role: '',
            startDate: '',
            endDate: '',
            reason: '',
        });
    };

    const handleDecision = (id: number, status: DayOffStatus) => {
        setRequests((current) =>
            current.map((item) => (item.id === id ? { ...item, status } : item))
        );
    };

    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />

            <main className={styles.mainContent}>
                <section className={styles.heroCard}>
                    <div>
                        <p className={styles.eyebrow}>Owner operations</p>
                        <h1 className={styles.heroTitle}>Day-off planning</h1>
                        <p className={styles.heroText}>
                            Review mock leave requests and keep the schedule balanced before the next shift.
                        </p>
                    </div>

                    <div className={styles.summaryRow}>
                        <div className={styles.summaryPill}>
                            <Clock3 size={15} />
                            <span>{summary.pending} pending</span>
                        </div>
                        <div className={styles.summaryPill}>
                            <UserRoundCheck size={15} />
                            <span>{summary.approved} approved</span>
                        </div>
                    </div>
                </section>

                <section className={styles.contentGrid}>
                    <form className={styles.formCard} onSubmit={handleAddRequest}>
                        <div className={styles.formHeader}>
                            <div>
                                <p className={styles.panelEyebrow}>New request</p>
                                <h2 className={styles.panelTitle}>Create a mock day-off request</h2>
                            </div>
                            <div className={styles.formIcon}>
                                <Plus size={16} />
                            </div>
                        </div>

                        <div className={styles.formFieldGroup}>
                            <label>Staff member</label>
                            <input value={form.staffName} onChange={(event) => setForm({ ...form, staffName: event.target.value })} placeholder="Name" required />
                        </div>
                        <div className={styles.formFieldGroup}>
                            <label>Role</label>
                            <input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="Role" required />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formFieldGroup}>
                                <label>Start date</label>
                                <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
                            </div>
                            <div className={styles.formFieldGroup}>
                                <label>End date</label>
                                <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
                            </div>
                        </div>
                        <div className={styles.formFieldGroup}>
                            <label>Reason</label>
                            <textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Add a reason" required rows={3} />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            <Sparkles size={16} />
                            Add request
                        </button>
                    </form>

                    <div className={styles.requestsCard}>
                        <div className={styles.formHeader}>
                            <div>
                                <p className={styles.panelEyebrow}>Upcoming</p>
                                <h2 className={styles.panelTitle}>Pending requests</h2>
                            </div>
                            <div className={styles.formIcon}>
                                <CalendarClock size={16} />
                            </div>
                        </div>

                        <div className={styles.requestList}>
                            {requests.map((request) => (
                                <article key={request.id} className={styles.requestItem}>
                                    <div className={styles.requestMeta}>
                                        <div>
                                            <h3>{request.staffName}</h3>
                                            <p>{request.role}</p>
                                        </div>
                                        <span className={`${styles.statusBadge} ${styles[request.status.toLowerCase()]}`}>
                                            {statusLabel[request.status]}
                                        </span>
                                    </div>

                                    <div className={styles.requestDetails}>
                                        <span>{request.days} day{request.days > 1 ? 's' : ''}</span>
                                        <span>{request.startDate} → {request.endDate}</span>
                                    </div>

                                    <p className={styles.reasonText}>{request.reason}</p>

                                    {request.status === 'PENDING' && (
                                        <div className={styles.actionsRow}>
                                            <button onClick={() => handleDecision(request.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                                            <button onClick={() => handleDecision(request.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
