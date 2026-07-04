import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Package, User, LogOut } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client.ts';
import keycloak from '../../../../lib/keycloak.ts';
import { hasRole } from '../../../../lib/roles.ts';

interface StockResponse {
  amount: number;
}

interface StaffOrderResponse {
  status: string;
}

const LOW_STOCK_THRESHOLD = 15;

export function StaffTopNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOwner = hasRole('OWNER');

  const [lowStock, setLowStock] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);

  const fetchCounts = useCallback(async () => {
    try {
      const items = await apiClient<StockResponse[]>('/staff/stocks/items');
      setLowStock((items || []).filter((i) => i.amount <= LOW_STOCK_THRESHOLD).length);
    } catch (err) {
      console.error('Failed to fetch stock levels:', err);
    }
    try {
      const orders = await apiClient<StaffOrderResponse[]>('/staff/orders/active');
      setActiveOrders((orders || []).length);
    } catch (err) {
      console.error('Failed to fetch active orders:', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const links = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard', badge: activeOrders },
    { label: 'Stock', icon: Package, path: '/staff/stock', badge: lowStock },
    { label: 'Profile', icon: User, path: '/staff/profile', badge: 0 },
  ];

  const handleLogout = () => keycloak.logout({ redirectUri: window.location.origin });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1F4D] shadow-lg">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-3">

        {/* Left: Logo + Owner back-link */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src="/citybite-logo-navy-alt.png"
              alt="City Bite Logo"
              className="h-9 w-auto object-contain"
            />
            <span className="text-blue-300 text-[10px] font-bold tracking-widest uppercase hidden sm:block">
              Staff Portal
            </span>
          </button>

          {isOwner && (
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-full text-white text-xs font-bold transition-colors"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:block">Owner Home</span>
            </button>
          )}
        </div>

        {/* Right nav */}
        <nav className="flex items-center gap-1">
          {links.map(({ label, icon: Icon, path, badge }) => {
            const active = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#2D7FF9] text-white'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                <span className="hidden sm:block">{label}</span>
                {!!badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            title="Logout"
            className="w-9 h-9 ml-1 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
          >
            <LogOut size={17} />
          </button>
        </nav>
      </div>
    </header>
  );
}