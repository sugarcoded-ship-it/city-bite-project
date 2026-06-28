import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './features/dashboard/components/HomeDispatcher.tsx';
import { Placeholder } from './components/Placeholder.tsx';
import OrderHistory from './order-history/OrderHistory.tsx';
import { ProtectedRoute } from './lib/ProtectedRoute'

// Owner pages
import { MenuConfiguration } from './features/dashboard/components/OwnerDashboard/MenuConfiguration';
import { StaffList } from './features/staff/components/StaffList/StaffList';
import './App.css'
import {StaffDetail} from "./features/staff/components/StaffDetail/StaffDetail.tsx";

function App() {
    return (
        <Routes>
            {/* Root — renders the correct dashboard based on the user's role */}
            <Route path="/" element={<HomeDispatcher />} />
            <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                <Route path="/menu"         element={<MenuConfiguration />} />
                <Route path="/staff"        element={<StaffList />} />
                <Route path="/staff/:id"    element={<StaffDetail />} />
                <Route path="/dayoff"       element={<Placeholder pageName="Day-Off Requests" />} />
                <Route path="/store-status" element={<Placeholder pageName="Store Status" />} />
                <Route path="/analytics"    element={<Placeholder pageName="Analytics" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'OWNER']} />}>
                <Route path="/order"        element={<Placeholder pageName="Order" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'OWNER']} />}>
                <Route path="/history"        element={<OrderHistory />} />
                <Route path="/payment-method" element={<Placeholder pageName="Payment" />} />
            </Route>

            {/* Shared Routes (all roles) */}
            <Route path="/profile" element={<Placeholder pageName="My Profile" />} />

            {/* Legacy redirects */}
            <Route path="/staff-list" element={<Navigate to="/staff" replace />} />

            {/* Wildcard fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
export default App