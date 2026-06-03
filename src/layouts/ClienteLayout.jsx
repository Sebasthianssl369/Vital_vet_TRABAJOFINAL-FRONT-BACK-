import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, ClipboardList, LogOut } from 'lucide-react'

export default function ClienteLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🐾</div>

          <div>
            <div style={styles.logoText}>VitalVet</div>
            <div style={styles.logoSub}>Portal del Cliente</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <NavLink
            to="/cliente/citas"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navActive : {})
            })}
          >
            <Calendar size={18} />
            Mis citas
          </NavLink>

          <NavLink
            to="/cliente/historial"
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navActive : {})
            })}
          >
            <ClipboardList size={18} />
            Mi historial
          </NavLink>
        </nav>

        <div style={styles.bottom}>
          <div style={styles.userBox}>
            <div style={styles.avatar}>
              {user?.username?.charAt(0).toUpperCase() || 'C'}
            </div>

            <div>
              <div style={styles.userName}>
                {user?.username || 'Cliente'}
              </div>

              <div style={styles.userRole}>
                Cliente
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <h2 style={styles.topTitle}>
              Portal del Cliente
            </h2>

            <span style={styles.topSubtitle}>
              Gestiona tus citas e historial médico de forma rápida
            </span>
          </div>

          <div style={styles.topUser}>
            <div style={styles.onlineDot}></div>
            {user?.username}
          </div>
        </div>

        <Outlet />
      </main>
    </div>
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
    fontSize: 24,
    background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
    color: '#fff',
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(37,99,235,.25)'
  },

  logoText: {
    fontWeight: 700,
    fontSize: 16,
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
    transition: 'all .25s ease',
    borderLeft: '3px solid transparent',
    textDecoration: 'none'
  },

  navActive: {
    background: 'linear-gradient(135deg,#DBEAFE,#EFF6FF)',
    color: '#2563EB',
    borderLeft: '3px solid #2563EB'
  },

  bottom: {
    padding: 16,
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14
  },

  userName: {
    fontWeight: 600,
    fontSize: 13,
    color: '#0F172A'
  },

  userRole: {
    fontSize: 11,
    color: '#64748B'
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
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600
  },

  main: {
    marginLeft: 'var(--sidebar-w)',
    flex: 1,
    minHeight: '100vh',
    padding: '24px 32px',
    background: '#F8FAFC'
  },

  topbar: {
    background: '#fff',
    borderRadius: 18,
    padding: '18px 24px',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,.05)'
  },

  topTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#0F172A'
  },

  topSubtitle: {
    fontSize: 13,
    color: '#64748B'
  },

  topUser: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 600,
    color: '#334155'
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#22C55E'
  }
}
