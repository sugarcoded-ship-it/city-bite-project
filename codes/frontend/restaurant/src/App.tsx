import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './features/dashboard/components/HomeDispatcher.tsx';
import { Placeholder } from './components/Placeholder.tsx';
import { ProtectedRoute } from './lib/ProtectedRoute'

// Owner pages
import { MenuConfiguration } from './features/dashboard/components/OwnerDashboard/MenuConfiguration';
import { StaffList } from './features/staff/components/StaffList/StaffList';
import { StaffDetail } from './features/staff/components/StaffDetail/StaffDetail'
import { OwnerDashboard } from './features/dashboard/components/OwnerDashboard/OwnerDashboard.tsx';
import { OwnerAnalytics } from './features/dashboard/components/OwnerDashboard/OwnerAnalytics';
import { OwnerDayOff } from './features/dashboard/components/OwnerDashboard/OwnerDayOff';
import { StoreDetail } from './features/store/components/StoreDetail/StoreDetail';

// Staff pages
import { StaffDashboard } from './features/dashboard/components/StaffDashboard/StaffDashboard.tsx';
import { StaffStock } from './stock/StaffStock';
import StaffProfile from './features/dashboard/components/StaffProfile/StaffProfile.tsx';

// Customer pages
import OrderHistory from './order-history/OrderHistory.tsx';
import './App.css'
import OrderSummary from "./features/customer/OrderSummary.tsx";
import PaymentProcessPage from "./features/customer/PaymentProcess.tsx";
import Done from "./features/customer/Done.tsx";
import CustomerProfile from "./features/customer/CustomerProfile.tsx";

function App() {
    return (
        <Routes>
            {/* Root — renders the correct dashboard based on the user's role */}
            <Route path="/" element={<HomeDispatcher />} />

            <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                <Route path="/owner/dashboard"    element={<OwnerDashboard />} />
                <Route path="/owner/menu"         element={<MenuConfiguration />} />
                <Route path="/owner/staff"        element={<StaffList />} />
                <Route path="/owner/staff/:id"    element={<StaffDetail />} />
                <Route path="/owner/dayoff"       element={<OwnerDayOff />} />
                <Route path="/owner/store"        element={<StoreDetail />} />
                <Route path="/owner/analytics"    element={<OwnerAnalytics />} />
                <Route path="/owner/profile"      element={<Placeholder pageName="My Profile (Owner)" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'OWNER']} />}>
                <Route path="/staff/dashboard"    element={<StaffDashboard />} />
                <Route path="/staff/profile"      element={<StaffProfile />} />
                <Route path="/staff/stock"    element={<StaffStock />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'OWNER']} />}>
                <Route path="/history"        element={<OrderHistory />} />
                <Route path="/order-summary" element={<OrderSummary />} />
                <Route path="/payment-method" element={<Placeholder pageName="Payment" />} />
                <Route path="/payment-process" element={<PaymentProcessPage />} />
                <Route path="/done" element={<Done />} />
                <Route path="/profile"        element={<CustomerProfile />} />
            </Route>

            {/* Wildcard fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
export default App