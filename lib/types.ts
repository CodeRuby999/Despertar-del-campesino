// ─── Modelos de datos ──────────────────────────────────────────────

export type UserRole = 'cliente' | 'campesino' | 'admin'

export interface Usuario {
  uid: string
  nombre: string
  email: string
  rol: UserRole
  photoURL?: string
  createdAt: Date
}

export interface Finca {
  id: string
  nombre: string
  propietario: string
  propietarioUid: string
  año: number
  ubicacion: string
  tipoCultivo: string
  telefono: string
  rating: number
  descripcion: string
  imagenURL: string
  videoURL?: string
}

export interface Producto {
  id: string
  fincaId: string
  fincaNombre?: string
  nombre: string
  categoria: string
  precio: number
  unidad: string
  stock: number
  descripcion: string
  beneficios: string[]
  imagenURL: string
}

export type EstadoPedido = 'pendiente' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado'

export interface ItemPedido {
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  unidad: string
  imagenURL: string
}

export interface Pedido {
  id: string
  usuarioUid: string
  usuarioNombre: string
  items: ItemPedido[]
  subtotal: number
  domicilio: number
  total: number
  estado: EstadoPedido
  fecha: Date
  direccion?: string
}

// ─── Carrito ──────────────────────────────────────────────────────

export interface CartItem extends ItemPedido {
  productoId: string
}

// ─── Notificaciones ───────────────────────────────────────────────

export interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha: Date
  tipo: 'pedido' | 'producto' | 'sesion' | 'general'
}
