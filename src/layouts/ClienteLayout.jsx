import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  ClipboardList,
  LogOut,
  PawPrint,
  Bell,
  UserRound,
  ShieldCheck,
  X,
  Clock,
  CreditCard,
  HeartPulse
} from 'lucide-react'

const navItems = [
  {
    to: '/cliente/citas',
    icon: <Calendar size={18} />,
    label: 'Mis citas'
  },
  {
    to: '/cliente/historial',
    icon: <ClipboardList size={18} />,
    label: 'Mi historial'
  }
]

const notificaciones = [
  {
    icon: <Calendar size={16} />,
    title: 'Cita pendiente',
    text: 'Tienes una cita próxima por confirmar o pagar.',
    color: 'var(--primary)'
  },
  {
    icon: <CreditCard size={16} />,
    title: 'Pago seguro',
    text: 'Puedes pagar tus citas desde el portal del cliente.',
    color: '#F59E0B'
  },
  {
    icon: <HeartPulse size={16} />,
    title: 'Historial clínico',
    text: 'Tu historial médico está disponible para revisión.',
    color: '#10B981'
  }
]

export default function ClienteLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [modalNotificaciones, setModalNotificaciones] = useState(false)

  const fechaActual = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* LOGO */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <PawPrint size={25} strokeWidth={2.5} />
          </div>

          <div>
            <div style={styles.logoText}>VitalVet</div>
            <div style={styles.logoSub}>Portal del Cliente</div>
          </div>
        </div>

        {/* PERFIL */}
        <div style={styles.profileCard}>
          <div style={styles.profileAvatar}>
            {user?.username?.charAt(0).toUpperCase() || 'C'}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={styles.profileName}>
              {user?.username || 'Cliente'}
            </div>

            <div style={styles.profileStatus}>
              <span style={styles.onlineDot}></span>
              Cuenta activa
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav style={styles.nav}>
          <p style={styles.navLabel}>Menú principal</p>

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

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* CAJA INFORMATIVA */}
        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>
            <ShieldCheck size={18} />
          </div>

          <div>
            <div style={styles.infoTitle}>Área segura</div>

            <div style={styles.infoText}>
              Tus citas, pagos e historial clínico están protegidos.
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={styles.bottom}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main style={styles.main}>
        {/* TOPBAR */}
        <header style={styles.topbar}>
          <div>
            <h2 style={styles.topTitle}>Portal del Cliente</h2>

            <p style={styles.topSubtitle}>
              Gestiona tus citas, pagos e historial médico de forma rápida.
            </p>
          </div>

          <div style={styles.topActions}>
            <div style={styles.dateCard}>
              📅 {fechaActual}
            </div>

            <button
              style={styles.notificationBtn}
              onClick={() => setModalNotificaciones(true)}
              title="Ver notificaciones"
            >
              <Bell size={17} />
              <span style={styles.notificationDot}></span>
            </button>

            <div style={styles.topUser}>
              <div style={styles.topAvatar}>
                <UserRound size={17} />
              </div>

              <div>
                <div style={styles.topUserName}>
                  {user?.username || 'Cliente'}
                </div>

                <div style={styles.topUserRole}>
                  Cliente
                </div>
              </div>
            </div>
          </div>
        </header>

        <section style={styles.content}>
          <Outlet />
        </section>
      </main>

      {/* MODAL NOTIFICACIONES */}
      {modalNotificaciones && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Notificaciones</h3>
                <p style={styles.modalSub}>
                  Recordatorios importantes de tu portal.
                </p>
              </div>

              <button
                style={styles.closeBtn}
                onClick={() => setModalNotificaciones(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {notificaciones.map((n, i) => (
                <div key={i} style={styles.notificationItem}>
                  <div
                    style={{
                      ...styles.notificationIcon,
                      background: `${n.color}18`,
                      color: n.color
                    }}
                  >
                    {n.icon}
                  </div>

                  <div>
                    <div style={styles.notificationTitle}>
                      {n.title}
                    </div>

                    <p style={styles.notificationText}>
                      {n.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.btnPrimary}
                onClick={() => {
                  setModalNotificaciones(false)
                  navigate('/cliente/citas')
                }}
              >
                <Clock size={15} />
                Ver mis citas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)'
  },

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
    marginTop: 2,
    fontWeight: 600
  },

  profileCard: {
    margin: '16px 14px 6px',
    background: 'linear-gradient(135deg,#FFFFFF,var(--bg))',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    boxShadow: 'var(--shadow)'
  },

  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 15,
    flexShrink: 0,
    boxShadow: '0 8px 18px rgba(232,97,44,.24)'
  },

  profileName: {
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 130
  },

  profileStatus: {
    fontSize: 11,
    color: 'var(--text-sub)',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 2
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#22C55E',
    boxShadow: '0 0 0 3px rgba(34,197,94,.16)',
    flexShrink: 0
  },

  nav: {
    flex: 1,
    padding: '18px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7
  },

  navLabel: {
    fontSize: 10,
    fontWeight: 900,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    padding: '0 10px',
    marginBottom: 4
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
    transition: 'all .22s ease',
    border: '1px solid transparent',
    textDecoration: 'none'
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

  infoBox: {
    margin: '0 14px 12px',
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 15,
    padding: 13,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start'
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: '#D1FAE5',
    color: '#065F46',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  infoText: {
    fontSize: 11,
    color: 'var(--text-sub)',
    lineHeight: 1.5,
    marginTop: 2
  },

  bottom: {
    padding: 16,
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#FFFFFF'
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
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
    transition: 'all .2s ease'
  },

  main: {
    marginLeft: 'var(--sidebar-w)',
    flex: 1,
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top right, rgba(255,240,232,.85), transparent 32%), var(--bg)'
  },

  topbar: {
    height: 86,
    background: 'rgba(255,255,255,.88)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 20
  },

  topTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em'
  },

  topSubtitle: {
    fontSize: 13,
    color: 'var(--text-sub)',
    marginTop: 4
  },

  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },

  dateCard: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid #FFD6C7',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'capitalize'
  },

  notificationBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: '#fff',
    color: 'var(--text-sub)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },

  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--primary)',
    border: '2px solid #fff'
  },

  topUser: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: '8px 12px'
  },

  topAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  topUserName: {
    fontWeight: 800,
    fontSize: 13,
    color: 'var(--text-main)'
  },

  topUserRole: {
    fontSize: 11,
    color: 'var(--text-muted)'
  },

  content: {
    padding: '28px 32px'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: 16
  },

  modal: {
    width: '100%',
    maxWidth: 480,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 25px 60px rgba(0,0,0,.22)',
    overflow: 'hidden'
  },

  modalHeader: {
    padding: '18px 22px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  modalSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    display: 'flex',
    cursor: 'pointer'
  },

  modalBody: {
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },

  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14
  },

  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  notificationTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  notificationText: {
    fontSize: 12,
    color: 'var(--text-sub)',
    lineHeight: 1.5,
    marginTop: 3
  },

  modalFooter: {
    padding: '14px 22px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end'
  },

  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer'
  }
}
