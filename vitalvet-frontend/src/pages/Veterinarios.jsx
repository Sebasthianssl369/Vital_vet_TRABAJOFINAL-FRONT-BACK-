import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  X,
  Stethoscope,
  Clock,
  UserCheck,
  UserX,
  CalendarDays,
  Activity,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react'

import {
  getVeterinarios,
  crearVeterinario,
  actualizarVeterinario,
  cambiarEstadoVeterinario,
  eliminarVeterinario as eliminarVeterinarioService
} from '../services/veterinariosService'

const emptyForm = {
  nombre: '',
  apellido: '',
  especialidad: 'Medicina general',
  telefono: '',
  email: '',
  estado: 'Activo',
  foto: '👨‍⚕️',
  horarios: '09:00, 10:30, 12:00',
  citasAsignadas: 0
}

const especialidades = [
  'Medicina general',
  'Dermatología veterinaria',
  'Cirugía veterinaria',
  'Vacunación y prevención',
  'Baño y grooming',
  'Emergencias'
]

const normalizarVeterinario = (v) => ({
  ...v,
  id_veterinario: v.id_veterinario || v.idVeterinario,
  idVeterinario: v.idVeterinario || v.id_veterinario,
  estado: v.estado || 'Activo',
  foto: v.foto || '👨‍⚕️',

  // Temporal hasta conectar la tabla horarios_veterinario
  horarios: Array.isArray(v.horarios) && v.horarios.length > 0
    ? v.horarios
    : ['09:00', '10:30', '12:00'],

  // Temporal hasta conectar citas reales
  citasAsignadas: Number(v.citasAsignadas || 0)
})

