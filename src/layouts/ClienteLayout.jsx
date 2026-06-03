import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, ClipboardList, LogOut } from 'lucide-react'

export default function ClienteLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display:'flex' }}>
      {/* Sidebar cliente */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🐾</div>
          <div>
            <div style={styles.logoText}>VitalVet</div>
            <div style={styles.logoSub}>Portal del Cliente</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <NavLink to="/cliente/citas" style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}>
            <Calendar size={17}/> Mis citas
          </NavLink>
          <NavLink to="/cliente/historial" style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}>
            <ClipboardList size={17}/> Mi historial
          </NavLink>
        </nav>

        <div style={styles.bottom}>
          <div style={styles.userBox}>
            <div style={styles.avatar}>{user?.username?.charAt(0).toUpperCase() || 'C'}</div>
            <div>
              <div style={styles.userName}>{user?.username}</div>
              <div style={styles.userRole}>Cliente</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}><LogOut size={15}/> Salir</button>
        </div>
      </aside>

      <main style={{ marginLeft:'var(--sidebar-w)', flex:1, minHeight:'100vh', padding:'28px 32px', background:'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  sidebar:   { width:'var(--sidebar-w)', height:'100vh', background:'#fff', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, zIndex:100 },
  logo:      { display:'flex', alignItems:'center', gap:10, padding:'20px 18px', borderBottom:'1px solid var(--border)' },
  logoIcon:  { fontSize:24, background:'var(--primary-light)', width:38, height:38, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' },
  logoText:  { fontWeight:700, fontSize:15, color:'var(--primary)' },
  logoSub:   { fontSize:10, color:'var(--text-muted)' },
  nav:       { flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:4 },
  navItem:   { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, color:'var(--text-sub)', fontWeight:500, fontSize:13.5, borderLeft:'3px solid transparent' },
  navActive: { background:'var(--primary-light)', color:'var(--primary)', borderLeft:'3px solid var(--primary)' },
  bottom:    { padding:'14px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:10 },
  userBox:   { display:'flex', alignItems:'center', gap:10 },
  avatar:    { width:32, height:32, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 },
  userName:  { fontWeight:600, fontSize:13, color:'var(--text-main)' },
  userRole:  { fontSize:11, color:'var(--text-muted)' },
  logoutBtn: { display:'flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid var(--border)', borderRadius:7, padding:'7px 12px', fontSize:13, color:'var(--text-sub)', width:'100%', justifyContent:'center', cursor:'pointer' },
}
