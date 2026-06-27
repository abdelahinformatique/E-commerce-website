import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login            from './Login.jsx'
import Register         from './Register.jsx'
import Catalog          from './Catalog.jsx'
import Cart             from './Cart.jsx'
import ClientDashboard  from './ClientDashboard.jsx'
import MerchantDashboard from './MerchantDashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/"           element={<Catalog />} />
      <Route path="/panier"     element={<Cart />} />
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />
      <Route path="/mon-compte" element={<RoleRoute role="client"><ClientDashboard /></RoleRoute>} />
      <Route path="/commercant" element={<RoleRoute role="commercant"><MerchantDashboard /></RoleRoute>} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RoleRoute({ children, role }) {
  const token    = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')
  if (!token)          return <Navigate to="/login"  replace />
  if (userRole !== role) return <Navigate to="/"     replace />
  return children
}

export default App
