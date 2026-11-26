
import { Routes, Route } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Vendas from './pages/Vendas'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import Despesas from './pages/Despesas'

import Login from './auth/Login'
import Cadastro from './auth/Cadastro'
import ProtectedRoute from './auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Páginas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/despesas" element={<Despesas />} />
      </Route>
    </Routes>
  )
}

export default App
