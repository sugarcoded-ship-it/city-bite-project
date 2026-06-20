import { useNavigate, useLocation } from 'react-router-dom';
import {
    ShoppingCart,
    UtensilsCrossed,
    ClockArrowUp,
    User,
    Search,
    SlidersHorizontal
} from 'lucide-react';
import styles from './CustomerTopNav.module.css';

interface CustomerTopNavProps {
    cartCount?: number;
}

export function CustomerTopNav({ cartCount = 0 }: CustomerTopNavProps) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const links = [
        { label: 'Menu', icon: UtensilsCrossed, path: '/customer/home' },
        { label: 'History', icon: ClockArrowUp, path: '/customer/history' },
        { label: 'Profile', icon: User, path: '/customer/profile' },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.container}>

                {/* Left: Brand / Logo */}
                <button
                    onClick={() => navigate('/customer/home')}
                    className={styles.brandButton}
                >
                    <div className={styles.logoWrapper}>
                        {/* Changed logo to White Background, Navy Text */}
                        <img
                            src="https://ui-avatars.com/api/?name=AW&background=fff&color=0B1F4D"
                            alt="A&W Logo"
                            className={styles.logoImage}
                        />
                    </div>
                    <span className={styles.brandName}>
                        Savoury
                    </span>
                </button>

                {/* Middle: Search Bar */}
                <div className={styles.searchWrapper}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className={styles.searchInput}
                        />
                        <button className={styles.filterButton}>
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>

                {/* Right: Nav links & Cart */}
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

                    {/* Cart button */}
                    <button
                        onClick={() => navigate('/customer/cart')}
                        className={styles.cartButton}
                    >
                        <ShoppingCart size={18} strokeWidth={2.5} />
                        <span className={styles.linkLabel}>Cart</span>
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </button>
                </nav>
            </div>
        </header>
    );
}