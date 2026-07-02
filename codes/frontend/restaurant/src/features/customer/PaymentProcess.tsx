import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';

export const PaymentProcessPage: React.FC = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/order-summary');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center" style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                <h1 className="text-2xl font-extrabold text-[#0B1F4D] mb-8">Payment Process</h1>

                <div className="flex flex-col items-center">
                    <div className="bg-purple-50 p-8 rounded-2xl mb-6 border-2 border-purple-100 shadow-inner">
                        <QrCode size={180} className="text-purple-600" />
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-gray-600 font-medium mb-2">Scan QR Code to Pay</p>
                        <p className="text-4xl font-extrabold text-red-500 tabular-nums tracking-tight">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-3">Time remaining</p>
                    </div>

                    <button
                        onClick={() => navigate('/done')}
                        className="w-full bg-[#2D7FF9] hover:bg-[#1a6de0] text-white font-extrabold py-3.5 rounded-2xl transition-colors shadow-md text-sm"
                    >
                        I've already paid
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-gray-400 hover:text-gray-600 text-xs font-bold transition-colors"
                    >
                        Cancel Payment
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
        </div>
    );
}

export default PaymentProcessPage;