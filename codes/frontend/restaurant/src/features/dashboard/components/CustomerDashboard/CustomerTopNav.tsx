import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    UtensilsCrossed,
    ClockArrowUp,
    User
} from 'lucide-react';
import keycloak from '../../../../lib/keycloak';
import styles from './CustomerTopNav.module.css';

interface CustomerTopNavProps {
    cartCount?: number;
    customerName?: string; // Added optional prop to pass name explicitly
}

export function CustomerTopNav({customerName }: CustomerTopNavProps) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // State to handle opening and closing the profile dropdown menu
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const links = [
        { label: 'Menu', icon: UtensilsCrossed, path: '/' },
        { label: 'History', icon: ClockArrowUp, path: '/history' },
    ];

    const isProfileActive = pathname === '/profile';

    const displayName = customerName ||
        keycloak.tokenParsed?.given_name ||
        keycloak.tokenParsed?.name ||
        'Account';

    return (
        <header className={styles.header}>
            <div className={styles.container}>

                {/* Left: Brand / Logo */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-start focus:outline-none py-1"
                >
                    <img
                        src="/citybite-logo-navy-alt.png"
                        alt="City Bite Logo"
                        className="h-14 w-auto object-contain max-h-full transition-transform hover:scale-[1.02]"
                    />
                </button>

                {/* Right: Nav links, Cart, & Profile Dropdown */}
                <nav className={styles.navGroup}>
                    {links.map(({ label, icon: Icon, path }) => {
                        const active = pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                            >
                                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                                <span className={styles.linkLabel}>{label}</span>
                            </button>
                        );
                    })}

                    {/* Profile Dropdown Container */}
                    <div className="relative inline-block text-left">
                        {/* Dropdown Trigger Button */}
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={styles.cartButton}
                        >

                            <User size={18} strokeWidth={isProfileActive ? 2.5 : 2} />
                            {/* Dynamically displays the user's name instead of 'Profile' */}
                            <span className={styles.linkLabel}>{displayName}</span>
                        </button>

                        {/* Dropdown Menu Items */}
                        {isDropdownOpen && (
                            <>
                                {/* Invisible overlay to close dropdown if clicking outside */}
                                <div
                                    className="fixed inset-0 z-40 cursor-default"
                                    onClick={() => setIsDropdownOpen(false)}
                                />

                                {/* Floating Menu Box */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-gray-700 font-sans">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate('/profile');
                                        }}
                                        className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        View Profile
                                    </button>

                                    <hr className="border-gray-100 my-1" />

                                    <button
                                        onClick={async () => {
                                            setIsDropdownOpen(false);
                                            await keycloak.logout({
                                                redirectUri: window.location.origin
                                            });
                                        }}
                                        className="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                </nav>
            </div>
        </header>
    );
}