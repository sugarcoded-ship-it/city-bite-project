import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LogoutButton } from '../authentication/LogoutButton';

// PlaceHolder (waiting for backend)
interface OwnerDashboardData {
    Income: number;
}

export const OwnerHome = () => {
    const [data, setData] = useState<OwnerDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient<OwnerDashboardData>('/owner/')
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Dashboard loading failed:", err);
                setError("Failed to load owner dashboard metrics.");
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

            <h1>Owner Dashboard</h1>
            <hr />
            <div className="metrics-grid">
                <div className="card">Pending Orders: {data?.Income}</div>
            </div>
        </div>
    );
};