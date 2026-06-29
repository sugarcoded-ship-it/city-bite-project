import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { LogoutButton } from '../../auth/components/LogoutButton';

// PlaceHolder (waiting for backend)
interface CustomerDashboardData {
    Menu: number;
}

export const CustomerHome = () => {
    const [data, setData] = useState<CustomerDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient<CustomerDashboardData>('/customer/')
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Dashboard loading failed:", err);
                setError("Failed to load customer dashboard metrics.");
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

            <h1>Customer Dashboard</h1>
            <hr />
            <div className="metrics-grid">
                <div className="card">Pending Orders: {data?.Menu}</div>
            </div>
        </div>
    );
};