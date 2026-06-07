// src/data/db.js

// ─────────────────────────────
// USUARIOS
// ─────────────────────────────
export const USUARIOS = [
  {
    id_usuario: 1,
    username: 'admin',
    password: 'admin123',
    rol: 'administrador',
    nombre: 'Administrador',
    id_cliente: null
  },
  {
    id_usuario: 2,
    username: 'cliente',
    password: 'cliente123',
    rol: 'cliente',
    nombre: 'Carlos Pérez',
    id_cliente: 1
  }
]

// ─────────────────────────────
// CLIENTES
// ─────────────────────────────
export const CLIENTES = [
  {
    id_cliente: 1,
    nombre: 'Carlos',
    apellido: 'Pérez',
    dni: '45123678',
    telefono: '987654321',
    email: 'c.perez@gmail.com',
    direccion: 'Av. Larco 123, Miraflores',
    estado: 'Activo'
  },
  {
    id_cliente: 2,
    nombre: 'María',
    apellido: 'Torres',
    dni: '72345891',
    telefono: '976543210',
    email: 'm.torres@gmail.com',
    direccion: 'Jr. Cusco 456, San Isidro',
    estado: 'Activo'
  },
  {
    id_cliente: 3,
    nombre: 'Jorge',
    apellido: 'Silva',
    dni: '61234567',
    telefono: '965432109',
    email: 'j.silva@hotmail.com',
    direccion: 'Calle Lima 789, Surco',
    estado: 'Activo'
  },
  {
    id_cliente: 4,
    nombre: 'Lucía',
    apellido: 'Ramírez',
    dni: '55678901',
    telefono: '954321098',
    email: 'l.ramirez@gmail.com',
    direccion: 'Av. Perú 321, La Molina',
    estado: 'Activo'
  }
]

// ─────────────────────────────
// MASCOTAS
// ─────────────────────────────
export const MASCOTAS = [
  {
    id_mascota: 1,
    id_cliente: 1,
    nombre: 'Max',
    especie: 'Perro',
    raza: 'Labrador',
    edad: 3,
    sexo: 'Macho',
    estado: 'Activo'
  },
  {
    id_mascota: 2,
    id_cliente: 2,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    edad: 5,
    sexo: 'Hembra',
    estado: 'Activo'
  },
  {
    id_mascota: 3,
    id_cliente: 3,
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Bulldog',
    edad: 2,
    sexo: 'Macho',
    estado: 'Activo'
  },
  {
    id_mascota: 4,
    id_cliente: 4,
    nombre: 'Mia',
    especie: 'Conejo',
    raza: 'Angora',
    edad: 1,
    sexo: 'Hembra',
    estado: 'Activo'
  }
]

// ─────────────────────────────
// VETERINARIOS
// ─────────────────────────────
export const VETERINARIOS = [
  {
    id_veterinario: 1,
    nombre: 'Silva',
    apellido: 'Ramírez',
    especialidad: 'Medicina general',
    telefono: '987654321',
    email: 'silva@vitalvet.com',
    estado: 'Activo',
    foto: '👨‍⚕️',
    horarios: ['09:00', '10:30', '12:00', '15:00'],
    citasAsignadas: 12
  },
  {
    id_veterinario: 2,
    nombre: 'Román',
    apellido: 'Torres',
    especialidad: 'Dermatología veterinaria',
    telefono: '976543210',
    email: 'roman@vitalvet.com',
    estado: 'Activo',
    foto: '👩‍⚕️',
    horarios: ['10:00', '11:30', '14:00', '16:00'],
    citasAsignadas: 8
  },
  {
    id_veterinario: 3,
    nombre: 'Solis',
    apellido: 'Vargas',
    especialidad: 'Cirugía veterinaria',
    telefono: '965432109',
    email: 'solis@vitalvet.com',
    estado: 'Activo',
    foto: '👨‍⚕️',
    horarios: ['08:30', '11:00', '13:30', '17:00'],
    citasAsignadas: 6
  }
]

// ─────────────────────────────
// SERVICIOS / PRECIOS
// ─────────────────────────────
export const TIPOS_ATENCION = [
  'Vacunación',
  'Esterilización',
  'Cirugía',
  'Baño y grooming',
  'Consulta médica general',
  'Control/Revisión',
  'Desparasitación'
]

export const PRECIOS = {
  'Vacunación': 80,
  'Esterilización': 180,
  'Cirugía': 300,
  'Baño y grooming': 70,
  'Consulta médica general': 50,
  'Control/Revisión': 45,
  'Desparasitación': 40
}

// ─────────────────────────────
// CITAS
// ─────────────────────────────
export const CITAS = [
  {
    id_cita: 1,
    id_cliente: 1,
    id_mascota: 1,
    id_veterinario: 1,
    fecha: '2026-05-05',
    hora: '09:00',
    tipo: 'Vacunación',
    estado: 'Confirmada',
    estado_pago: 'pagado',
    monto: 80
  },
  {
    id_cita: 2,
    id_cliente: 2,
    id_mascota: 2,
    id_veterinario: 2,
    fecha: '2026-05-05',
    hora: '10:30',
    tipo: 'Control/Revisión',
    estado: 'Pendiente',
    estado_pago: 'pendiente',
    monto: 45
  },
  {
    id_cita: 3,
    id_cliente: 3,
    id_mascota: 3,
    id_veterinario: 3,
    fecha: '2026-05-06',
    hora: '11:00',
    tipo: 'Cirugía',
    estado: 'Pendiente',
    estado_pago: 'pendiente',
    monto: 300
  },
  {
    id_cita: 4,
    id_cliente: 4,
    id_mascota: 4,
    id_veterinario: 1,
    fecha: '2026-05-07',
    hora: '15:00',
    tipo: 'Baño y grooming',
    estado: 'Confirmada',
    estado_pago: 'pagado',
    monto: 70
  }
]

