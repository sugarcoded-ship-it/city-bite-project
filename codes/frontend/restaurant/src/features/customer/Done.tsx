import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function Done() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={64} className="text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Done!</h1>
                    <p className="text-gray-600 mb-8">
                        Your order has been placed successfully.
                    </p>

                    {/* Order More Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 mb-3 font-bold transition-colors text-center shadow-md block"
                    >
                        Order More
                    </button>

                    {/* View Order History Button */}
                    <button
                        onClick={() => navigate('/history')}
                        className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-xl hover:bg-blue-50 mb-3 font-bold transition-colors text-center block"
                    >
                        View Order History
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Done;