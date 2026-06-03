import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Dog, Users, ClipboardList,
  Calendar, BarChart2, LogOut, Stethoscope
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',  icon: <LayoutDashboard size={18}/>, label: 'Dashboard'  },
  { to: '/mascotas',   icon: <Dog size={18}/>,             label: 'Mascotas'   },
  { to: '/clientes',   icon: <Users size={18}/>,           label: 'Clientes'   },
  { to: '/historial',  icon: <ClipboardList size={18}/>,   label: 'Historial'  },
  { to: '/citas',      icon: <Calendar size={18}/>,        label: 'Citas'      },
  { to: '/reportes',   icon: <BarChart2 size={18}/>,       label: 'Reportes'   },
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
        <div style={styles.logoIcon}>🐾</div>
        <div>
          <div style={styles.logoText}>VitalVet</div>
          <div style={styles.logoSub}>Clínica Veterinaria</div>
        </div>
      </div>

      {/* Nav */}
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
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Usuario + logout */}
      <div style={styles.bottom}>
        <div style={styles.userBox}>
          <div style={styles.avatar}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div style={styles.userName}>{user?.username || 'Usuario'}</div>
            <div style={styles.userRole}>{user?.rol || 'Rol'}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16}/> Salir
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-w)',
    height: '100vh',
    background: '#fff',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 18px',
    borderBottom: '1px solid var(--border)',
  },
  logoIcon: {
    fontSize: 26,
    background: 'var(--primary-light)',
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 700,
    fontSize: 16,
    color: 'var(--primary)',
  },
  logoSub: {
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  nav: {
    flex: 1,
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    color: 'var(--text-sub)',
    fontWeight: 500,
    fontSize: 13.5,
    transition: 'all 0.15s',
    borderLeft: '3px solid transparent',
  },
  navActive: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderLeft: '3px solid var(--primary)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  bottom: {
    padding: '14px 14px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  userName: {
    fontWeight: 600,
    fontSize: 13,
    color: 'var(--text-main)',
  },
  userRole: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 7,
    padding: '7px 12px',
    fontSize: 13,
    color: 'var(--text-sub)',
    width: '100%',
    justifyContent: 'center',
  },
}