// ─────────────────────────────
// HISTORIALES
// ─────────────────────────────
export const HISTORIALES = [
  {
    id_historial: 1,
    id_mascota: 1,
    id_cliente: 1,
    fecha: '2026-05-02 10:30',
    id_veterinario: 1,
    motivo: 'Control rutinario',
    diagnostico: 'Leve infección ocular.',
    tratamiento: 'Colirio antibiótico 2 veces al día por 7 días.',
    estado: 'Completada'
  },
  {
    id_historial: 2,
    id_mascota: 1,
    id_cliente: 1,
    fecha: '2026-03-15 09:00',
    id_veterinario: 2,
    motivo: 'Vacunación anual',
    diagnostico: 'Paciente sano, apto para vacunación.',
    tratamiento: 'Vacuna polivalente + antiparasitario.',
    estado: 'Completada'
  },
  {
    id_historial: 3,
    id_mascota: 2,
    id_cliente: 2,
    fecha: '2026-05-01 11:00',
    id_veterinario: 2,
    motivo: 'Revisión dermatológica',
    diagnostico: 'Dermatitis alérgica leve.',
    tratamiento: 'Antihistamínico oral 1 vez al día por 10 días.',
    estado: 'Completada'
  },
  {
    id_historial: 4,
    id_mascota: 3,
    id_cliente: 3,
    fecha: '2026-04-20 12:00',
    id_veterinario: 3,
    motivo: 'Evaluación prequirúrgica',
    diagnostico: 'Paciente apto para procedimiento.',
    tratamiento: 'Ayuno previo y control postoperatorio.',
    estado: 'Pendiente'
  }
]

// ─────────────────────────────
// PAGOS
// ─────────────────────────────
export const PAGOS = [
  {
    id_pago: 1,
    id_cita: 1,
    metodo: 'Yape',
    monto: 80,
    estado: 'pagado',
    fecha_pago: '2026-05-05 08:40',
    codigo_operacion: 'VV-100001'
  },
  {
    id_pago: 2,
    id_cita: 2,
    metodo: null,
    monto: 45,
    estado: 'pendiente',
    fecha_pago: null,
    codigo_operacion: null
  },
  {
    id_pago: 3,
    id_cita: 3,
    metodo: null,
    monto: 300,
    estado: 'pendiente',
    fecha_pago: null,
    codigo_operacion: null
  },
  {
    id_pago: 4,
    id_cita: 4,
    metodo: 'Plin',
    monto: 70,
    estado: 'pagado',
    fecha_pago: '2026-05-07 14:30',
    codigo_operacion: 'VV-100004'
  }
]

// ─────────────────────────────
// REPORTES
// ─────────────────────────────
export const REPORTES_MENSUALES = [
  { mes: 'Ene', atenciones: 28, ingresos: 1680, gastos: 520 },
  { mes: 'Feb', atenciones: 32, ingresos: 2140, gastos: 640 },
  { mes: 'Mar', atenciones: 41, ingresos: 3280, gastos: 820 },
  { mes: 'Abr', atenciones: 37, ingresos: 4820, gastos: 1250 },
  { mes: 'May', atenciones: 44, ingresos: 5160, gastos: 1380 },
  { mes: 'Jun', atenciones: 49, ingresos: 5920, gastos: 1470 }
]

export const SERVICIOS_TOP = [
  {
    label: 'Vacunación',
    cantidad: 24,
    pct: 65,
    color: 'var(--primary)'
  },
  {
    label: 'Consulta general',
    cantidad: 18,
    pct: 48,
    color: '#3B82F6'
  },
  {
    label: 'Desparasitación',
    cantidad: 11,
    pct: 30,
    color: '#F59E0B'
  },
  {
    label: 'Baño y grooming',
    cantidad: 9,
    pct: 24,
    color: '#10B981'
  },
  {
    label: 'Cirugía',
    cantidad: 4,
    pct: 12,
    color: '#8B5CF6'
  }
]

// ─────────────────────────────
// HELPERS
// ─────────────────────────────
export const getClienteById = (id) =>
  CLIENTES.find(c => c.id_cliente === Number(id))

export const getMascotaById = (id) =>
  MASCOTAS.find(m => m.id_mascota === Number(id))

export const getVeterinarioById = (id) =>
  VETERINARIOS.find(v => v.id_veterinario === Number(id))

export const getCitasByCliente = (id_cliente) =>
  CITAS.filter(c => c.id_cliente === Number(id_cliente))

export const getMascotasByCliente = (id_cliente) =>
  MASCOTAS.filter(m => m.id_cliente === Number(id_cliente))

export const getHistorialByMascota = (id_mascota) =>
  HISTORIALES.filter(h => h.id_mascota === Number(id_mascota))

export const getPagosPendientes = () =>
  PAGOS.filter(p => p.estado === 'pendiente')