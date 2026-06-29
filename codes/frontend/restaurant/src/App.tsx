import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './features/dashboard/components/HomeDispatcher.tsx';
import { Placeholder } from './components/Placeholder.tsx';

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

            <Route path="/menu"         element={<MenuConfiguration />} />
            <Route path="/staff"        element={<StaffList />} />
            <Route path="/staff/:id"    element={<StaffDetail />} />
            <Route path="/dayoff"       element={<Placeholder pageName="Day-Off Requests" />} />
            <Route path="/store-status" element={<Placeholder pageName="Store Status" />} />
            <Route path="/analytics"    element={<Placeholder pageName="Analytics" />} />

            <Route path="/order"        element={<Placeholder pageName="Order" />} />

            <Route path="/history"        element={<Placeholder pageName="Order History" />} />
            <Route path="/payment-method" element={<Placeholder pageName="Payment" />} />

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