import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './features/dashboard/components/HomeDispatcher.tsx';
import { StaffDetail } from './features/staff/components/StaffDetail/StaffDetail';
import { StaffList } from './features/staff/components/StaffList/StaffList';
import './App.css'

function App() {
    return (
    <Routes>
        <Route path="/" element={<HomeDispatcher />} />
        <Route path="/staff-list" element={<StaffList />} />
        <Route path="/staff-detail/:id" element={<StaffDetail />} />

        {/* Wildcard fallback: If they type any other URL, loop them back to the dispatcher */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    );
}
export default App