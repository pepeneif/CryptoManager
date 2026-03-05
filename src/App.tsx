import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Cuentas from './components/Cuentas'
import Clientes from './components/Clientes'
import Proveedores from './components/Proveedores'
import Facturas from './components/Facturas'
import Layout from './components/Layout'
import Movimientos from './components/Movimientos'
import Transfer from './components/Transfer'
import Usuarios from './components/Usuarios'
import Settings from './components/Settings'
import Tasks from './components/Tasks'
import Programacion from './components/Programacion'
import DatosEmpresa from './components/DatosEmpresa'
import Grupos from './components/Grupos'
import CoinsTokens from './components/CoinsTokens'
import Referencias from './components/Referencias'
import Reportes from './components/Reportes'
import Pagos from './components/Pagos'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cuentas/:empresaId" 
          element={token ? <Layout token={token}><Cuentas token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/clientes/:empresaId" 
          element={token ? <Layout token={token}><Clientes token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/proveedores/:empresaId" 
          element={token ? <Layout token={token}><Proveedores token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/facturas/:empresaId" 
          element={token ? <Layout token={token}><Facturas token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/movimientos/:empresaId/:cuentaId" 
          element={token ? <Layout token={token}><Movimientos token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/transferir/:empresaId/:cuentaId" 
          element={token ? <Layout token={token}><Transfer token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/usuarios/:empresaId" 
          element={token ? <Layout token={token}><Usuarios token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings/:empresaId" 
          element={token ? <Layout token={token}><Settings token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/tasks/:empresaId" 
          element={token ? <Layout token={token}><Tasks token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/pagos/:empresaId" 
          element={token ? <Layout token={token}><Pagos token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/autorizaciones/:empresaId" 
          element={token ? <Layout token={token}><Programacion token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/datos-empresa/:empresaId" 
          element={token ? <Layout token={token}><DatosEmpresa token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/grupos/:empresaId" 
          element={token ? <Layout token={token}><Grupos token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/coins-tokens/:empresaId" 
          element={token ? <Layout token={token}><CoinsTokens token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/referencias/:empresaId" 
          element={token ? <Layout token={token}><Referencias token={token} /></Layout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reportes/:empresaId" 
          element={token ? <Layout token={token}><Reportes token={token} /></Layout> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App