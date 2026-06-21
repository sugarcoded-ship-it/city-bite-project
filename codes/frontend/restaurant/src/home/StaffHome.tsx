import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { LogoutButton } from '../features/auth/components/LogoutButton.tsx';

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

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="staff-home-container">
            <div style={{ marginTop: '20px' }}>
                <LogoutButton />
            </div>

            <h1>Staff Dashboard</h1>
            <hr />
            <div className="metrics-grid">
                <div className="card">Pending Orders: {data?.OrderCount}</div>
            </div>
        </div>
    );
};