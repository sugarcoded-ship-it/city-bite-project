import { Routes, Route, Navigate } from 'react-router-dom';
import HomeDispatcher from './home/HomeDispatcher.tsx';
import './App.css'
import OrderSummaryPage from "./OrderSummaryPage.tsx";

console.log("MY ENV VAR:", import.meta.env);

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomeDispatcher />} />

            <Route path="/" element={<OrderSummaryPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;