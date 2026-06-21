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
    const [storeStatus, setStoreStatus] = useState<StoreStatusResponse | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

    useEffect(() => {
        const checkStoreStatus = async () => {
            try {
                const status = await apiClient<StoreStatusResponse>('/store/status');
                setStoreStatus(status);
                setLoadingStatus(false);
            } catch (err) {
                console.error('Store status check failed:', err);
                setLoadingStatus(false);
            }
        };

        checkStoreStatus();
        const intervalId = window.setInterval(checkStoreStatus, 5000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (storeStatus && storeStatus.isOpen) {
            setLoading(true);
            apiClient<CustomerDashboardData>('/customer/')
                .then((res) => {
                    setData(res);
                    setError(null);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Dashboard loading failed:', err);
                    setError('Failed to load customer dashboard metrics.');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [storeStatus?.isOpen]);

    if (loadingStatus) return <div>Loading store status...</div>;

    if (storeStatus && !storeStatus.isOpen) {
        return (
            <div className="staff-home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '60vh' }}>
                <div style={{ marginTop: '20px', alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-end' }}>
                    <LogoutButton />
                </div>
                
                <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px', marginTop: '40px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', background: 'var(--bg)', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏪🔒</div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-h)' }}>{storeStatus.storeName}</h2>
                    <p style={{ color: '#888', marginBottom: '24px' }}>{storeStatus.storeAddress}</p>
                    
                    <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                    
                    <div style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '8px', padding: '16px', color: 'var(--text-h)', fontWeight: '500' }}>
                        The store is currently CLOSED.
                    </div>
                    <p style={{ marginTop: '20px', color: 'var(--text)', fontSize: '1rem', lineHeight: '1.6' }}>
                        Customers cannot browse the menu or place orders at this time. Please check back later when we reopen!
                    </p>
                </div>
            </div>
        );
    }

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