import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  PawPrint,
  ShieldCheck,
  CalendarDays,
  FileText,
  Users,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

import {
  loginUsuario,
  registrarCliente
} from '../services/authService'

const emptyLogin = {
  username: '',
  password: '',
  rol: 'cliente'
}

const emptyRegister = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
  username: '',
  password: '',
  confirmar: ''
}

const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [modo, setModo] = useState('login')
  const [formLogin, setFormLogin] = useState(emptyLogin)
  const [formReg, setFormReg] = useState(emptyRegister)
  const [error, setError] = useState('')
  const [exitoReg, setExitoReg] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingRegistro, setLoadingRegistro] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!formLogin.username.trim() || !formLogin.password.trim()) {
      setError('Completa usuario y contraseña para continuar.')
      return
    }

    try {
      setLoadingLogin(true)

      const userData = await loginUsuario({
        username: formLogin.username.trim(),
        password: formLogin.password,
        rol: formLogin.rol
      })

      login(userData)

      navigate(userData.rol === 'administrador' ? '/dashboard' : '/cliente/citas')
    } catch (error) {
      setError(error.message || 'No se pudo iniciar sesión.')
    } finally {
      setLoadingLogin(false)
    }
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    setError('')
    setExitoReg(false)

    const {
      nombre,
      apellido,
      dni,
      telefono,
      email,
      username,
      password,
      confirmar
    } = formReg

    if (!nombre.trim() || !apellido.trim() || !dni || !email.trim() || !username.trim() || !password || !confirmar) {
      setError('Completa todos los campos obligatorios.')
      return
    }

    if (dni.length !== 8) {
      setError('El DNI debe tener exactamente 8 dígitos.')
      return
    }

    if (telefono && telefono.length !== 9) {
      setError('El teléfono debe tener exactamente 9 dígitos.')
      return
    }

    if (!validarEmail(email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      setLoadingRegistro(true)

      await registrarCliente({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni,
        telefono,
        email: email.trim(),
        username: username.trim(),
        password
      })

      setExitoReg(true)

      setTimeout(() => {
        setModo('login')
        setExitoReg(false)
        setError('')
        setFormLogin({
          username: username.trim(),
          password: '',
          rol: 'cliente'
        })
        setFormReg(emptyRegister)
      }, 1600)
    } catch (error) {
      setError(error.message || 'No se pudo registrar la cuenta.')
    } finally {
      setLoadingRegistro(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* PANEL IZQUIERDO */}
        <section style={styles.leftPanel}>
          <div style={styles.leftOverlay}>
            <div style={styles.brandTop}>
              <div style={styles.brandIcon}>
                <PawPrint size={28} strokeWidth={2.3} />
              </div>

              <div>
                <h1 style={styles.brandTitle}>VitalVet</h1>
                <p style={styles.brandSubtitle}>Sistema de Gestión Veterinaria</p>
              </div>
            </div>

            <div style={styles.heroBlock}>
              <h2 style={styles.heroTitle}>
                Plataforma moderna para la gestión integral de tu clínica veterinaria.
              </h2>

              <p style={styles.heroText}>
                Administra clientes, mascotas, citas e historial clínico
                desde una sola interfaz, de forma rápida y profesional.
              </p>
            </div>

            <div style={styles.featureGrid}>
              <div style={styles.featureCard}>
                <Users size={16} />
                <span>Gestión de clientes</span>
              </div>

              <div style={styles.featureCard}>
                <ShieldCheck size={16} />
                <span>Control de mascotas</span>
              </div>

              <div style={styles.featureCard}>
                <FileText size={16} />
                <span>Historial clínico</span>
              </div>

              <div style={styles.featureCard}>
                <CalendarDays size={16} />
                <span>Citas y seguimiento</span>
              </div>
            </div>
          </div>
        </section>

        {/* PANEL DERECHO */}
        <section style={styles.rightPanel}>
          <div style={styles.card}>
            <div style={styles.mobileLogo}>
              <div style={styles.logoIcon}>
                <PawPrint size={20} strokeWidth={2.3} />
              </div>

              <div>
                <div style={styles.logoTitle}>VitalVet</div>
                <div style={styles.logoSub}>Sistema de Gestión Veterinaria</div>
              </div>
            </div>

            <div style={styles.header}>
              <h2 style={styles.title}>
                {modo === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
              </h2>

              <p style={styles.sub}>
                {modo === 'login'
                  ? 'Ingresa tus credenciales para acceder al sistema.'
                  : 'Completa tus datos para registrarte como cliente.'}
              </p>
            </div>

            <div style={styles.toggle}>
              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  ...(modo === 'login' ? styles.toggleActive : {})
                }}
                onClick={() => {
                  setModo('login')
                  setError('')
                  setExitoReg(false)
                }}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                style={{
                  ...styles.toggleBtn,
                  ...(modo === 'registro' ? styles.toggleActive : {})
                }}
                onClick={() => {
                  setModo('registro')
                  setError('')
                  setExitoReg(false)
                }}
              >
                Registrarse
              </button>
            </div>

            {modo === 'login' && (
              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Usuario</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Ej: admin o cliente"
                    value={formLogin.username}
                    onChange={e => setFormLogin({ ...formLogin, username: e.target.value })}
                    disabled={loadingLogin}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Contraseña</label>

                  <div style={styles.passwordWrap}>
                    <input
                      style={{ ...styles.input, paddingRight: 46 }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formLogin.password}
                      onChange={e => setFormLogin({ ...formLogin, password: e.target.value })}
                      disabled={loadingLogin}
                    />

                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tipo de acceso</label>

                  <div style={styles.roleGrid}>
                    <button
                      type="button"
                      style={{
                        ...styles.roleBtn,
                        ...(formLogin.rol === 'cliente' ? styles.roleActive : {})
                      }}
                      onClick={() => setFormLogin({ ...formLogin, rol: 'cliente' })}
                      disabled={loadingLogin}
                    >
                      Cliente
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.roleBtn,
                        ...(formLogin.rol === 'administrador' ? styles.roleActive : {})
                      }}
                      onClick={() => setFormLogin({ ...formLogin, rol: 'administrador' })}
                      disabled={loadingLogin}
                    >
                      Administrador
                    </button>
                  </div>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button type="submit" style={styles.btnPrimary} disabled={loadingLogin}>
                  {loadingLogin ? (
                    <>
                      <Loader2 size={16} />
                      Validando acceso...
                    </>
                  ) : (
                    'Ingresar al sistema'
                  )}
                </button>

                <div style={styles.infoBox}>
                  <strong>Accesos de prueba:</strong>
                  <span> Admin: admin / 1234 · Cliente: cliente / 1234</span>
                </div>
              </form>
            )}

            {modo === 'registro' && (
              <form onSubmit={handleRegistro} style={styles.form}>
                <div style={styles.row2}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nombre *</label>
                    <input
                      style={styles.input}
                      placeholder="Ej: Carlos"
                      value={formReg.nombre}
                      onChange={e => setFormReg({ ...formReg, nombre: e.target.value })}
                      disabled={loadingRegistro}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Apellido *</label>
                    <input
                      style={styles.input}
                      placeholder="Ej: Pérez"
                      value={formReg.apellido}
                      onChange={e => setFormReg({ ...formReg, apellido: e.target.value })}
                      disabled={loadingRegistro}
                    />
                  </div>
                </div>

                <div style={styles.row2}>
                  <div style={styles.field}>
                    <label style={styles.label}>DNI *</label>
                    <input
                      style={styles.input}
                      placeholder="8 dígitos"
                      maxLength={8}
                      value={formReg.dni}
                      onChange={e =>
                        setFormReg({
                          ...formReg,
                          dni: e.target.value.replace(/\D/g, '')
                        })
                      }
                      disabled={loadingRegistro}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Teléfono</label>
                    <input
                      style={styles.input}
                      placeholder="9 dígitos"
                      maxLength={9}
                      value={formReg.telefono}
                      onChange={e =>
                        setFormReg({
                          ...formReg,
                          telefono: e.target.value.replace(/\D/g, '')
                        })
                      }
                      disabled={loadingRegistro}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Correo electrónico *</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formReg.email}
                    onChange={e => setFormReg({ ...formReg, email: e.target.value })}
                    disabled={loadingRegistro}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Nombre de usuario *</label>
                  <input
                    style={styles.input}
                    placeholder="Sin espacios"
                    value={formReg.username}
                    onChange={e =>
                      setFormReg({
                        ...formReg,
                        username: e.target.value.replace(/\s/g, '')
                      })
                    }
                    disabled={loadingRegistro}
                  />
                </div>

                <div style={styles.row2}>
                  <div style={styles.field}>
                    <label style={styles.label}>Contraseña *</label>
                    <input
                      style={styles.input}
                      type="password"
                      placeholder="••••••••"
                      value={formReg.password}
                      onChange={e => setFormReg({ ...formReg, password: e.target.value })}
                      disabled={loadingRegistro}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Confirmar *</label>
                    <input
                      style={styles.input}
                      type="password"
                      placeholder="••••••••"
                      value={formReg.confirmar}
                      onChange={e => setFormReg({ ...formReg, confirmar: e.target.value })}
                      disabled={loadingRegistro}
                    />
                  </div>
                </div>

                {error && <p style={styles.error}>{error}</p>}
                {exitoReg && <p style={styles.success}>✅ Registro exitoso. Ahora inicia sesión con tu usuario.</p>}

                <button type="submit" style={styles.btnPrimary} disabled={loadingRegistro}>
                  {loadingRegistro ? (
                    <>
                      <Loader2 size={16} />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </form>
            )}

            <p style={styles.footer}>VitalVet © 2026 · Sistema de Gestión Veterinaria</p>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f7f3ef 0%, #fffaf5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },

  wrapper: {
    width: '100%',
    maxWidth: 1080,
    minHeight: 620,
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    background: '#fff',
    borderRadius: 26,
    overflow: 'hidden',
    border: '1px solid #eadfd7',
    boxShadow: '0 25px 80px rgba(0,0,0,.12)'
  },

  leftPanel: {
    background:
      'linear-gradient(135deg, rgba(227,110,44,.96), rgba(245,158,66,.88)), url("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80") center/cover',
    color: '#fff',
    padding: 48,
    display: 'flex',
    alignItems: 'center'
  },

  leftOverlay: {
    width: '100%',
    maxWidth: 470
  },

  brandTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 34
  },

  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: 'rgba(255,255,255,.18)',
    border: '1px solid rgba(255,255,255,.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    backdropFilter: 'blur(8px)'
  },

  brandTitle: {
    margin: 0,
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-0.03em'
  },

  brandSubtitle: {
    margin: '4px 0 0',
    fontSize: 13,
    opacity: 0.9
  },

  heroBlock: {
    marginBottom: 28
  },

  heroTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.25
  },

  heroText: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 1.8,
    opacity: 0.95
  },

  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },

  featureCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    background: 'rgba(255,255,255,.14)',
    border: '1px solid rgba(255,255,255,.20)',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 13,
    fontWeight: 600,
    backdropFilter: 'blur(6px)'
  },

  rightPanel: {
    background: '#fff',
    padding: '34px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  card: {
    width: '100%',
    maxWidth: 420
  },

  mobileLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24
  },

  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #e36e2c, #f59e42)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 22px rgba(227,110,44,.25)'
  },

  logoTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#e36e2c'
  },

  logoSub: {
    fontSize: 11,
    color: '#7a7a7a'
  },

  header: {
    marginBottom: 18
  },

  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#111827'
  },

  sub: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.6
  },

  toggle: {
    display: 'flex',
    gap: 6,
    background: '#f5f1ed',
    padding: 5,
    borderRadius: 12,
    marginBottom: 22
  },

  toggleBtn: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 700,
    color: '#6b7280',
    cursor: 'pointer'
  },

  toggleActive: {
    background: '#fff',
    color: '#e36e2c',
    boxShadow: '0 2px 10px rgba(0,0,0,.08)'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 13
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },

  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563'
  },

  input: {
    width: '100%',
    padding: '11px 13px',
    border: '1px solid #e5ddd6',
    borderRadius: 11,
    background: '#fcfbfa',
    fontSize: 13,
    color: '#111827',
    outline: 'none'
  },

  passwordWrap: {
    position: 'relative'
  },

  eyeBtn: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10
  },

  roleBtn: {
    border: '1px solid #e5ddd6',
    background: '#faf8f6',
    borderRadius: 12,
    padding: '12px',
    fontSize: 13,
    fontWeight: 700,
    color: '#4b5563',
    cursor: 'pointer'
  },

  roleActive: {
    border: '1px solid #e36e2c',
    background: '#fff7f2',
    color: '#e36e2c'
  },

  error: {
    margin: 0,
    fontSize: 12,
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '10px 12px'
  },

  success: {
    margin: 0,
    fontSize: 12,
    color: '#065f46',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 10,
    padding: '10px 12px'
  },

  btnPrimary: {
    border: 'none',
    background: 'linear-gradient(135deg, #e36e2c, #f59e42)',
    color: '#fff',
    borderRadius: 12,
    padding: '13px 16px',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(227,110,44,.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },

  infoBox: {
    fontSize: 12,
    color: '#92400e',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 10,
    padding: '11px 12px',
    lineHeight: 1.5
  },

  footer: {
    marginTop: 18,
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center'
  }
}
