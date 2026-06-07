import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Dog,
  Users,
  ClipboardList,
  Calendar,
  BarChart2,
  LogOut,
  Stethoscope,
  PawPrint
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
    to: '/veterinarios',
    icon: <Stethoscope size={18} />,
    label: 'Veterinarios'
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
      {/* LOGO */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <PawPrint size={25} strokeWidth={2.5} />
        </div>

        <div>
          <div style={styles.logoText}>VitalVet</div>
          <div style={styles.logoSub}>Gestión Veterinaria</div>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav style={styles.nav}>
        <p style={styles.navSection}>Menú principal</p>

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

            <span style={styles.navLabel}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* USUARIO */}
      <div style={styles.bottom}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>

          <div style={{ minWidth: 0 }}>
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
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '8px 0 28px rgba(15,23,42,.06)'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '22px 18px',
    borderBottom: '1px solid var(--border)'
  },

  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 26px rgba(232,97,44,.26)'
  },

  logoText: {
    fontWeight: 900,
    fontSize: 19,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em'
  },

  logoSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginTop: 2
  },

  nav: {
    flex: 1,
    padding: '18px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    overflowY: 'auto'
  },

  navSection: {
    fontSize: 10,
    fontWeight: 900,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    padding: '0 12px',
    marginBottom: 6
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 13,
    color: 'var(--text-sub)',
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    transition: 'all .2s ease',
    border: '1px solid transparent',
    position: 'relative'
  },

  navActive: {
    background: 'linear-gradient(135deg,var(--primary-light),#FFFFFF)',
    color: 'var(--primary)',
    border: '1px solid #FFD6C7',
    boxShadow: '0 8px 18px rgba(232,97,44,.12)'
  },

  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  navLabel: {
    whiteSpace: 'nowrap'
  },

  bottom: {
    padding: 16,
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#FFFFFF'
  },

  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderRadius: 14,
    background: 'linear-gradient(135deg,#FFFFFF,var(--bg))',
    border: '1px solid var(--border)'
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 15,
    flexShrink: 0,
    boxShadow: '0 8px 18px rgba(232,97,44,.24)'
  },

  userName: {
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 125
  },

  userRole: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
    marginTop: 2,
    fontWeight: 600
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#FFF4F1',
    color: '#D14316',
    border: '1px solid #FFD5C8',
    borderRadius: 12,
    padding: '11px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all .2s ease'
  }
}
