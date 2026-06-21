import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './home/HomeDispatcher.tsx';
import { StaffStock } from './stock/StaffStock';

import './App.css'

function App() {
    return (
    <Routes>
        <Route path="/" element={<HomeDispatcher />} />

        {/* Wildcard fallback: If they type any other URL, loop them back to the dispatcher */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/staff/stock" element={<StaffStock />} />
    </Routes>


    );
}
export default App