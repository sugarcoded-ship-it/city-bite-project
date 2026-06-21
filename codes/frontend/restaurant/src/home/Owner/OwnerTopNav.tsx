import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronDown,
    LogOut,
    UtensilsCrossed,
    Users,
    BarChart3,
    Store,
    CalendarOff
} from 'lucide-react';
import keycloak from '../../security/keycloak';


export function OwnerTopNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const links = [
        { label: 'Menu', icon: UtensilsCrossed, path: '/owner/dashboard' },
        { label: 'Staff', icon: Users, path: '/owner/staff' },
        { label: 'Day-Off', icon: CalendarOff, path: '/owner/dayoff' },
        { label: 'Store', icon: Store, path: '/owner/store-status' },
        { label: 'Analytics', icon: BarChart3, path: '/owner/analytics' },
    ];

    // Close the dropdown if the user clicks anywhere outside of it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        keycloak.logout({
            redirectUri: window.location.origin
        });
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1F4D] shadow-lg">
            <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

                <button
                    onClick={() => navigate('/owner/dashboard')}
                    className="flex items-center justify-start focus:outline-none py-1"
                >
                    <img
                        src="/citybite-logo-navy-alt.png"
                        alt="City Bite Logo"
                        className="h-14 w-auto object-contain max-h-full transition-transform hover:scale-[1.02]"
                    />
                </button>

                {/* Center Navigation links with lift movement effect */}
                <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
                    {links.map(({ label, icon: Icon, path }) => {
                        const active = pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 border-none cursor-pointer transform hover:-translate-y-0.5 ${
                                    active
                                        ? 'bg-white/15 text-white shadow-sm'
                                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />
                                <span className="hidden md:block">{label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Right side - Store Pill & Profile Dropdown */}
                <div className="flex items-center gap-4 flex-shrink-0">

                    {/* Profile Dropdown Trigger with shift effect */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-1 rounded-xl hover:bg-white/10 transition-all duration-200 transform hover:-translate-y-0.5"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <img
                                src="https://ui-avatars.com/api/?name=IT+Man&background=f3f4f6&color=0B1F4D&bold=true"
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover shadow"
                            />
                            <ChevronDown
                                size={14}
                                className={`text-blue-200 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Floating Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-gray-100 rounded-xl shadow-xl min-w-[160px] p-1 flex flex-col z-50 animate-[slideDown_0.2s_ease_forwards] origin-top-right">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 border-none bg-transparent text-red-500 font-semibold text-xs rounded-lg cursor-pointer hover:bg-red-50 transition-colors text-left"
                                >
                                    <LogOut size={14} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Embedded styles for utility scroll-hiding */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes slideDown {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </header>
    );
}