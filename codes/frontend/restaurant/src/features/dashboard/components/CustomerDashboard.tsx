import { useEffect, useState } from 'react';
import keycloak from '../../../lib/keycloak'
import { apiClient } from '../../../lib/api-client';
import { LogoutButton } from '../../auth/components/LogoutButton';

// PlaceHolder (waiting for backend)
interface CustomerDashboardData {
    Menu: number;
}

interface StoreStatusResponse {
    isOpen: boolean;
    storeName: string;
    storeAddress: string;
}

export const CustomerHome = () => {
    const [data, setData] = useState<CustomerDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState<boolean>(false);

    useEffect(() => {
        const checkStoreStatus = async () => {
            try {
                const status = await apiClient<StoreStatusResponse>('/store/status');
                if (!status.isOpen) {
                    alert('The store is now closed. You will be returned to the login screen.');
                    setRedirecting(true);
                    keycloak.login();
                }
            } catch (err) {
                console.error('Store status check failed:', err);
            }
        };

        checkStoreStatus();
        const intervalId = window.setInterval(checkStoreStatus, 5000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        apiClient<CustomerDashboardData>('/customer/')
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Dashboard loading failed:', err);
                setError('Failed to load customer dashboard metrics.');
                setLoading(false);
            });
    }, []);

    if (redirecting) return <div>Store closed. Redirecting to login...</div>;
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