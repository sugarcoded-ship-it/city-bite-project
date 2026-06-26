import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
    pageName: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ pageName }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            padding: '24px',
            gap: '12px',
        }}>
            <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c7d2fe, #a5b4fc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '8px',
                boxShadow: '0 8px 24px rgba(99,102,241,0.18)',
            }}>
                🚧
            </div>
            <h1 style={{
                margin: 0,
                color: '#1e293b',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
            }}>
                {pageName}
            </h1>
            <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '0.95rem',
                textAlign: 'center',
                maxWidth: '380px',
                lineHeight: 1.6,
            }}>
                This feature is currently under development and will be available soon.
            </p>
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginTop: '16px',
                    padding: '10px 28px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                }}
            >
                ← Go Back
            </button>
        </div>
    );
};
