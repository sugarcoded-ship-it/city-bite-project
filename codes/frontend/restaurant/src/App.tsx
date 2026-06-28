import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './features/dashboard/components/HomeDispatcher.tsx';
import { Placeholder } from './components/Placeholder.tsx';
import { ProtectedRoute } from './lib/ProtectedRoute'

// Owner pages
import { MenuConfiguration } from './features/dashboard/components/OwnerDashboard/MenuConfiguration';
import { StaffList } from './features/staff/components/StaffList/StaffList';
import { OwnerDashboard } from './features/dashboard/components/OwnerDashboard/OwnerDashboard.tsx';

// Staff pages
import { StaffDashboard } from './features/dashboard/components/StaffDashboard/StaffDashboard.tsx';

import './App.css'

function App() {
    return (
        <Routes>
            {/* Root — renders the correct dashboard based on the user's role */}
            <Route path="/" element={<HomeDispatcher />} />
            <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                <Route path="owner/dashboard"    element={<OwnerDashboard />} />
                <Route path="owner/menu"         element={<MenuConfiguration />} />
                <Route path="owner/staff"        element={<StaffList />} />
                {/* <Route path="owner/staff/:id"    element={<StaffDetail />} /> */}
                <Route path="owner/dayoff"       element={<Placeholder pageName="Day-Off Requests" />} />
                <Route path="owner/store-status" element={<Placeholder pageName="Store Status" />} />
                <Route path="owner/analytics"    element={<Placeholder pageName="Analytics" />} />
                <Route path="owner/profile"      element={<Placeholder pageName="My Profile (Owner)" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'OWNER']} />}>
                <Route path="staff/dashboard"    element={<StaffDashboard />} />
                <Route path="staff/profile"      element={<Placeholder pageName="My Profile (Staff)" />} />
                <Route path="staff/order"        element={<Placeholder pageName="Order" />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'OWNER']} />}>
                <Route path="/history"        element={<Placeholder pageName="Order History" />} />
                <Route path="/payment-method" element={<Placeholder pageName="Payment" />} />
                <Route path="/profile"        element={<Placeholder pageName="My Profile (Customer)" />} />
            </Route>

            {/* Wildcard fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
export default App