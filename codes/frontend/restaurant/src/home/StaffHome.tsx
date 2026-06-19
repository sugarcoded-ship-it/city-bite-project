import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LogoutButton } from '../authentication/LogoutButton';
import styles from './StaffHome.module.css';

// PlaceHolder (waiting for backend)
interface StaffDashboardData {
    OrderCount: number;
}

export const StaffHome = () => {
    const [data, setData] = useState<StaffDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient<StaffDashboardData>('/staff/')
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Dashboard loading failed:", err);
                setError("Failed to load staff dashboard metrics.");
                setLoading(false);
            });
    }, []);

  if (loading) {
    return (
      <div className={styles.centeredContainer}>
        <div className={styles.loadingText}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centeredContainer}>
        <div className={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header row area */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Staff Dashboard</h1>
        <div className={styles.actionsArea}>
          <LogoutButton />
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Quick Action Navigation Buttons */}
      <div className={styles.filterRow}>
        <button className={`${styles.filterButton} ${styles.filterButtonActive}`}>
          Overview
        </button>
        <button className={styles.filterButton} onClick={() => alert("Navigate to Order Management")}>
          Active Orders
        </button>
        <button className={styles.filterButton} onClick={() => alert("Navigate to Menu Management")}>
          Edit Menu
        </button>
      </div>

      {/* Metrics Dashboard Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
              <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.088a.5.5 0 0 1 0 .176l-.5 1a.5.5 0 1 1-.894-.448l.15-.3H3.5a.5.5 0 0 1 0-1h.76l-.15-.3a.5.5 0 1 1 .894-.448zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.088a.5.5 0 0 1 0 .176l-.5 1a.5.5 0 1 1-.894-.448l.15-.3H3.5a.5.5 0 0 1 0-1h.76l-.15-.3a.5.5 0 1 1 .894-.448z"/>
            </svg>
          </div>
          <div className={styles.metricInfo}>
            <p className={styles.metricLabel}>Pending Orders</p>
            <p className={styles.metricValue}>{data?.OrderCount ?? 0}</p>
          </div>
        </div>

        {/* Placeholder card structures to maintain the look of the layout grid */}
        <div className={`${styles.metricCard} ${styles.disabledCard}`}>
          <div className={styles.metricIconWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
            </svg>
          </div>
          <div className={styles.metricInfo}>
            <p className={styles.metricLabel}>Avg. Preparation Time</p>
            <p className={styles.metricValue}>-- mins</p>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.disabledCard}`}>
          <div className={styles.metricIconWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm14 3H1v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
            </svg>
          </div>
          <div className={styles.metricInfo}>
            <p className={styles.metricLabel}>Today's Revenue</p>
            <p className={styles.metricValue}>฿0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};