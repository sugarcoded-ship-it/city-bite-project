import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LogoutButton } from '../authentication/LogoutButton';
import styles from './CustomerHome.module.css';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    menuPic: string | null;
}

const CATEGORIES = ['Appetizer', 'Main Dish', 'Broth', 'Side Dish', 'Dessert', 'Drink', "Chef's Special"];

export const CustomerHome = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient('/customer/').catch((err) => console.error('Customer sync failed:', err));
    }, []);

    useEffect(() => {
        const endpoint = selectedCategory
            ? `/customer/menu?category=${encodeURIComponent(selectedCategory)}`
            : '/customer/menu';

        apiClient<MenuItem[]>(endpoint)
            .then((res) => {
                setItems(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Menu loading failed:', err);
                setError('Failed to load menu.');
                setLoading(false);
            });
    }, [selectedCategory]);

    return (
        <div className={styles.container}>
            <LogoutButton />

            <h1 className={styles.title}>Menu</h1>
            <hr className={styles.divider} />

            <div className={styles.filterRow}>
                <button
                    className={`${styles.filterButton} ${selectedCategory === null ? styles.filterButtonActive : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </button>
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        className={`${styles.filterButton} ${selectedCategory === category ? styles.filterButtonActive : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* loading/error states... */}

            {!loading && !error && (
                <div className={styles.menuGrid}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.menuCard}>
                            {item.menuPic && (
                                <img src={item.menuPic} alt={item.name} className={styles.menuImage} />
                            )}
                            <div className={styles.menuInfo}>
                                <p className={styles.menuName}>{item.name}</p>
                                <p className={styles.menuPrice}>${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};