const validarEmail = (email) => {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarVeterinarios = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        const data = await getVeterinarios()
        setVeterinarios(data.map(normalizarVeterinario))
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar veterinarios.')
      } finally {
        setLoading(false)
      }
    }

    cargarVeterinarios()
  }, [])

  const filtered = veterinarios.filter(v => {
    const texto = `${v.nombre} ${v.apellido} ${v.especialidad} ${v.email}`.toLowerCase()
    const matchBusqueda = texto.includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'Todos' || v.estado === filtroEstado

    return matchBusqueda && matchEstado
  })

  const totalVeterinarios = veterinarios.length
  const activos = veterinarios.filter(v => v.estado === 'Activo').length
  const inactivos = veterinarios.filter(v => v.estado === 'Inactivo').length
  const totalCitas = veterinarios.reduce((acc, v) => acc + Number(v.citasAsignadas || 0), 0)

  const openNew = () => {
    setForm(emptyForm)
    setEditId(null)
    setError('')
    setModal(true)
  }

  const openEdit = (v) => {
    const vetId = v.id_veterinario || v.idVeterinario

    setForm({
      nombre: v.nombre || '',
      apellido: v.apellido || '',
      especialidad: v.especialidad || 'Medicina general',
      telefono: v.telefono || '',
      email: v.email || '',
      estado: v.estado || 'Activo',
      foto: v.foto || '👨‍⚕️',
      horarios: Array.isArray(v.horarios) ? v.horarios.join(', ') : '',
      citasAsignadas: v.citasAsignadas || 0
    })

    setEditId(vetId)
    setError('')
    setModal(true)
  }

  const handleSave = async () => {
    setError('')

    if (!form.nombre.trim() || !form.apellido.trim() || !form.especialidad.trim()) {
      setError('Completa nombre, apellido y especialidad.')
      return
    }

    if (form.telefono && form.telefono.length !== 9) {
      setError('El teléfono debe tener exactamente 9 dígitos.')
      return
    }

    if (!validarEmail(form.email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    const horariosLimpios = form.horarios
      .split(',')
      .map(h => h.trim())
      .filter(Boolean)

    const veterinarioGuardado = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      especialidad: form.especialidad,
      telefono: form.telefono,
      email: form.email.trim(),
      estado: form.estado,
      foto: form.foto,
      horarios: horariosLimpios,
      citasAsignadas: Number(form.citasAsignadas) || 0
    }

    try {
      if (editId) {
        const actualizado = await actualizarVeterinario(editId, veterinarioGuardado)

        const normalizado = normalizarVeterinario({
          ...actualizado,
          horarios: horariosLimpios,
          citasAsignadas: Number(form.citasAsignadas) || 0
        })

        setVeterinarios(prev =>
          prev.map(v =>
            Number(v.id_veterinario || v.idVeterinario) === Number(editId)
              ? normalizado
              : v
          )
        )
      } else {
        const nuevoVeterinario = await crearVeterinario(veterinarioGuardado)

        const normalizado = normalizarVeterinario({
          ...nuevoVeterinario,
          horarios: horariosLimpios,
          citasAsignadas: Number(form.citasAsignadas) || 0
        })

        setVeterinarios(prev => [...prev, normalizado])
      }

      setModal(false)
      setForm(emptyForm)
      setEditId(null)
    } catch (error) {
      setError(error.message || 'No se pudo guardar el veterinario.')
    }
  }

  const cambiarEstado = async (id) => {
    const vetActual = veterinarios.find(v =>
      Number(v.id_veterinario || v.idVeterinario) === Number(id)
    )

    if (!vetActual) return

    const nuevoEstado = vetActual.estado === 'Activo' ? 'Inactivo' : 'Activo'

    try {
      await cambiarEstadoVeterinario(id, nuevoEstado)

      setVeterinarios(prev =>
        prev.map(v =>
          Number(v.id_veterinario || v.idVeterinario) === Number(id)
            ? { ...v, estado: nuevoEstado }
            : v
        )
      )
    } catch (error) {
      alert(error.message || 'No se pudo cambiar el estado del veterinario.')
    }
  }

  const eliminarVeterinario = async (id) => {
    if (!confirm('¿Eliminar este veterinario?')) return

    try {
      await eliminarVeterinarioService(id)

      setVeterinarios(prev =>
        prev.filter(v =>
          Number(v.id_veterinario || v.idVeterinario) !== Number(id)
        )
      )
    } catch (error) {
      alert(error.message || 'No se pudo eliminar el veterinario.')
    }
  }

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <Stethoscope size={34} color="var(--primary)" />
        <h3>Cargando veterinarios...</h3>
        <p>Estamos preparando la información de especialistas.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={s.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar veterinarios</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Veterinarios</h1>
          <p style={s.sub}>
            Administra especialistas, horarios disponibles y estado de atención.
          </p>
        </div>

        <button style={s.btnAdd} onClick={openNew}>
          <Plus size={16} />
          Nuevo veterinario
        </button>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Stethoscope size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{totalVeterinarios}</div>
            <div style={s.statLabel}>Veterinarios</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#D1FAE5', color: '#059669' }}>
            <UserCheck size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{activos}</div>
            <div style={s.statLabel}>Activos</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#FEE2E2', color: '#DC2626' }}>
            <UserX size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{inactivos}</div>
            <div style={s.statLabel}>Inactivos</div>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <CalendarDays size={20} />
          </div>

          <div>
            <div style={s.statNumber}>{totalCitas}</div>
            <div style={s.statLabel}>Citas asignadas</div>
          </div>
        </div>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={15} style={s.searchIcon} />

          <input
            style={s.searchInput}
            placeholder="Buscar por nombre, especialidad o correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <select
          style={s.select}
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option>Todos</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      <div style={s.grid}>
        {filtered.map(v => (
          <div key={v.id_veterinario || v.idVeterinario} style={s.card}>
            <div style={s.cardTop}>
              <div style={s.avatar}>
                {v.foto}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={s.vetName}>
                  Dr(a). {v.nombre} {v.apellido}
                </h3>

                <p style={s.vetSpec}>
                  {v.especialidad}
                </p>
              </div>

              <span style={v.estado === 'Activo' ? s.badgeActivo : s.badgeInactivo}>
                {v.estado}
              </span>
            </div>

            <div style={s.infoGrid}>
              <div style={s.infoBox}>
                <Activity size={16} color="var(--primary)" />
                <span>Citas</span>
                <b>{v.citasAsignadas}</b>
              </div>

              <div style={s.infoBox}>
                <Clock size={16} color="var(--primary)" />
                <span>Horarios</span>
                <b>{v.horarios.length}</b>
              </div>
            </div>

            <div style={s.contactBox}>
              <p>{v.telefono || 'Sin teléfono'}</p>
              <p>{v.email || 'Sin correo'}</p>
            </div>

            <div style={s.hoursBox}>
              <p style={s.hoursTitle}>Horarios disponibles</p>

              <div style={s.hoursList}>
                {v.horarios.map(h => (
                  <span key={h} style={s.hourChip}>
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <div style={s.actions}>
              <button style={s.btnEdit} onClick={() => openEdit(v)}>
                <Edit2 size={13} />
                Editar horarios
              </button>

              <button
                style={s.btnState}
                onClick={() => cambiarEstado(v.id_veterinario || v.idVeterinario)}
              >
                {v.estado === 'Activo' ? <UserX size={13} /> : <UserCheck size={13} />}
                {v.estado === 'Activo' ? 'Desactivar' : 'Activar'}
              </button>

              <button
                style={s.btnDelete}
                onClick={() => eliminarVeterinario(v.id_veterinario || v.idVeterinario)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={s.empty}>
            <Stethoscope size={42} color="var(--text-muted)" />
            <p>No se encontraron veterinarios.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>
                  {editId ? 'Editar veterinario' : 'Nuevo veterinario'}
                </h3>

                <p style={s.modalSub}>
                  {editId
                    ? 'Actualiza datos y horarios del veterinario.'
                    : 'Registra un nuevo veterinario disponible.'}
                </p>
              </div>

              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.previewBox}>
                <div style={s.previewAvatar}>
                  {form.foto || '👨‍⚕️'}
                </div>

                <div>
                  <h4 style={s.previewName}>
                    Dr(a). {form.nombre || 'Nombre'} {form.apellido || 'Apellido'}
                  </h4>

                  <p style={s.previewText}>
                    {form.especialidad || 'Especialidad'}
                  </p>
                </div>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Nombre *</label>
                  <input
                    style={s.input}
                    placeholder="Ej: Luis"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Apellido *</label>
                  <input
                    style={s.input}
                    placeholder="Ej: Ramírez"
                    value={form.apellido}
                    onChange={e => setForm({ ...form, apellido: e.target.value })}
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Especialidad *</label>
                <select
                  style={s.input}
                  value={form.especialidad}
                  onChange={e => setForm({ ...form, especialidad: e.target.value })}
                >
                  {especialidades.map(e => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Teléfono</label>
                  <input
                    style={s.input}
                    placeholder="9 dígitos"
                    maxLength={9}
                    value={form.telefono}
                    onChange={e =>
                      setForm({
                        ...form,
                        telefono: e.target.value.replace(/\D/g, '')
                      })
                    }
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Correo</label>
                  <input
                    style={s.input}
                    placeholder="correo@vitalvet.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>Estado</label>
                  <select
                    style={s.input}
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Ícono</label>
                  <select
                    style={s.input}
                    value={form.foto}
                    onChange={e => setForm({ ...form, foto: e.target.value })}
                  >
                    <option>👨‍⚕️</option>
                    <option>👩‍⚕️</option>
                    <option>🩺</option>
                  </select>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Horarios disponibles *</label>
                <input
                  style={s.input}
                  placeholder="Ej: 09:00, 10:30, 12:00, 15:00"
                  value={form.horarios}
                  onChange={e => setForm({ ...form, horarios: e.target.value })}
                />

                <small style={s.helper}>
                  Escribe los horarios separados por coma. Por ahora son visuales; luego los conectamos a horarios_veterinario.
                </small>
              </div>

              <div style={s.field}>
                <label style={s.label}>Citas asignadas</label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="Ej: 5"
                  value={form.citasAsignadas}
                  onChange={e => setForm({ ...form, citasAsignadas: e.target.value })}
                />
              </div>

              {error && <p style={s.error}>{error}</p>}
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setModal(false)}>
                Cancelar
              </button>

              <button style={s.btnSave} onClick={handleSave}>
                <Save size={14} />
                {editId ? 'Guardar cambios' : 'Registrar veterinario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22
  },

  title: {
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--text-main)'
  },

  sub: {
    fontSize: 13,
    color: 'var(--text-sub)',
    marginTop: 4
  },

  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px 20px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(232,97,44,.22)'
  },

  loadingBox: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 40,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: 'var(--text-sub)'
  },

  errorBox: {
    background: '#fff',
    border: '1px solid #FECACA',
    borderRadius: 16,
    padding: 40,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: '#991B1B'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 20
  },

  statCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 18,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: 13
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  statNumber: {
    fontSize: 25,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  statLabel: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  toolbar: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 14,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    gap: 12,
    marginBottom: 18
  },

  searchWrap: {
    position: 'relative',
    flex: 1
  },

  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)'
  },

  searchInput: {
    width: '100%',
    padding: '11px 12px 11px 38px',
    border: '1px solid var(--border)',
    borderRadius: 11,
    background: '#FAFAFA',
    fontSize: 13,
    color: 'var(--text-main)'
  },

  select: {
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: 11,
    background: '#FAFAFA',
    fontSize: 13,
    color: 'var(--text-main)',
    minWidth: 150
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: 16
  },

  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid var(--border)',
    padding: 20,
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    flexShrink: 0
  },

  vetName: {
    fontSize: 15,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  vetSpec: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  badgeActivo: {
    background: '#D1FAE5',
    color: '#065F46',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800
  },

  badgeInactivo: {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10
  },

  infoBox: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    fontSize: 12,
    color: 'var(--text-sub)'
  },

  contactBox: {
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: 'var(--text-sub)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },

  hoursBox: {
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 12,
    background: '#fff'
  },

  hoursTitle: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 900,
    textTransform: 'uppercase',
    marginBottom: 8
  },

  hoursList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7
  },

  hourChip: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 999,
    padding: '5px 10px',
    fontSize: 11,
    fontWeight: 800
  },

  actions: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr auto',
    gap: 8
  },

  btnEdit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#2563EB',
    borderRadius: 9,
    padding: '8px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
  },

  btnState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    color: 'var(--text-sub)',
    borderRadius: 9,
    padding: '8px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
  },

  btnDelete: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFF0F0',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 9,
    padding: '8px 10px',
    cursor: 'pointer'
  },

  empty: {
    gridColumn: '1 / -1',
    padding: 42,
    borderRadius: 16,
    border: '1px dashed var(--border)',
    background: '#fff',
    boxShadow: 'var(--shadow)',
    color: 'var(--text-sub)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    fontSize: 13
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: 16
  },

  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 560,
    boxShadow: '0 25px 60px rgba(0,0,0,0.22)',
    maxHeight: '92vh',
    overflowY: 'auto'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 22px',
    borderBottom: '1px solid var(--border)'
  },

  modalTitle: {
    fontSize: 17,
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
    alignItems: 'center',
    cursor: 'pointer'
  },

  modalBody: {
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },

  previewBox: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 13
  },

  previewAvatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30
  },

  previewName: {
    fontSize: 16,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  previewText: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 2
  },

  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },

  label: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--text-sub)'
  },

  input: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 9,
    fontSize: 13,
    background: '#FAFAFA',
    color: 'var(--text-main)',
    outline: 'none'
  },

  helper: {
    fontSize: 11,
    color: 'var(--text-muted)'
  },

  error: {
    background: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 700
  },

  modalFooter: {
    padding: '14px 22px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10
  },

  btnCancel: {
    padding: '10px 18px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: 'transparent',
    color: 'var(--text-sub)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer'
  },

  btnSave: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 18px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer'
  }
}
