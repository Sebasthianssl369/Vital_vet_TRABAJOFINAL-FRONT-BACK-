import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

const inicial = [
  { id:1, nombre:'Carlos',  apellido:'Pérez',   dni:'45123678', telefono:'987654321', email:'c.perez@gmail.com',    direccion:'Av. Larco 123, Miraflores' },
  { id:2, nombre:'María',   apellido:'Torres',  dni:'72345891', telefono:'976543210', email:'m.torres@gmail.com',   direccion:'Jr. Cusco 456, San Isidro' },
  { id:3, nombre:'Jorge',   apellido:'Silva',   dni:'61234567', telefono:'965432109', email:'j.silva@hotmail.com',  direccion:'Calle Lima 789, Surco'     },
  { id:4, nombre:'Lucía',   apellido:'Ramírez', dni:'55678901', telefono:'954321098', email:'l.ramirez@gmail.com',  direccion:'Av. Perú 321, La Molina'   },
]

const emptyForm = { nombre:'', apellido:'', dni:'', telefono:'', email:'', direccion:'' }

export default function Clientes() {
  const [clientes, setClientes] = useState(inicial)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const filtered = clientes.filter(c =>
    `${c.nombre} ${c.apellido} ${c.dni}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const openNew  = () => { setForm(emptyForm); setEditId(null); setModal(true) }
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setModal(true) }

  const handleSave = () => {
    if (!form.nombre || !form.apellido) return
    if (editId) {
      setClientes(clientes.map(c => c.id === editId ? { ...form, id: editId } : c))
    } else {
      setClientes([...clientes, { ...form, id: Date.now() }])
    }
    setModal(false)
  }

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este cliente?')) setClientes(clientes.filter(c => c.id !== id))
  }

  const initials = (c) => (c.nombre.charAt(0) + c.apellido.charAt(0)).toUpperCase()

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clientes</h1>
          <p style={styles.sub}>{clientes.length} propietarios registrados</p>
        </div>
        <button style={styles.btnAdd} onClick={openNew}><Plus size={16}/> Nuevo cliente</button>
      </div>

      <div style={styles.filtros}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon}/>
          <input style={styles.searchInput} placeholder="Buscar por nombre o DNI..." value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
        </div>
      </div>

      <div style={styles.grid}>
        {filtered.map(c => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.avatar}>{initials(c)}</div>
              <div>
                <div style={styles.clienteName}>{c.nombre} {c.apellido}</div>
                <div style={styles.clienteDni}>DNI: {c.dni}</div>
              </div>
            </div>
            <div style={styles.info}>
              <div style={styles.infoRow}><span>📞</span> {c.telefono}</div>
              <div style={styles.infoRow}><span>✉️</span> {c.email}</div>
              <div style={styles.infoRow}><span>📍</span> {c.direccion}</div>
            </div>
            <div style={styles.actions}>
              <button style={styles.btnEdit} onClick={() => openEdit(c)}><Edit2 size={13}/> Editar</button>
              <button style={styles.btnDel}  onClick={() => handleDelete(c.id)}><Trash2 size={13}/> Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button style={styles.closeBtn} onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  {label:'Nombre',    key:'nombre',    placeholder:'Ej: Carlos'},
                  {label:'Apellido',  key:'apellido',  placeholder:'Ej: Pérez'},
                  {label:'DNI',       key:'dni',       placeholder:'8 dígitos'},
                  {label:'Teléfono',  key:'telefono',  placeholder:'9 dígitos'},
                ].map(f => (
                  <div key={f.key} style={styles.field}>
                    <label style={styles.label}>{f.label}</label>
                    <input style={styles.input} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}/>
                  </div>
                ))}
              </div>
              {[
                {label:'Correo electrónico', key:'email',     placeholder:'correo@ejemplo.com'},
                {label:'Dirección',          key:'direccion', placeholder:'Av. Ejemplo 123, Distrito'},
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input style={styles.input} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}/>
                </div>
              ))}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
              <button style={styles.btnSave}   onClick={handleSave}>{editId ? 'Guardar cambios' : 'Registrar cliente'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 },
  title:     { fontSize:22, fontWeight:700 },
  sub:       { fontSize:13, color:'var(--text-sub)', marginTop:3 },
  btnAdd:    { display:'flex', alignItems:'center', gap:7, background:'var(--primary)', color:'#fff', border:'none', borderRadius:9, padding:'10px 18px', fontWeight:600, fontSize:13 },
  filtros:   { marginBottom:18 },
  searchWrap:{ position:'relative', maxWidth:360 },
  searchIcon:{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' },
  searchInput:{ width:'100%', padding:'9px 12px 9px 32px', border:'1px solid var(--border)', borderRadius:8, background:'#fff', fontSize:13 },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 },
  card:      { background:'#fff', borderRadius:12, border:'1px solid var(--border)', padding:18, boxShadow:'var(--shadow)', display:'flex', flexDirection:'column', gap:12 },
  cardTop:   { display:'flex', alignItems:'center', gap:12 },
  avatar:    { width:44, height:44, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, flexShrink:0 },
  clienteName:{ fontWeight:700, fontSize:14 },
  clienteDni:{ fontSize:11, color:'var(--text-muted)', marginTop:2 },
  info:      { display:'flex', flexDirection:'column', gap:5 },
  infoRow:   { fontSize:12, color:'var(--text-sub)', display:'flex', alignItems:'center', gap:6 },
  actions:   { display:'flex', gap:8, marginTop:4 },
  btnEdit:   { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:'#F0F4FF', border:'1px solid #C7D2FE', color:'#3730A3', borderRadius:7, padding:'7px', fontSize:12, fontWeight:500 },
  btnDel:    { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, background:'#FFF0F0', border:'1px solid #FECACA', color:'#B91C1C', borderRadius:7, padding:'7px', fontSize:12, fontWeight:500 },
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:     { background:'#fff', borderRadius:14, width:'100%', maxWidth:500, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid var(--border)' },
  modalTitle:{ fontSize:16, fontWeight:700 },
  closeBtn:  { background:'transparent', border:'none', color:'var(--text-muted)', display:'flex', alignItems:'center' },
  modalBody: { padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 },
  modalFooter:{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 },
  field:     { display:'flex', flexDirection:'column', gap:5 },
  label:     { fontSize:12, fontWeight:600, color:'var(--text-sub)' },
  input:     { padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, background:'#FAFAFA' },
  btnCancel: { padding:'9px 18px', border:'1px solid var(--border)', borderRadius:8, background:'transparent', color:'var(--text-sub)', fontSize:13, fontWeight:500 },
  btnSave:   { padding:'9px 18px', background:'var(--primary)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600 },
}
