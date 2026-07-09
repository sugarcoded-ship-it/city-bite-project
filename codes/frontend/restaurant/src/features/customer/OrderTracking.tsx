import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';

interface EtaResponse {
    orderId: number;
    available: boolean;
    message?: string | null;
    prepMinutes: number;
    travelMinutes: number;
    etaFrom?: string | null;
    etaTo?: string | null;
    status?: string | null;
}

const STATUS_STEPS = [
    { key: 'PENDING',        label: 'Pending' },
    { key: 'IN_PREPARATION', label: 'In preparation' },
    { key: 'ON_DELIVERY',    label: 'On delivery' },
    { key: 'DELIVERED',      label: 'Delivered' },
] as const;

const stepIndexFor = (status?: string | null): number =>
    STATUS_STEPS.findIndex((s) => s.key === status);

const toHHMM = (iso?: string | null): string => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const BLUE = '#3b82f6';
const GREY = '#e2e8f0';

const OrderTracking = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [eta, setEta] = useState<EtaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEta = useCallback(async () => {
        if (!orderId) return;
        try {
            setError(null);
            const data = await apiClient<EtaResponse>(`/customer/orders/${orderId}/eta`);
            setEta(data);
        } catch (err) {
            const e = err as { response?: { status?: number; data?: { message?: string } } };
            console.error('Failed to load ETA:', e.response?.status, e.response?.data);
            setError(e.response?.data?.message ?? 'Could not load the delivery estimate.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEta();
        // Keep the status + estimate fresh.
        const id = setInterval(fetchEta, 30000);
        return () => clearInterval(id);
    }, [fetchEta]);

    const isCanceled = eta?.status === 'CANCELED';
    const isDelivered = eta?.status == 'DELIVERED';
    const currentStep = stepIndexFor(eta?.status);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px', fontFamily: 'sans-serif', color: '#0f172a' }}>
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0 }}>Track your order</h1>
                    <button onClick={() => navigate('/')} style={{ padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        &larr; Menu
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '48px 0', fontWeight: 600 }}>Loading…</div>
                ) : error ? (
                    <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                        <p style={{ color: '#dc2626', fontWeight: 600, margin: '0 0 12px' }}>{error}</p>
                        <button onClick={fetchEta} style={{ padding: '8px 16px', background: BLUE, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
                    </div>
                ) : eta && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* ---------------- SUCCESS UI ---------------- */}
                        {isDelivered ? (
                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '40px 28px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', margin: '0 0 8px' }}>Food Delivered!</h2>
                                <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.5 }}>
                                    Your order has successfully arrived. Enjoy your meal!
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    style={{ width: '100%', padding: '14px', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Order Again
                                </button>
                            </div>
                        ) : (
                            /* ---------------- ACTIVE TRACKING UI ---------------- */
                            <>
                                {/* Progress / status card */}
                                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCanceled ? 0 : 28 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ORDER #{eta.orderId}</span>
                                    </div>

                                    {isCanceled ? (
                                        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>Order canceled</div>
                                            <p style={{ color: '#64748b', margin: '6px 0 0' }}>This order has been canceled.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                            {STATUS_STEPS.map((step, i) => {
                                                const done = i < currentStep;
                                                const active = i === currentStep;
                                                const reached = i <= currentStep;
                                                const nodeColor = reached ? BLUE : GREY;
                                                return (
                                                    <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                                        {i > 0 && (
                                                            <div style={{ position: 'absolute', top: 15, right: '50%', width: '100%', height: 3, background: i <= currentStep ? BLUE : GREY }} />
                                                        )}
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%', zIndex: 1,
                                                            background: reached ? BLUE : '#fff',
                                                            border: `3px solid ${nodeColor}`,
                                                            color: reached ? '#fff' : '#94a3b8',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 800, fontSize: '0.85rem',
                                                            boxShadow: active ? `0 0 0 4px ${BLUE}33` : 'none',
                                                        }}>
                                                            {done ? '✓' : i + 1}
                                                        </div>
                                                        <div style={{ marginTop: 8, fontSize: '0.72rem', textAlign: 'center', lineHeight: 1.2, fontWeight: active ? 800 : 600, color: active ? BLUE : reached ? '#334155' : '#94a3b8' }}>
                                                            {step.label}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* ETA card */}
                                {!isCanceled && (
                                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        {eta.available ? (
                                            <>
                                                <p style={{ color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>Estimated arrival</p>
                                                <div style={{ fontSize: '2.6rem', fontWeight: 900, color: BLUE, lineHeight: 1.1, marginBottom: 20 }}>
                                                    {toHHMM(eta.etaFrom)} <span style={{ color: '#94a3b8' }}>–</span> {toHHMM(eta.etaTo)}
                                                </div>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Preparation</div>
                                                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{eta.prepMinutes} min</div>
                                                    </div>
                                                    <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Ride (motorcycle)</div>
                                                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>~{eta.travelMinutes} min</div>
                                                    </div>
                                                </div>
                                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 18, marginBottom: 0 }}>
                                                    Estimated from the store to your delivery address by motorcycle. Updates automatically.
                                                </p>
                                            </>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                                <p style={{ color: '#b45309', fontWeight: 600, margin: '0 0 6px' }}>Estimate unavailable</p>
                                                <p style={{ color: '#64748b', margin: 0 }}>{eta.message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;