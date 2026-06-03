import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const emptyLogin = { username: '', password: '', rol: 'cliente' }
const emptyRegister = { nombre: '', apellido: '', dni: '', telefono: '', email: '', username: '', password: '', confirmar: '' }

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [formLogin, setFormLogin] = useState(emptyLogin)
  const [formReg, setFormReg]     = useState(emptyRegister)
  const [error, setError]         = useState('')
  const [exitoReg, setExitoReg]   = useState(false)

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    if (!formLogin.username || !formLogin.password) {
      setError('Completa todos los campos.')
      return
    }
    // TODO: conectar con POST /api/auth/login
    login({ username: formLogin.username, rol: formLogin.rol })
    navigate(formLogin.rol === 'administrador' ? '/dashboard' : '/cliente/citas')
  }

  // ── REGISTRO ─────────────────────────────────────────────────────────────
  const handleRegistro = (e) => {
    e.preventDefault()
    setError('')
    const { nombre, apellido, dni, email, username, password, confirmar } = formReg
    if (!nombre || !apellido || !dni || !email || !username || !password) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    // TODO: conectar con POST /api/auth/registro
    setExitoReg(true)
    setTimeout(() => { setModo('login'); setExitoReg(false); setFormReg(emptyRegister) }, 2000)
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🐾</div>
          <div>
            <div style={styles.logoTitle}>VitalVet</div>
            <div style={styles.logoSub}>Sistema de Gestión Veterinaria</div>
          </div>
        </div>

        {/* Toggle Login / Registro */}
        <div style={styles.toggle}>
          <button
            style={{ ...styles.toggleBtn, ...(modo === 'login' ? styles.toggleActive : {}) }}
            onClick={() => { setModo('login'); setError('') }}
          >Iniciar sesión</button>
          <button
            style={{ ...styles.toggleBtn, ...(modo === 'registro' ? styles.toggleActive : {}) }}
            onClick={() => { setModo('registro'); setError('') }}
          >Registrarse</button>
        </div>

        {/* ── FORMULARIO LOGIN ── */}
        {modo === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Usuario</label>
              <input style={styles.input} type="text" placeholder="Tu nombre de usuario"
                value={formLogin.username}
                onChange={e => setFormLogin({...formLogin, username: e.target.value})}/>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input style={styles.input} type="password" placeholder="••••••••"
                value={formLogin.password}
                onChange={e => setFormLogin({...formLogin, password: e.target.value})}/>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Rol</label>
              <select style={styles.input} value={formLogin.rol}
                onChange={e => setFormLogin({...formLogin, rol: e.target.value})}>
                <option value="cliente">Cliente</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.btn}>Ingresar al sistema</button>
          </form>
        )}

        {/* ── FORMULARIO REGISTRO ── */}
        {modo === 'registro' && (
          <form onSubmit={handleRegistro} style={styles.form}>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Nombre *</label>
                <input style={styles.input} placeholder="Ej: Carlos"
                  value={formReg.nombre} onChange={e => setFormReg({...formReg, nombre: e.target.value})}/>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Apellido *</label>
                <input style={styles.input} placeholder="Ej: Pérez"
                  value={formReg.apellido} onChange={e => setFormReg({...formReg, apellido: e.target.value})}/>
              </div>
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>DNI *</label>
                <input style={styles.input} placeholder="8 dígitos"
                  value={formReg.dni} onChange={e => setFormReg({...formReg, dni: e.target.value})}/>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Teléfono</label>
                <input style={styles.input} placeholder="9 dígitos"
                  value={formReg.telefono} onChange={e => setFormReg({...formReg, telefono: e.target.value})}/>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Correo electrónico *</label>
              <input style={styles.input} type="email" placeholder="correo@ejemplo.com"
                value={formReg.email} onChange={e => setFormReg({...formReg, email: e.target.value})}/>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Nombre de usuario *</label>
              <input style={styles.input} placeholder="Sin espacios"
                value={formReg.username} onChange={e => setFormReg({...formReg, username: e.target.value})}/>
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Contraseña *</label>
                <input style={styles.input} type="password" placeholder="••••••••"
                  value={formReg.password} onChange={e => setFormReg({...formReg, password: e.target.value})}/>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirmar *</label>
                <input style={styles.input} type="password" placeholder="••••••••"
                  value={formReg.confirmar} onChange={e => setFormReg({...formReg, confirmar: e.target.value})}/>
              </div>
            </div>
            {error    && <p style={styles.error}>{error}</p>}
            {exitoReg && <p style={styles.exito}>✅ Registro exitoso. Redirigiendo al login...</p>}
            <button type="submit" style={styles.btn}>Crear cuenta</button>
          </form>
        )}

        <p style={styles.footer}>VitalVet © 2026 · UTP Ingeniería de Sistemas</p>
      </div>
    </div>
  )
}

const styles = {
  page:        { minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  card:        { background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'32px 28px', width:'100%', maxWidth:420, boxShadow:'var(--shadow)' },
  logoWrap:    { display:'flex', alignItems:'center', gap:12, marginBottom:22 },
  logoIcon:    { fontSize:28, background:'var(--primary-light)', width:46, height:46, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center' },
  logoTitle:   { fontWeight:700, fontSize:19, color:'var(--primary)' },
  logoSub:     { fontSize:11, color:'var(--text-muted)' },
  toggle:      { display:'flex', background:'var(--bg)', borderRadius:9, padding:4, marginBottom:22, gap:4 },
  toggleBtn:   { flex:1, padding:'8px', border:'none', borderRadius:7, background:'transparent', fontSize:13, fontWeight:500, color:'var(--text-sub)', cursor:'pointer' },
  toggleActive:{ background:'#fff', color:'var(--primary)', fontWeight:700, boxShadow:'0 1px 4px rgba(0,0,0,0.1)' },
  form:        { display:'flex', flexDirection:'column', gap:12 },
  row2:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  field:       { display:'flex', flexDirection:'column', gap:4 },
  label:       { fontSize:12, fontWeight:600, color:'var(--text-sub)' },
  input:       { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, color:'var(--text-main)', background:'#FAFAFA', outline:'none' },
  error:       { fontSize:12, color:'#C0392B', background:'#FFF0EE', padding:'8px 12px', borderRadius:7, border:'1px solid #FFCCCC' },
  exito:       { fontSize:12, color:'#065F46', background:'#D1FAE5', padding:'8px 12px', borderRadius:7, border:'1px solid #6EE7B7' },
  btn:         { background:'var(--primary)', color:'#fff', border:'none', borderRadius:9, padding:'11px', fontWeight:600, fontSize:14, marginTop:4 },
  footer:      { fontSize:11, color:'var(--text-muted)', textAlign:'center', marginTop:18 },
}
