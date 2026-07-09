import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import { OwnerTopNav } from '../../dashboards/OwnerDashboard/OwnerTopNav';
import styles from './OwnerDayOffRequest.module.css';

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

interface OwnerLeaveDayListResponse {
  pending: LeaveDayResponse[];
  reviewed: LeaveDayResponse[];
}

export function OwnerDayOffRequest() {
  const [pendingRequests, setPendingRequests] = useState<LeaveDayResponse[]>([]);
  const [answeredRequests, setAnsweredRequests] = useState<LeaveDayResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchUsername);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchUsername]);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await apiClient<OwnerLeaveDayListResponse>(`/owner/leave-days?search=${encodeURIComponent(debouncedSearch)}`);
      if (data) {
        setPendingRequests(data.pending || []);
        setAnsweredRequests(data.reviewed || []);
      }
    } catch (error) {
      console.error('Failed to fetch leave days:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (id: number, status: string) => {
    setActionLoadingId(id);
    try {
      await apiClient(`/owner/leave-days/${id}/status?status=${status}`, { method: 'PUT' });
      showToast(`Request ${status === 'APPROVED' ? 'Accepted' : 'Declined'}`);
      fetchRequests();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      showToast(message, true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderRequestCard = (req: LeaveDayResponse) => (
    <div key={req.id} className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.staffName}>{req.staffName}</h3>
          <p className={styles.staffUsername}>@{req.username}</p>
          <p className={styles.requestedDate}>Requested: {new Date(req.date).toLocaleDateString()}</p>
        </div>
        <span className={`${styles.badge} ${
          req.status === 'APPROVED' ? styles.badgeApproved :
          req.status === 'NOT_APPROVED' ? styles.badgeDeclined :
          styles.badgePending
        }`}>
          {req.status === 'NOT_APPROVED' ? 'Declined' : req.status}
        </span>
      </div>
      
      <div className={styles.datesBox}>
        <p className={styles.datesLabel}>DATES</p>
        <p className={styles.datesValue}>
          {req.startDate} <span className={styles.datesTo}>to</span> {req.endDate}
        </p>
      </div>

      {req.status === 'PENDING' && (
        <div className={styles.actions}>
          <button 
            className={`${styles.btn} ${styles.btnDecline}`}
            onClick={() => handleUpdateStatus(req.id, 'NOT_APPROVED')}
            disabled={actionLoadingId === req.id}
          >
            <XCircle size={18} /> Decline
          </button>
          <button 
            className={`${styles.btn} ${styles.btnAccept}`}
            onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
            disabled={actionLoadingId === req.id}
          >
            <CheckCircle size={18} /> Accept
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <OwnerTopNav />

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.pageTitle}>Day-Off Requests</h1>
              <p className={styles.dateText}>Review and manage staff leave applications</p>
            </div>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Search by username..." 
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Needs Action 
              {pendingRequests.length > 0 && <span className={styles.badgeCount}>{pendingRequests.length}</span>}
            </h2>
          </div>
          
          {loading ? (
            <div className={styles.emptyState}>Loading requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle className={styles.emptyIcon} size={48} />
              <p>All caught up! No pending requests.</p>
            </div>
          ) : (
            <div className={styles.scrollContainer}>
              {pendingRequests.map(renderRequestCard)}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Recently Reviewed
            </h2>
          </div>
          
          {loading ? (
            <div className={styles.emptyState}>Loading history...</div>
          ) : answeredRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No reviewed requests found.</p>
            </div>
          ) : (
            <div className={styles.scrollContainer}>
              {answeredRequests.map(renderRequestCard)}
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
