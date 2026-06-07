import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Eye,
  PawPrint,
  Dog,
  Cat,
  Rabbit,
  UserRound,
  Activity,
  CalendarDays,
  AlertCircle
} from 'lucide-react'

import {
  getClientes
} from '../services/clientesService'

import {
  getMascotas,
  crearMascota,
  actualizarMascota,
  eliminarMascota
} from '../services/mascotasService'

const emptyForm = {
  nombre: '',
  especie: 'Perro',
  raza: '',
  edad: '',
  sexo: 'Macho',
  id_cliente: '',
  peso: '',
  ultimaVisita: ''
}

const iconEspecie = (e) => {
  if (e === 'Perro') return '🐶'
  if (e === 'Gato') return '🐱'
  if (e === 'Conejo') return '🐰'
  if (e === 'Ave') return '🐦'
  return '🐾'
}

const badgeColor = (e) => ({
  background:
    e === 'Perro'
      ? '#FFF0E8'
      : e === 'Gato'
      ? '#DBEAFE'
      : e === 'Conejo'
      ? '#FEF3C7'
      : '#F1F5F9',
  color:
    e === 'Perro'
      ? '#993C1D'
      : e === 'Gato'
      ? '#1D4ED8'
      : e === 'Conejo'
      ? '#92400E'
      : '#475569'
})

