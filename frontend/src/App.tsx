import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailPage from './pages/PaymentFailPage'
import PaymentResultPage from './pages/PaymentResultPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pay/:uuid" element={<PaymentPage />} />
        <Route path="/pay/:uuid/success" element={<PaymentSuccessPage />} />
        <Route path="/pay/:uuid/fail" element={<PaymentFailPage />} />
        <Route path="/result/:uuid" element={<PaymentResultPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

export default App
