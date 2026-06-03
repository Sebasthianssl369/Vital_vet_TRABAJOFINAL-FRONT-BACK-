import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Dog,
  Users,
  ClipboardList,
  Calendar,
  BarChart2,
  LogOut
} from 'lucide-react'

const navItems = [
  {
    to: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    label: 'Dashboard'
  },
  {
    to: '/mascotas',
    icon: <Dog size={18} />,
    label: 'Mascotas'
  },
  {
    to: '/clientes',
    icon: <Users size={18} />,
    label: 'Clientes'
  },
  {
    to: '/historial',
    icon: <ClipboardList size={18} />,
    label: 'Historial'
  },
  {
    to: '/citas',
    icon: <Calendar size={18} />,
    label: 'Citas'
  },
  {
    to: '/reportes',
    icon: <BarChart2 size={18} />,
    label: 'Reportes'
  }
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          🐾
        </div>

        <div>
          <div style={styles.logoText}>
            VitalVet
          </div>

          <div style={styles.logoSub}>
            Clínica Veterinaria
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navActive : {})
            })}
          >
            <span style={styles.navIcon}>
              {item.icon}
            </span>

            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div style={styles.bottom}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>

          <div>
            <div style={styles.userName}>
              {user?.username || 'Administrador'}
            </div>

            <div style={styles.userRole}>
              {user?.rol || 'Administrador'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-w)',
    height: '100vh',
    background: '#FFFFFF',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '4px 0 20px rgba(0,0,0,.05)'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '22px 18px',
    borderBottom: '1px solid #E2E8F0'
  },

  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: 'linear-gradient(135deg,#2563EB,#60A5FA)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    boxShadow: '0 8px 20px rgba(37,99,235,.25)'
  },

  logoText: {
    fontWeight: 700,
    fontSize: 17,
    color: '#2563EB'
  },

  logoSub: {
    fontSize: 11,
    color: '#64748B'
  },

  nav: {
    flex: 1,
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 12,
    color: '#64748B',
    fontWeight: 500,
    fontSize: 14,
    textDecoration: 'none',
    transition: 'all .25s ease',
    borderLeft: '3px solid transparent'
  },

  navActive: {
    background: 'linear-gradient(135deg,#DBEAFE,#EFF6FF)',
    color: '#2563EB',
    borderLeft: '3px solid #2563EB',
    fontWeight: 600
  },

  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  bottom: {
    padding: 16,
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    background: '#F8FAFC'
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0
  },

  userName: {
    fontWeight: 600,
    fontSize: 13,
    color: '#0F172A'
  },

  userRole: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'capitalize'
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .2s ease'
  }
}
