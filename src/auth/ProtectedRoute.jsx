
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

function ProtectedRoute() {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return <p>Verificando acesso...</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
