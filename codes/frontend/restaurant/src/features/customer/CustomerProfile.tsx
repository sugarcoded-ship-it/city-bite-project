import { useEffect, useState, useCallback } from 'react';
import {
    Edit2, Save, X, Check,
    User, Mail, Phone, AtSign, AlertCircle,
    Wallet, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client.ts';
import { CustomerTopNav } from './CustomerTopNav.tsx';

interface CustomerProfileResponse {
    firstName: string | null;
    lastName: string | null;
    username: string;
    email: string;
    phoneNumber: string | null;
}

interface CreditHistoryEntry {
    type: 'EARNED' | 'SPENT';
    amount: number;
    orderId: number | null;
    description: string | null;
    createdAt: string;
}

interface CreditHistoryPage {
    content: CreditHistoryEntry[];
}

export default function CustomerProfile() {
    const [profile, setProfile] = useState<CustomerProfileResponse | null>(null);
    const [draftPhone, setDraftPhone] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [creditBalance, setCreditBalance] = useState<number>(0);
    const [creditHistory, setCreditHistory] = useState<CreditHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const profileData = await apiClient<CustomerProfileResponse>('/customer/profile');
            setProfile(profileData);
            setDraftPhone(profileData.phoneNumber || '');
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Unable to load your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCredit = useCallback(async () => {
        try {
            const [balanceData, historyData] = await Promise.all([
                apiClient<{ currentBalance: number }>('/customer/credits/balance'),
                apiClient<CreditHistoryPage>('/customer/credits/history?page=0&size=20'),
            ]);
            setCreditBalance(balanceData.currentBalance);
            setCreditHistory(historyData.content);
        } catch (err) {
            console.error('Failed to load credit history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProfile();
        fetchCredit();
    }, [fetchProfile, fetchCredit]);

    const isPhoneValid = draftPhone.length === 0 || draftPhone.length === 10;

    const handleSave = async () => {
        if (!profile) return;
        if (!isPhoneValid) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }
        setSaving(true);
        try {
            const updated = await apiClient<CustomerProfileResponse>('/customer/profile', {
                method: 'PATCH',
                data: { phoneNumber: draftPhone.trim() || null },
            });
            setProfile(updated);
            setDraftPhone(updated.phoneNumber || '');
            setIsEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Unable to save your changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraftPhone(profile?.phoneNumber || '');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
                <CustomerTopNav />
                <div className="max-w-3xl mx-auto px-5 pt-24 pb-10 text-center text-gray-400">Loading profile...</div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
                <CustomerTopNav />
                <div className="max-w-3xl mx-auto px-5 pt-24 pb-10">
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const initials = (
        (profile.firstName?.[0] || profile.username[0] || '?') +
        (profile.lastName?.[0] || '')
    ).toUpperCase();

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username;

    const READONLY_FIELDS = [
        { key: 'firstName', label: 'First Name', icon: User, value: profile.firstName || '—' },
        { key: 'lastName', label: 'Last Name', icon: User, value: profile.lastName || '—' },
        { key: 'username', label: 'Username', icon: AtSign, value: profile.username },
        { key: 'email', label: 'Email', icon: Mail, value: profile.email },
    ];

    return (
        <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <CustomerTopNav customerName={fullName} />

            <div className="max-w-3xl mx-auto px-5 md:px-8 pt-24 pb-10 space-y-4">

                <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-[#0B1F4D] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl md:text-2xl font-extrabold tracking-tight">{initials}</span>
                    </div>
                    <div>
                        <h1 className="text-[#0B1F4D] text-xl md:text-3xl font-extrabold leading-tight">{fullName}</h1>
                        <p className="text-gray-400 text-sm md:text-base">@{profile.username}</p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b border-gray-50">
                        <h2 className="text-[#0B1F4D] font-extrabold md:text-lg">Account Info</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 bg-[#f0f2f7] hover:bg-gray-200 text-[#0B1F4D] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                            >
                                <Edit2 size={12} /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <X size={12} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !isPhoneValid}
                                    className="flex items-center gap-1 bg-[#0B1F4D] hover:bg-[#2D7FF9] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    <Save size={12} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="divide-y divide-gray-50">
                        {READONLY_FIELDS.map(({ key, label, icon: Icon, value }) => (
                            <div key={key} className="flex items-center gap-4 px-5 md:px-8 py-4 md:py-5">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f0f2f7] flex items-center justify-center flex-shrink-0">
                                    <Icon size={14} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 text-[11px] font-semibold mb-0.5">{label}</p>
                                    <p className="text-[#0B1F4D] text-sm md:text-base font-semibold truncate">{value}</p>
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-4 px-5 md:px-8 py-4 md:py-5">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f0f2f7] flex items-center justify-center flex-shrink-0">
                                <Phone size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-[11px] font-semibold mb-0.5">Phone</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={draftPhone}
                                        onChange={(e) => {
                                            const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setDraftPhone(cleanValue);
                                        }}
                                        placeholder="e.g. 0812345678"
                                        maxLength={10}
                                        pattern="^[0-9]{10}$"
                                        title="Please enter a valid phone number containing exactly 10 digits."
                                        className={`w-full md:max-w-xs border rounded-xl px-3 py-1.5 md:py-2 text-sm md:text-base text-[#0B1F4D] font-semibold focus:outline-none focus:ring-2 transition-all ${
                                            isPhoneValid
                                                ? 'border-gray-200 focus:border-[#2D7FF9] focus:ring-[#2D7FF9]/15'
                                                : 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                                        }`}
                                    />
                                ) : null}
                                {isEditing && !isPhoneValid && (
                                    <p className="text-red-500 text-[11px] font-semibold mt-1">
                                        Enter exactly 10 digits.
                                    </p>
                                )}
                                {!isEditing && (
                                    <p className="text-[#0B1F4D] text-sm font-semibold truncate">{profile.phoneNumber || '—'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                            <Wallet size={16} className="text-[#0B1F4D]" />
                            <h2 className="text-[#0B1F4D] font-extrabold md:text-lg">Store Credit</h2>
                        </div>
                        <p className="text-[#0B1F4D] font-extrabold text-lg">฿{creditBalance.toFixed(2)}</p>
                    </div>

                    {historyLoading ? (
                        <div className="px-5 md:px-8 py-6 text-center text-gray-400 text-sm">Loading history...</div>
                    ) : creditHistory.length === 0 ? (
                        <div className="px-5 md:px-8 py-6 text-center text-gray-400 text-sm">No credit activity yet.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {creditHistory.map((entry, idx) => {
                                const isEarned = entry.type === 'EARNED';
                                return (
                                    <div key={idx} className="flex items-center gap-4 px-5 md:px-8 py-3.5 md:py-4">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEarned ? 'bg-green-50' : 'bg-red-50'}`}>
                                            {isEarned ? (
                                                <ArrowDownCircle size={16} className="text-green-500" />
                                            ) : (
                                                <ArrowUpCircle size={16} className="text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#0B1F4D] text-sm font-semibold truncate">
                                                {entry.description ?? (isEarned ? 'Credit received' : 'Credit used')}
                                                {entry.orderId != null && (
                                                    <span className="text-gray-400 font-normal"> · Order #{entry.orderId}</span>
                                                )}
                                            </p>
                                            <p className="text-gray-400 text-[11px]">
                                                {new Date(entry.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <p className={`font-extrabold text-sm flex-shrink-0 ${isEarned ? 'text-green-600' : 'text-red-500'}`}>
                                            {isEarned ? '+' : '-'}฿{entry.amount.toFixed(2)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {saved && (
                <div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0B1F4D] text-white text-sm font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 whitespace-nowrap"
                    style={{ animation: 'fadeUp 0.3s ease' }}
                >
                    <span className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={10} strokeWidth={3} className="text-white" />
                    </span>
                    Profile saved
                </div>
            )}

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
}