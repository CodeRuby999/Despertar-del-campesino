'use client'

/**
 * Store global del lado cliente usando Context API + localStorage como fallback.
 * Cuando Firebase está disponible los datos vienen de Firestore; si no, se usan los seeds en localStorage.
 */

import { createContext, useContext } from 'react'
import type { Usuario, Finca, Producto, Pedido, CartItem, Notificacion } from './types'

export interface AppState {
  // Auth
  usuario: Usuario | null
  cargandoAuth: boolean

  // Datos
  fincas: Finca[]
  productos: Producto[]
  pedidos: Pedido[]

  // Carrito
  carrito: CartItem[]
  carritoAbierto: boolean

  // Notificaciones
  notificaciones: Notificacion[]

  // Vista activa
  vista: 'inicio' | 'fincas' | 'pedidos' | 'admin' | 'detalle-finca' | 'perfil'
  fincaSeleccionadaId: string | null
}

export interface AppActions {
  setUsuario: (u: Usuario | null) => void
  setCargandoAuth: (v: boolean) => void
  setFincas: (f: Finca[]) => void
  setProductos: (p: Producto[]) => void
  setPedidos: (p: Pedido[]) => void
  agregarAlCarrito: (item: CartItem) => void
  quitarDelCarrito: (productoId: string) => void
  cambiarCantidad: (productoId: string, delta: number) => void
  vaciarCarrito: () => void
  setCarritoAbierto: (v: boolean) => void
  agregarNotificacion: (n: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void
  marcarNotificacionesLeidas: () => void
  setVista: (v: AppState['vista'], fincaId?: string) => void
  // CRUD Fincas
  crearFinca: (data: Omit<Finca, 'id'>) => Promise<Finca>
  actualizarFinca: (id: string, cambios: Partial<Omit<Finca, 'id'>>) => Promise<void>
  eliminarFinca: (id: string) => Promise<void>
  // CRUD Productos
  crearProducto: (data: Omit<Producto, 'id'>) => Promise<Producto>
  actualizarProducto: (id: string, cambios: Partial<Omit<Producto, 'id'>>) => Promise<void>
  eliminarProducto: (id: string) => Promise<void>
}

export type AppContextType = AppState & AppActions

export const AppContext = createContext<AppContextType | null>(null)

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
