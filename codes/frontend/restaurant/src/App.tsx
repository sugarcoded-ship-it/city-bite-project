import { Routes, Route, Navigate } from 'react-router-dom';
import { HomeDispatcher } from './features/dashboards/HomeDispatcher/HomeDispatcher.tsx';
import { ProtectedRoute } from './lib/ProtectedRoute'
import { OwnerDayOffRequest } from './features/leave-requests/OwnerDayOffRequest/OwnerDayOffRequest';

// Owner pages
import { MenuConfiguration } from './features/menu/MenuConfiguration/MenuConfiguration';
import { StaffList } from './features/staff-management/StaffList/StaffList';
import { StaffDetail } from './features/staff-management/StaffDetail/StaffDetail'
import { OwnerDashboard } from './features/dashboards/OwnerDashboard/OwnerDashboard.tsx';
import { StoreDetail } from './features/store/StoreDetail/StoreDetail';

// Staff pages
import { StaffDashboard } from './features/dashboards/StaffDashboard/StaffDashboard.tsx';
import { StaffStock } from './features/stock/StaffStock/StaffStock';
import { StaffProfile } from './features/profiles/StaffProfile/StaffProfile.tsx';
import { StaffDayOffRequests } from './features/leave-requests/StaffDayOffRequests/StaffDayOffRequests';

// Customer pages
import { OrderHistory } from './features/orders/OrderHistory/OrderHistory.tsx';
import { OrderSummary } from "./features/orders/OrderSummary/OrderSummary.tsx";
import { PaymentProcessPage } from "./features/orders/PaymentProcess/PaymentProcess.tsx";
import { Done } from "./features/orders/Done/Done.tsx";
import { CustomerProfile } from "./features/profiles/CustomerProfile/CustomerProfile.tsx";
import { OrderTracking } from "./features/orders/OrderTracking/OrderTracking.tsx"

import './App.css'

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
                <Route path="/owner/dayoff"       element={<OwnerDayOffRequest />} />
                <Route path="/owner/store"        element={<StoreDetail />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'OWNER']} />}>
                <Route path="/staff/dashboard"    element={<StaffDashboard />} />
                <Route path="/staff/profile"      element={<StaffProfile />} />
                <Route path="/staff/stock"        element={<StaffStock />} />
                <Route path="/staff/dayoff"       element={<StaffDayOffRequests />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'OWNER']} />}>
                <Route path="/history"            element={<OrderHistory />} />
                <Route path="/order-summary"      element={<OrderSummary />} />
                <Route path="/payment-process"    element={<PaymentProcessPage />} />
                <Route path="/done"               element={<Done />} />
                <Route path="/profile"            element={<CustomerProfile />} />
                <Route path="/track/:orderId"     element={<OrderTracking />} />
            </Route>

            {/* Wildcard fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
export default App