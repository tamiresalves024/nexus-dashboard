
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Wallet
} from 'lucide-react'

import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Sidebar() {
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Vendas', icon: ShoppingCart, path: '/vendas' },
    { name: 'Despesas', icon: Wallet, path: '/despesas' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Produtos', icon: Package, path: '/produtos' },
    { name: 'Relatórios', icon: ChartNoAxesCombined, path: '/relatorios' },
  ]

  async function sair() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Não foi possível sair da conta. Tente novamente.')
      return
    }

    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">N</div>
        <span>NEXUS</span>
      </div>

      <span className="menu-label">MENU PRINCIPAL</span>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `menu-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={19} />
          <span>Configurações</span>
        </NavLink>

        <button
          type="button"
          className="menu-item"
          onClick={sair}
        >
          <LogOut size={19} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
