import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

const inicial = [
  { id:1, nombre:'Max',   especie:'Perro',  raza:'Labrador',  edad:3, sexo:'Macho',  cliente:'Carlos Pérez',   estado:'Activo' },
  { id:2, nombre:'Luna',  especie:'Gato',   raza:'Siamés',    edad:5, sexo:'Hembra', cliente:'María Torres',   estado:'Activo' },
  { id:3, nombre:'Rocky', especie:'Perro',  raza:'Bulldog',   edad:2, sexo:'Macho',  cliente:'Jorge Silva',    estado:'Activo' },
  { id:4, nombre:'Mia',   especie:'Conejo', raza:'Angora',    edad:1, sexo:'Hembra', cliente:'Lucía Ramírez',  estado:'Activo' },
]

const emptyForm = { nombre:'', especie:'Perro', raza:'', edad:'', sexo:'Macho', cliente:'' }

export default function Mascotas() {
  const [mascotas, setMascotas] = useState(inicial)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('Todas')
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const filtered = mascotas.filter(m => {
    const matchBusq = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                      m.cliente.toLowerCase().includes(busqueda.toLowerCase())
    const matchEsp  = filtroEspecie === 'Todas' || m.especie === filtroEspecie
    return matchBusq && matchEsp
  })

  const openNew = () => { setForm(emptyForm); setEditId(null); setModal(true) }
  const openEdit = (m) => { setForm({ ...m }); setEditId(m.id); setModal(true) }

  const handleSave = () => {
    if (!form.nombre || !form.cliente) return
    if (editId) {
      setMascotas(mascotas.map(m => m.id === editId ? { ...form, id: editId } : m))
    } else {
      setMascotas([...mascotas, { ...form, id: Date.now(), estado:'Activo' }])
    }
    setModal(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar esta mascota?')) setMascotas(mascotas.filter(m => m.id !== id))
  }

  const iconEspecie = (e) => e === 'Perro' ? '🐶' : e === 'Gato' ? '🐱' : e === 'Conejo' ? '🐰' : '🐾'

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mascotas</h1>
          <p style={styles.sub}>{mascotas.length} registros en total</p>
        </div>
        <button style={styles.btnAdd} onClick={openNew}>
          <Plus size={16}/> Nueva mascota
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtros}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon}/>
          <input
            style={styles.searchInput}
            placeholder="Buscar por nombre o cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select style={styles.select} value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}>
          <option>Todas</option>
          <option>Perro</option>
          <option>Gato</option>
          <option>Conejo</option>
          <option>Ave</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Mascota','Especie','Raza','Edad','Sexo','Propietario','Estado','Acciones'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} style={i % 2 === 0 ? styles.trEven : {}}>
                <td style={styles.td}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={styles.petIcon}>{iconEspecie(m.especie)}</span>
                    <b>{m.nombre}</b>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{...styles.badge, ...badgeColor(m.especie)}}>{m.especie}</span>
                </td>
                <td style={styles.td}>{m.raza}</td>
                <td style={styles.td}>{m.edad} años</td>
                <td style={styles.td}>{m.sexo}</td>
                <td style={styles.td}>{m.cliente}</td>
                <td style={styles.td}><span style={styles.badgeOk}>{m.estado}</span></td>
                <td style={styles.td}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={styles.btnEdit} onClick={() => openEdit(m)}><Edit2 size={13}/></button>
                    <button style={styles.btnDel}  onClick={() => handleDelete(m.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={styles.empty}>No se encontraron resultados.</p>}
      </div>

      {/* Modal */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editId ? 'Editar mascota' : 'Nueva mascota'}</h3>
              <button style={styles.closeBtn} onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div style={styles.modalBody}>
              {[
                { label:'Nombre de la mascota', key:'nombre', type:'text', placeholder:'Ej: Max' },
                { label:'Propietario (Cliente)', key:'cliente', type:'text', placeholder:'Nombre del dueño' },
                { label:'Raza', key:'raza', type:'text', placeholder:'Ej: Labrador' },
                { label:'Edad (años)', key:'edad', type:'number', placeholder:'Ej: 3' },
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    style={styles.input}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                  />
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={styles.field}>
                  <label style={styles.label}>Especie</label>
                  <select style={styles.input} value={form.especie} onChange={e => setForm({...form, especie:e.target.value})}>
                    <option>Perro</option><option>Gato</option><option>Conejo</option><option>Ave</option><option>Otro</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Sexo</label>
                  <select style={styles.input} value={form.sexo} onChange={e => setForm({...form, sexo:e.target.value})}>
                    <option>Macho</option><option>Hembra</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
              <button style={styles.btnSave}   onClick={handleSave}>
                {editId ? 'Guardar cambios' : 'Registrar mascota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const badgeColor = (e) => ({
  background: e==='Perro' ? '#FFF0E8' : e==='Gato' ? '#D1FAE5' : '#FEF3C7',
  color:      e==='Perro' ? '#993C1D' : e==='Gato' ? '#065F46' : '#92400E',
})

const styles = {
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 },
  title:     { fontSize:22, fontWeight:700, color:'var(--text-main)' },
  sub:       { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  btnAdd:    { display:'flex', alignItems:'center', gap:7, background:'var(--primary)', color:'#fff', border:'none', borderRadius:9, padding:'10px 18px', fontWeight:600, fontSize:13 },
  filtros:   { display:'flex', gap:10, marginBottom:18 },
  searchWrap:{ position:'relative', flex:1 },
  searchIcon:{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' },
  searchInput:{ width:'100%', padding:'9px 12px 9px 32px', border:'1px solid var(--border)', borderRadius:8, background:'#fff', fontSize:13 },
  select:    { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, background:'#fff', fontSize:13, color:'var(--text-main)' },
  tableWrap: { background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'var(--shadow)' },
  table:     { width:'100%', borderCollapse:'collapse' },
  th:        { textAlign:'left', padding:'11px 14px', fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', background:'#FAFAFA', borderBottom:'1px solid var(--border)' },
  td:        { padding:'11px 14px', fontSize:13, borderBottom:'1px solid #F5F0EB', color:'var(--text-main)' },
  trEven:    { background:'#FEFCFB' },
  petIcon:   { fontSize:20 },
  badge:     { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  badgeOk:   { background:'#D1FAE5', color:'#065F46', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  btnEdit:   { background:'#F0F4FF', border:'1px solid #C7D2FE', color:'#3730A3', borderRadius:7, padding:'5px 8px', display:'flex', alignItems:'center' },
  btnDel:    { background:'#FFF0F0', border:'1px solid #FECACA', color:'#B91C1C', borderRadius:7, padding:'5px 8px', display:'flex', alignItems:'center' },
  empty:     { textAlign:'center', padding:32, color:'var(--text-muted)', fontSize:14 },
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:     { background:'#fff', borderRadius:14, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid var(--border)' },
  modalTitle:{ fontSize:16, fontWeight:700, color:'var(--text-main)' },
  closeBtn:  { background:'transparent', border:'none', color:'var(--text-muted)', display:'flex', alignItems:'center' },
  modalBody: { padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 },
  modalFooter:{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 },
  field:     { display:'flex', flexDirection:'column', gap:5 },
  label:     { fontSize:12, fontWeight:600, color:'var(--text-sub)' },
  input:     { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, background:'#FAFAFA' },
  btnCancel: { padding:'9px 18px', border:'1px solid var(--border)', borderRadius:8, background:'transparent', color:'var(--text-sub)', fontSize:13, fontWeight:500 },
  btnSave:   { padding:'9px 18px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600 },
}