export default function Mascotas() {
  const [mascotas, setMascotas] = useState([])
  const [clientes, setClientes] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorPage, setErrorPage] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [modal, setModal] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setErrorPage('')

        const [dataMascotas, dataClientes] = await Promise.all([
          getMascotas(),
          getClientes()
        ])

        setMascotas(dataMascotas)
        setClientes(dataClientes)
      } catch (error) {
        setErrorPage(error.message || 'Error al cargar mascotas.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const nombreCliente = (id_cliente) => {
    const cliente = clientes.find(c => Number(c.id_cliente) === Number(id_cliente))

    return cliente
      ? `${cliente.nombre} ${cliente.apellido}`
      : 'Sin propietario'
  }

  const normalizarMascota = (m) => ({
    ...m,
    id: m.id || m.id_mascota || m.idMascota,
    id_mascota: m.id_mascota || m.idMascota,
    id_cliente: m.id_cliente || m.idCliente,
    cliente: m.cliente || nombreCliente(m.id_cliente || m.idCliente),
    estado: m.estado || 'Activo',
    peso: m.peso ?? '',
    ultimaVisita: m.ultimaVisita || 'Sin registro'
  })

  const mascotasNormalizadas = mascotas.map(normalizarMascota)

  const filtered = mascotasNormalizadas.filter(m => {
    const texto = `${m.nombre} ${m.cliente} ${m.raza} ${m.especie}`.toLowerCase()
    const matchBusq = texto.includes(busqueda.toLowerCase())
    const matchEsp = filtroEspecie === 'Todas' || m.especie === filtroEspecie

    return matchBusq && matchEsp
  })

  const totalPerros = mascotas.filter(m => m.especie === 'Perro').length
  const totalGatos = mascotas.filter(m => m.especie === 'Gato').length
  const totalOtros = mascotas.filter(m => m.especie !== 'Perro' && m.especie !== 'Gato').length

  const openNew = () => {
    setForm({
      ...emptyForm,
      id_cliente: clientes[0]?.id_cliente || ''
    })

    setEditId(null)
    setError('')
    setModal(true)
  }

  const openEdit = (m) => {
    setForm({
      nombre: m.nombre || '',
      especie: m.especie || 'Perro',
      raza: m.raza || '',
      edad: m.edad ?? '',
      sexo: m.sexo || 'Macho',
      id_cliente: m.id_cliente || '',
      peso: m.peso ?? '',
      ultimaVisita: m.ultimaVisita === 'Sin registro' ? '' : m.ultimaVisita || ''
    })

    setEditId(m.id_mascota || m.idMascota || m.id)
    setError('')
    setModal(true)
  }

  const handleSave = async () => {
    setError('')

    if (!form.nombre.trim()) {
      setError('Ingresa el nombre de la mascota.')
      return
    }

    if (!form.id_cliente) {
      setError('Selecciona un propietario.')
      return
    }

    if (form.edad && Number(form.edad) < 0) {
      setError('La edad no puede ser negativa.')
      return
    }

    if (form.peso && Number(form.peso) < 0) {
      setError('El peso no puede ser negativo.')
      return
    }

    const mascotaGuardada = {
      nombre: form.nombre.trim(),
      especie: form.especie,
      raza: form.raza.trim(),
      edad: form.edad !== '' ? Number(form.edad) : 0,
      sexo: form.sexo,
      id_cliente: Number(form.id_cliente),
      estado: 'Activo',
      peso: form.peso !== '' ? Number(form.peso) : null,
      ultimaVisita: form.ultimaVisita || 'Sin registro'
    }

    try {
      if (editId) {
        const actualizada = await actualizarMascota(editId, mascotaGuardada)
        const normalizada = normalizarMascota(actualizada)

        setMascotas(prev =>
          prev.map(m =>
            Number(m.id_mascota || m.idMascota || m.id) === Number(editId)
              ? normalizada
              : m
          )
        )
      } else {
        const nuevaMascota = await crearMascota(mascotaGuardada)
        const normalizada = normalizarMascota(nuevaMascota)

        setMascotas(prev => [...prev, normalizada])
      }

      setModal(false)
      setForm(emptyForm)
      setEditId(null)
    } catch (error) {
      setError(error.message || 'No se pudo guardar la mascota.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta mascota?')) return

    try {
      await eliminarMascota(id)

      setMascotas(prev =>
        prev.filter(m => Number(m.id_mascota || m.idMascota || m.id) !== Number(id))
      )
    } catch (error) {
      alert(error.message || 'No se pudo eliminar la mascota.')
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <PawPrint size={34} color="var(--primary)" />
        <h3>Cargando mascotas...</h3>
        <p>Estamos preparando la información de mascotas registradas.</p>
      </div>
    )
  }

  if (errorPage) {
    return (
      <div style={styles.errorBox}>
        <AlertCircle size={34} color="#DC2626" />
        <h3>Error al cargar mascotas</h3>
        <p>{errorPage}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mascotas</h1>
          <p style={styles.sub}>
            Administra las mascotas registradas y su información principal.
          </p>
        </div>

        <button style={styles.btnAdd} onClick={openNew}>
          <Plus size={16} />
          Nueva mascota
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <PawPrint size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{mascotas.length}</div>
            <div style={styles.statLabel}>Total mascotas</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#DBEAFE', color: '#2563EB' }}>
            <Dog size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{totalPerros}</div>
            <div style={styles.statLabel}>Perros</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#EDE9FE', color: '#7C3AED' }}>
            <Cat size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{totalGatos}</div>
            <div style={styles.statLabel}>Gatos</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#FEF3C7', color: '#D97706' }}>
            <Rabbit size={20} />
          </div>

          <div>
            <div style={styles.statNumber}>{totalOtros}</div>
            <div style={styles.statLabel}>Otras especies</div>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />

          <input
            style={styles.searchInput}
            placeholder="Buscar por mascota, cliente, raza o especie..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <select
          style={styles.select}
          value={filtroEspecie}
          onChange={e => setFiltroEspecie(e.target.value)}
        >
          <option>Todas</option>
          <option>Perro</option>
          <option>Gato</option>
          <option>Conejo</option>
          <option>Ave</option>
          <option>Otro</option>
        </select>
      </div>

      <div style={styles.tableWrap}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.tableTitle}>Listado de mascotas</h3>
            <p style={styles.tableSub}>
              {filtered.length} resultado(s) encontrados
            </p>
          </div>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Mascota', 'Especie', 'Edad', 'Sexo', 'Propietario', 'Última visita', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>
                    <div style={styles.petCell}>
                      <div style={styles.petAvatar}>
                        {iconEspecie(m.especie)}
                      </div>

                      <div>
                        <div style={styles.petName}>{m.nombre}</div>
                        <div style={styles.petBreed}>{m.raza || 'Sin raza registrada'}</div>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeColor(m.especie) }}>
                      {m.especie}
                    </span>
                  </td>

                  <td style={styles.td}>{m.edad ? `${m.edad} años` : '—'}</td>

                  <td style={styles.td}>{m.sexo}</td>

                  <td style={styles.td}>
                    <div style={styles.ownerCell}>
                      <UserRound size={14} />
                      {m.cliente}
                    </div>
                  </td>

                  <td style={styles.td}>{m.ultimaVisita || 'Sin registro'}</td>

                  <td style={styles.td}>
                    <span style={styles.badgeOk}>{m.estado}</span>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.btnView} onClick={() => setModalDetalle(m)}>
                        <Eye size={13} />
                      </button>

                      <button style={styles.btnEdit} onClick={() => openEdit(m)}>
                        <Edit2 size={13} />
                      </button>

                      <button style={styles.btnDel} onClick={() => handleDelete(m.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={styles.empty}>
            <PawPrint size={38} color="var(--text-muted)" />
            <p>No se encontraron mascotas con ese criterio.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>
                  {editId ? 'Editar mascota' : 'Nueva mascota'}
                </h3>

                <p style={styles.modalSub}>
                  {editId
                    ? 'Actualiza los datos principales de la mascota.'
                    : 'Registra una nueva mascota en el sistema.'}
                </p>
              </div>

              <button style={styles.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formPreview}>
                <div style={styles.previewIcon}>
                  {iconEspecie(form.especie)}
                </div>

                <div>
                  <h4 style={styles.previewName}>
                    {form.nombre || 'Nombre de mascota'}
                  </h4>

                  <p style={styles.previewText}>
                    {form.especie} · {form.raza || 'Raza no registrada'}
                  </p>
                </div>
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label}>Nombre de la mascota *</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: Max"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Propietario *</label>
                  <select
                    style={styles.input}
                    value={form.id_cliente}
                    onChange={e => setForm({ ...form, id_cliente: e.target.value })}
                  >
                    <option value="">Selecciona propietario</option>

                    {clientes.map(c => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre} {c.apellido} — DNI {c.dni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label}>Especie</label>
                  <select
                    style={styles.input}
                    value={form.especie}
                    onChange={e => setForm({ ...form, especie: e.target.value })}
                  >
                    <option>Perro</option>
                    <option>Gato</option>
                    <option>Conejo</option>
                    <option>Ave</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Raza</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: Labrador"
                    value={form.raza}
                    onChange={e => setForm({ ...form, raza: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.row3}>
                <div style={styles.field}>
                  <label style={styles.label}>Edad</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    placeholder="Ej: 3"
                    value={form.edad}
                    onChange={e => setForm({ ...form, edad: e.target.value })}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Sexo</label>
                  <select
                    style={styles.input}
                    value={form.sexo}
                    onChange={e => setForm({ ...form, sexo: e.target.value })}
                  >
                    <option>Macho</option>
                    <option>Hembra</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Peso</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 24.5"
                    value={form.peso}
                    onChange={e => setForm({ ...form, peso: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Última visita</label>
                <input
                  style={styles.input}
                  placeholder="Ej: 02/05/2026"
                  value={form.ultimaVisita}
                  onChange={e => setForm({ ...form, ultimaVisita: e.target.value })}
                />
              </div>

              {error && (
                <div style={styles.error}>
                  {error}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setModal(false)}>
                Cancelar
              </button>

              <button style={styles.btnSave} onClick={handleSave}>
                {editId ? 'Guardar cambios' : 'Registrar mascota'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalDetalle && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: 520 }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Ficha de mascota</h3>
                <p style={styles.modalSub}>
                  Información detallada registrada en VitalVet.
                </p>
              </div>

              <button style={styles.closeBtn} onClick={() => setModalDetalle(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.detailBody}>
              <div style={styles.petHero}>
                <div style={styles.bigPetAvatar}>
                  {iconEspecie(modalDetalle.especie)}
                </div>

                <div>
                  <h2 style={styles.detailName}>{modalDetalle.nombre}</h2>
                  <p style={styles.detailSub}>
                    {modalDetalle.raza} · {modalDetalle.especie}
                  </p>

                  <span style={styles.badgeOk}>{modalDetalle.estado}</span>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailBox}>
                  <Activity size={17} color="var(--primary)" />
                  <span>Edad</span>
                  <b>{modalDetalle.edad ? `${modalDetalle.edad} años` : 'No registrado'}</b>
                </div>

                <div style={styles.detailBox}>
                  <PawPrint size={17} color="var(--primary)" />
                  <span>Sexo</span>
                  <b>{modalDetalle.sexo}</b>
                </div>

                <div style={styles.detailBox}>
                  <Dog size={17} color="var(--primary)" />
                  <span>Peso</span>
                  <b>{modalDetalle.peso ? `${modalDetalle.peso} kg` : 'No registrado'}</b>
                </div>

                <div style={styles.detailBox}>
                  <CalendarDays size={17} color="var(--primary)" />
                  <span>Última visita</span>
                  <b>{modalDetalle.ultimaVisita || 'Sin registro'}</b>
                </div>
              </div>

              <div style={styles.ownerBox}>
                <div style={styles.ownerIcon}>
                  <UserRound size={18} />
                </div>

                <div>
                  <span>Propietario</span>
                  <b>{modalDetalle.cliente}</b>
                </div>
              </div>

              <div style={styles.noteBox}>
                <b>Nota clínica:</b> Esta ficha muestra información general de la mascota.
                El historial médico completo se gestiona desde el módulo de Historial.
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

  tableWrap: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)'
  },

  tableHeader: {
    padding: '18px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  tableTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text-main)'
  },

  tableSub: {
    fontSize: 12,
    color: 'var(--text-sub)',
    marginTop: 3
  },

  tableScroll: {
    width: '100%',
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    minWidth: 920,
    borderCollapse: 'collapse'
  },

  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 800,
    textTransform: 'uppercase',
    background: '#F8FAFC',
    borderBottom: '1px solid var(--border)'
  },

  td: {
    padding: '13px 14px',
    fontSize: 13,
    borderBottom: '1px solid #F5F5F5',
    color: 'var(--text-main)'
  },

  trEven: {
    background: '#FEFCFB'
  },

  petCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 11
  },

  petAvatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0
  },

  petName: {
    fontWeight: 800,
    color: 'var(--text-main)',
    marginBottom: 2
  },

  petBreed: {
    fontSize: 12,
    color: 'var(--text-muted)'
  },

  ownerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--text-sub)',
    fontWeight: 600
  },

  badge: {
    padding: '4px 11px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap'
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

  actions: {
    display: 'flex',
    gap: 7
  },

  btnView: {
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#2563EB',
    borderRadius: 8,
    padding: '7px 9px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },

  btnEdit: {
    background: '#F0F4FF',
    border: '1px solid #C7D2FE',
    color: '#3730A3',
    borderRadius: 8,
    padding: '7px 9px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },

  btnDel: {
    background: '#FFF0F0',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 8,
    padding: '7px 9px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },

  empty: {
    padding: 38,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    color: 'var(--text-muted)',
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

  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28
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

  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
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

  petHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border)'
  },

  bigPetAvatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38
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

  ownerBox: {
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },

  ownerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: '#DBEAFE',
    color: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
