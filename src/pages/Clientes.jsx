import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Eye,
  Users,
  Phone,
  Mail,
  MapPin,
  IdCard,
  PawPrint,
  CalendarDays,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

import { MASCOTAS } from '../data/db'

import {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../services/clientesService'

const emptyForm = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: 'Activo',
  fechaRegistro: '',
  mascotas: ''
}

const getMascotasByClienteLocal = (id_cliente) =>
  MASCOTAS.filter(m => m.id_cliente === Number(id_cliente)).map(m => m.nombre)

const normalizarCliente = (c) => ({
  ...c,
  id: c.id || c.id_cliente,
  fechaRegistro: c.fechaRegistro || 'Sin registro',
  estado: c.estado || 'Activo',
  mascotas: c.mascotas || getMascotasByClienteLocal(c.id_cliente)
})

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        const data = await getClientes()

        setClientes(
          data.map(c => ({
            ...c,
            id: c.id_cliente,
            fechaRegistro: c.fechaRegistro || 'Sin registro',
            estado: c.estado || 'Activo',
            mascotas: c.mascotas || getMascotasByClienteLocal(c.id_cliente)
          }))
        )
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar clientes.')
      } finally {
        setLoading(false)
      }
    }

    cargarClientes()
  }, [])

  const clientesNormalizados = clientes.map(normalizarCliente)

  const filtered = clientesNormalizados.filter(c =>
    `${c.nombre} ${c.apellido} ${c.dni} ${c.telefono} ${c.email}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  const totalClientes = clientes.length
  const clientesActivos = clientes.filter(c => c.estado === 'Activo').length
  const conTelefono = clientes.filter(c => c.telefono).length
  const totalMascotas = clientesNormalizados.reduce((acc, c) => acc + (c.mascotas?.length || 0), 0)

  const initials = (c) =>
    `${c.nombre?.charAt(0) || ''}${c.apellido?.charAt(0) || ''}`.toUpperCase()

  const validarEmail = (email) => {
    if (!email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const openNew = () => {
    setForm({
      ...emptyForm,
      fechaRegistro: new Date().toLocaleDateString('es-PE')
    })
    setEditId(null)
    setError('')
    setModal(true)
  }

  const openEdit = (c) => {
    setForm({
      nombre: c.nombre || '',
      apellido: c.apellido || '',
      dni: c.dni || '',
      telefono: c.telefono || '',
      email: c.email || '',
      direccion: c.direccion || '',
      estado: c.estado || 'Activo',
      fechaRegistro: c.fechaRegistro || '',
      mascotas: c.mascotas?.join(', ') || ''
    })

    setEditId(c.id)
    setError('')
    setModal(true)
  }

  const handleSave = async () => {
    setError('')

    if (!form.nombre.trim() || !form.apellido.trim() || !form.dni.trim()) {
      setError('Completa nombre, apellido y DNI.')
      return
    }

    if (form.dni.length !== 8) {
      setError('El DNI debe tener exactamente 8 dígitos.')
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

    const clienteGuardado = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      dni: form.dni,
      telefono: form.telefono,
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      estado: form.estado,
      fechaRegistro: form.fechaRegistro || new Date().toLocaleDateString('es-PE'),
      mascotas: form.mascotas
        ? form.mascotas.split(',').map(m => m.trim()).filter(Boolean)
        : []
    }

    try {
      if (editId) {
        const actualizado = await actualizarCliente(editId, clienteGuardado)

        setClientes(prev =>
          prev.map(c =>
            (c.id || c.id_cliente) === editId
              ? {
                  ...c,
                  ...actualizado,
                  id: editId,
                  id_cliente: c.id_cliente || editId
                }
              : c
          )
        )
      } else {
        const nuevoCliente = await crearCliente(clienteGuardado)

        setClientes(prev => [
          ...prev,
          {
            ...nuevoCliente,
            id: nuevoCliente.id_cliente,
            mascotas: nuevoCliente.mascotas || []
          }
        ])
      }

      setModal(false)
      setForm(emptyForm)
      setEditId(null)
    } catch (error) {
      setError(error.message || 'No se pudo guardar el cliente.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return

    try {
      await eliminarCliente(id)
      setClientes(prev => prev.filter(c => (c.id || c.id_cliente) !== id))
    } catch (error) {
      alert(error.message || 'No se pudo eliminar el cliente.')
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Users size={34} color="var(--primary)" />
        <h3>Cargando clientes...</h3>
        <p>Estamos preparando la información de propietarios.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={styles.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar clientes</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clientes</h1>
          <p style={styles.sub}>
            Gestiona propietarios, datos de contacto y mascotas asociadas.
          </p>
        </div>

        <button style={styles.btnAdd} onClick={openNew}>
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{totalClientes}</div>
            <div style={styles.statText}>Clientes registrados</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#D1FAE5', color: '#059669' }}>
            <ShieldCheck size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{clientesActivos}</div>
            <div style={styles.statText}>Clientes activos</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <Phone size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{conTelefono}</div>
            <div style={styles.statText}>Con teléfono</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#FEF3C7', color: '#D97706' }}>
            <PawPrint size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{totalMascotas}</div>
            <div style={styles.statText}>Mascotas asociadas</div>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />

          <input
            style={styles.searchInput}
            placeholder="Buscar por nombre, DNI, teléfono o correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.grid}>
        {filtered.map(c => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.avatar}>
                {initials(c)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={styles.clienteName}>
                  {c.nombre} {c.apellido}
                </div>

                <div style={styles.clienteDni}>
                  DNI: {c.dni}
                </div>
              </div>

              <span style={c.estado === 'Activo' ? styles.badgeOk : styles.badgeInactive}>
                {c.estado}
              </span>
            </div>

            <div style={styles.info}>
              <div style={styles.infoRow}>
                <Phone size={14} />
                <span>{c.telefono || 'Sin teléfono'}</span>
              </div>

              <div style={styles.infoRow}>
                <Mail size={14} />
                <span>{c.email || 'Sin correo'}</span>
              </div>

              <div style={styles.infoRow}>
                <MapPin size={14} />
                <span>{c.direccion || 'Sin dirección'}</span>
              </div>
            </div>

            <div style={styles.petStrip}>
              <PawPrint size={15} />
              <span>
                {c.mascotas?.length
                  ? `${c.mascotas.length} mascota(s): ${c.mascotas.join(', ')}`
                  : 'Sin mascotas registradas'}
              </span>
            </div>

            <div style={styles.actions}>
              <button style={styles.btnView} onClick={() => setModalDetalle(c)}>
                <Eye size={13} />
                Ver
              </button>

              <button style={styles.btnEdit} onClick={() => openEdit(c)}>
                <Edit2 size={13} />
                Editar
              </button>

              <button style={styles.btnDel} onClick={() => handleDelete(c.id)}>
                <Trash2 size={13} />
                Eliminar
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={styles.empty}>
            <Users size={42} color="var(--text-muted)" />
            <p>No se encontraron clientes con ese criterio.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>
                  {editId ? 'Editar cliente' : 'Nuevo cliente'}
                </h3>

                <p style={styles.modalSub}>
                  {editId
                    ? 'Actualiza la información del propietario.'
                    : 'Registra un nuevo propietario en el sistema.'}
                </p>
              </div>

              <button style={styles.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formPreview}>
                <div style={styles.previewAvatar}>
                  {(form.nombre?.charAt(0) || 'C').toUpperCase()}
                </div>

                <div>
                  <h4 style={styles.previewName}>
                    {form.nombre || 'Nombre'} {form.apellido || 'Apellido'}
                  </h4>

                  <p style={styles.previewText}>
                    {form.email || 'correo@ejemplo.com'}
                  </p>
                </div>
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label}>Nombre *</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: Carlos"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Apellido *</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: Pérez"
                    value={form.apellido}
                    onChange={e => setForm({ ...form, apellido: e.target.value })}
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
                    value={form.dni}
                    onChange={e =>
                      setForm({
                        ...form,
                        dni: e.target.value.replace(/\D/g, '')
                      })
                    }
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    style={styles.input}
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
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Correo electrónico</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Dirección</label>
                <input
                  style={styles.input}
                  placeholder="Av. Ejemplo 123, Distrito"
                  value={form.direccion}
                  onChange={e => setForm({ ...form, direccion: e.target.value })}
                />
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label}>Estado</label>
                  <select
                    style={styles.input}
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Fecha de registro</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: 03/06/2026"
                    value={form.fechaRegistro}
                    onChange={e => setForm({ ...form, fechaRegistro: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Mascotas asociadas</label>
                <input
                  style={styles.input}
                  placeholder="Ej: Max, Luna"
                  value={form.mascotas}
                  onChange={e => setForm({ ...form, mascotas: e.target.value })}
                />
              </div>

              {error && <p style={styles.error}>{error}</p>}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setModal(false)}>
                Cancelar
              </button>

              <button style={styles.btnSave} onClick={handleSave}>
                {editId ? 'Guardar cambios' : 'Registrar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDetalle && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: 540 }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Ficha del cliente</h3>
                <p style={styles.modalSub}>
                  Información completa del propietario registrado.
                </p>
              </div>

              <button style={styles.closeBtn} onClick={() => setModalDetalle(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.detailBody}>
              <div style={styles.detailHero}>
                <div style={styles.bigAvatar}>
                  {initials(modalDetalle)}
                </div>

                <div>
                  <h2 style={styles.detailName}>
                    {modalDetalle.nombre} {modalDetalle.apellido}
                  </h2>

                  <p style={styles.detailSub}>
                    Propietario registrado en VitalVet
                  </p>

                  <span style={modalDetalle.estado === 'Activo' ? styles.badgeOk : styles.badgeInactive}>
                    {modalDetalle.estado}
                  </span>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailBox}>
                  <IdCard size={17} color="var(--primary)" />
                  <span>DNI</span>
                  <b>{modalDetalle.dni}</b>
                </div>

                <div style={styles.detailBox}>
                  <Phone size={17} color="var(--primary)" />
                  <span>Teléfono</span>
                  <b>{modalDetalle.telefono || 'Sin registro'}</b>
                </div>

                <div style={styles.detailBox}>
                  <CalendarDays size={17} color="var(--primary)" />
                  <span>Registro</span>
                  <b>{modalDetalle.fechaRegistro || 'Sin registro'}</b>
                </div>

                <div style={styles.detailBox}>
                  <PawPrint size={17} color="var(--primary)" />
                  <span>Mascotas</span>
                  <b>{modalDetalle.mascotas?.length || 0}</b>
                </div>
              </div>

              <div style={styles.contactBox}>
                <div style={styles.contactRow}>
                  <Mail size={16} />
                  <span>{modalDetalle.email || 'Sin correo registrado'}</span>
                </div>

                <div style={styles.contactRow}>
                  <MapPin size={16} />
                  <span>{modalDetalle.direccion || 'Sin dirección registrada'}</span>
                </div>
              </div>

              <div style={styles.petBox}>
                <div style={styles.petBoxHeader}>
                  <PawPrint size={17} />
                  Mascotas asociadas
                </div>

                {modalDetalle.mascotas?.length ? (
                  <div style={styles.petList}>
                    {modalDetalle.mascotas.map((m, i) => (
                      <span key={i} style={styles.petTag}>
                        🐾 {m}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={styles.noPets}>No tiene mascotas asociadas.</p>
                )}
              </div>

              <div style={styles.noteBox}>
                <b>Nota:</b> Esta ficha resume los datos principales del cliente.
                Las mascotas se gestionan desde el módulo de Mascotas.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
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

  statText: {
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
    gap: 14,
    transition: 'all .2s ease'
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 16,
    flexShrink: 0,
    boxShadow: '0 8px 18px rgba(232,97,44,.25)'
  },

  clienteName: {
    fontWeight: 900,
    fontSize: 15,
    color: 'var(--text-main)'
  },

  clienteDni: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2
  },

  badgeOk: {
    background: '#D1FAE5',
    color: '#065F46',
    padding: '4px 11px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    display: 'inline-flex',
    width: 'fit-content'
  },

  badgeInactive: {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: '4px 11px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    display: 'inline-flex',
    width: 'fit-content'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },

  infoRow: {
    fontSize: 12,
    color: 'var(--text-sub)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    lineHeight: 1.4
  },

  petStrip: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'var(--text-sub)',
    fontWeight: 700
  },

  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    marginTop: 2
  },

  btnView: {
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

  btnEdit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    background: '#F0F4FF',
    border: '1px solid #C7D2FE',
    color: '#3730A3',
    borderRadius: 9,
    padding: '8px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer'
  },

  btnDel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    background: '#FFF0F0',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 9,
    padding: '8px',
    fontSize: 12,
    fontWeight: 800,
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

  formPreview: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 13
  },

  previewAvatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 17
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
    padding: '10px 18px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer'
  },

  detailBody: {
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },

  detailHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border)'
  },

  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 900,
    flexShrink: 0
  },

  detailName: {
    fontSize: 24,
    fontWeight: 900,
    color: 'var(--text-main)'
  },

  detailSub: {
    fontSize: 13,
    color: 'var(--text-sub)',
    margin: '2px 0 8px'
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 10
  },

  detailBox: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 13,
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
    borderRadius: 13,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },

  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    fontSize: 13,
    color: 'var(--text-sub)'
  },

  petBox: {
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14,
    background: '#fff'
  },

  petBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--text-main)',
    marginBottom: 10
  },

  petList: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  },

  petTag: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 999,
    padding: '6px 11px',
    fontSize: 12,
    fontWeight: 800
  },

  noPets: {
    fontSize: 12,
    color: 'var(--text-muted)'
  },

  noteBox: {
    background: '#FFFBEA',
    border: '1px solid #FDE68A',
    color: '#92400E',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 12,
    lineHeight: 1.6
  }
}
