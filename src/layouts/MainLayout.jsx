import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import {
  Bell,
  CalendarDays,
  UserRound,
  X,
  AlertCircle,
  CreditCard,
  ClipboardList,
  BarChart3,
  ShieldCheck
} from 'lucide-react'

const alertasAdmin = [
  {
    icon: <CreditCard size={16} />,
    title: 'Pagos pendientes',
    text: 'Existen citas pendientes de pago por revisar.',
    color: '#F59E0B',
    route: '/citas'
  },
  {
    icon: <CalendarDays size={16} />,
    title: 'Citas registradas',
    text: 'Revisa la agenda y el estado de las citas.',
    color: 'var(--primary)',
    route: '/citas'
  },
  {
    icon: <ClipboardList size={16} />,
    title: 'Historial clínico',
    text: 'Consulta las últimas atenciones registradas.',
    color: '#3B82F6',
    route: '/historial'
  }
]

export default function MainLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalAlertas, setModalAlertas] = useState(false)

  const fechaActual = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div style={styles.container}>
      <Sidebar />

      <main style={styles.main}>
        {/* TOPBAR */}
        <header style={styles.topbar}>
          <div>
            <div style={styles.breadcrumb}>
              <ShieldCheck size={14} />
              Panel administrativo
            </div>

            <h2 style={styles.pageTitle}>
              Bienvenido, {user?.username || 'Administrador'}
            </h2>

            <p style={styles.pageSub}>
              Gestiona clientes, mascotas, citas, veterinarios, pagos y reportes desde un solo lugar.
            </p>
          </div>

          <div style={styles.right}>
            <div style={styles.dateCard}>
              <CalendarDays size={15} />
              {fechaActual}
            </div>

            <button
              style={styles.notificationBtn}
              onClick={() => setModalAlertas(true)}
              title="Ver alertas"
            >
              <Bell size={17} />
              <span style={styles.notificationDot}></span>
            </button>

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
          </div>
        </header>

        {/* CONTENIDO */}
        <section style={styles.content}>
          <Outlet />
        </section>
      </main>

      {/* MODAL ALERTAS */}
      {modalAlertas && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Alertas administrativas</h3>
                <p style={styles.modalSub}>
                  Accesos rápidos a áreas importantes del sistema.
                </p>
              </div>

              <button
                style={styles.closeBtn}
                onClick={() => setModalAlertas(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {alertasAdmin.map((a, i) => (
                <div key={i} style={styles.alertItem}>
                  <div
                    style={{
                      ...styles.alertIcon,
                      background: `${a.color}18`,
                      color: a.color
                    }}
                  >
                    {a.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={styles.alertTitle}>{a.title}</div>
                    <p style={styles.alertText}>{a.text}</p>
                  </div>

                  <button
                    style={styles.alertBtn}
                    onClick={() => {
                      setModalAlertas(false)
                      navigate(a.route)
                    }}
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.btnPrimary}
                onClick={() => {
                  setModalAlertas(false)
                  navigate('/reportes')
                }}
              >
                <BarChart3 size={15} />
                Ver reportes
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

  main: {
    marginLeft: 'var(--sidebar-w)',
    flex: 1,
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top right, rgba(255,240,232,.85), transparent 32%), var(--bg)'
  },

  topbar: {
    minHeight: 88,
    background: 'rgba(255,255,255,.88)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    padding: '16px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 20
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: 'fit-content',
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid #FFD6C7',
    borderRadius: 999,
    padding: '5px 10px',
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 7
  },

  pageTitle: {
    margin: 0,
    fontSize: 23,
    fontWeight: 900,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em'
  },

  pageSub: {
    fontSize: 13,
    color: 'var(--text-sub)',
    marginTop: 4,
    maxWidth: 610
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },

  dateCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid #FFD6C7',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap'
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

  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: '8px 12px',
    boxShadow: '0 4px 14px rgba(15,23,42,.04)'
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 15,
    boxShadow: '0 8px 18px rgba(232,97,44,.24)'
  },

  userName: {
    fontSize: 13,
    fontWeight: 800,
    color: 'var(--text-main)',
    maxWidth: 125,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  userRole: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
    marginTop: 2,
    fontWeight: 600
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
    maxWidth: 520,
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

  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14
  },

  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  alertTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  alertText: {
    fontSize: 12,
    color: 'var(--text-sub)',
    lineHeight: 1.5,
    marginTop: 3
  },

  alertBtn: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid #FFD6C7',
    borderRadius: 9,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
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
