'use client'

import { useReducer, useEffect, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import { AppContext, type AppState, type AppContextType } from '@/lib/store'
import type { Usuario, Finca, Producto, Pedido, CartItem, Notificacion } from '@/lib/types'
import { SEED_FINCAS, SEED_PRODUCTOS } from '@/lib/seed-data'
import { isFirebaseConfigured } from '@/lib/firebase'

// ─── Estado inicial ────────────────────────────────────────────────

const INITIAL_STATE: AppState = {
  usuario: null,
  cargandoAuth: true,
  fincas: [],
  productos: [],
  pedidos: [],
  carrito: [],
  carritoAbierto: false,
  notificaciones: [],
  vista: 'inicio',
  fincaSeleccionadaId: null,
}

// ─── Reducer ──────────────────────────────────────────────────────

type Action =
  | { type: 'SET_USUARIO'; payload: Usuario | null }
  | { type: 'SET_CARGANDO_AUTH'; payload: boolean }
  | { type: 'SET_FINCAS'; payload: Finca[] }
  | { type: 'SET_PRODUCTOS'; payload: Producto[] }
  | { type: 'SET_PEDIDOS'; payload: Pedido[] }
  | { type: 'AGREGAR_CARRITO'; payload: CartItem }
  | { type: 'QUITAR_CARRITO'; payload: string }
  | { type: 'CAMBIAR_CANTIDAD'; payload: { productoId: string; delta: number } }
  | { type: 'VACIAR_CARRITO' }
  | { type: 'SET_CARRITO_ABIERTO'; payload: boolean }
  | { type: 'AGREGAR_NOTIFICACION'; payload: Notificacion }
  | { type: 'MARCAR_NOTIFICACIONES_LEIDAS' }
  | { type: 'SET_VISTA'; payload: { vista: AppState['vista']; fincaId?: string } }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USUARIO': return { ...state, usuario: action.payload }
    case 'SET_CARGANDO_AUTH': return { ...state, cargandoAuth: action.payload }
    case 'SET_FINCAS': return { ...state, fincas: action.payload }
    case 'SET_PRODUCTOS': return { ...state, productos: action.payload }
    case 'SET_PEDIDOS': return { ...state, pedidos: action.payload }
    case 'VACIAR_CARRITO': return { ...state, carrito: [] }
    case 'SET_CARRITO_ABIERTO': return { ...state, carritoAbierto: action.payload }
    case 'MARCAR_NOTIFICACIONES_LEIDAS':
      return { ...state, notificaciones: state.notificaciones.map(n => ({ ...n, leida: true })) }
    case 'SET_VISTA':
      return { ...state, vista: action.payload.vista, fincaSeleccionadaId: action.payload.fincaId ?? null }
    case 'AGREGAR_CARRITO': {
      const existe = state.carrito.find(i => i.productoId === action.payload.productoId)
      if (existe) {
        return {
          ...state,
          carrito: state.carrito.map(i =>
            i.productoId === action.payload.productoId
              ? { ...i, cantidad: i.cantidad + action.payload.cantidad }
              : i
          ),
        }
      }
      return { ...state, carrito: [...state.carrito, action.payload] }
    }
    case 'QUITAR_CARRITO':
      return { ...state, carrito: state.carrito.filter(i => i.productoId !== action.payload) }
    case 'CAMBIAR_CANTIDAD':
      return {
        ...state,
        carrito: state.carrito
          .map(i =>
            i.productoId === action.payload.productoId
              ? { ...i, cantidad: Math.max(1, i.cantidad + action.payload.delta) }
              : i
          )
          .filter(i => i.cantidad > 0),
      }
    case 'AGREGAR_NOTIFICACION':
      return {
        ...state,
        notificaciones: [action.payload, ...state.notificaciones].slice(0, 20),
      }
    default: return state
  }
}

// ─── Provider ─────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Cargar datos (Firebase o localStorage semilla)
  const cargarDatos = useCallback(async () => {
    const configured = isFirebaseConfigured()

    if (configured) {
      try {
        const { getFirebaseDb } = await import('@/lib/firebase')
        const { collection, getDocs } = await import('firebase/firestore')
        const db = getFirebaseDb()

        const [fincasSnap, productosSnap] = await Promise.all([
          getDocs(collection(db, 'fincas')),
          getDocs(collection(db, 'productos')),
        ])

        if (fincasSnap.empty) {
          // Sembrar datos iniciales
          const { doc, setDoc } = await import('firebase/firestore')
          const fincasConId: Finca[] = SEED_FINCAS.map((f, i) => ({ ...f, id: `finca-${i}` }))
          const productosConId: Producto[] = SEED_PRODUCTOS.map((p, i) => ({ ...p, id: `producto-${i}` }))

          await Promise.all([
            ...fincasConId.map(f => setDoc(doc(db, 'fincas', f.id), f)),
            ...productosConId.map(p => setDoc(doc(db, 'productos', p.id), p)),
          ])

          dispatch({ type: 'SET_FINCAS', payload: fincasConId })
          dispatch({ type: 'SET_PRODUCTOS', payload: productosConId })
        } else {
          dispatch({
            type: 'SET_FINCAS',
            payload: fincasSnap.docs.map(d => ({ id: d.id, ...d.data() } as Finca)),
          })
          dispatch({
            type: 'SET_PRODUCTOS',
            payload: productosSnap.docs.map(d => ({ id: d.id, ...d.data() } as Producto)),
          })
        }
        return
      } catch (err) {
        console.warn('[v0] Firebase error, usando localStorage:', err)
      }
    }

    // Fallback: localStorage
    const localFincas = localStorage.getItem('edc_fincas')
    const localProductos = localStorage.getItem('edc_productos')

    if (localFincas && localProductos) {
      dispatch({ type: 'SET_FINCAS', payload: JSON.parse(localFincas) })
      dispatch({ type: 'SET_PRODUCTOS', payload: JSON.parse(localProductos) })
    } else {
      const fincas: Finca[] = SEED_FINCAS.map((f, i) => ({ ...f, id: `finca-${i}` }))
      const productos: Producto[] = SEED_PRODUCTOS.map((p, i) => ({ ...p, id: `producto-${i}` }))
      localStorage.setItem('edc_fincas', JSON.stringify(fincas))
      localStorage.setItem('edc_productos', JSON.stringify(productos))
      dispatch({ type: 'SET_FINCAS', payload: fincas })
      dispatch({ type: 'SET_PRODUCTOS', payload: productos })
    }
  }, [])

  // Auth listener
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      dispatch({ type: 'SET_CARGANDO_AUTH', payload: false })
      cargarDatos()
      return
    }

    let unsubscribe = () => {}
    ;(async () => {
      const { getFirebaseAuth } = await import('@/lib/firebase')
      const { onAuthStateChanged } = await import('firebase/auth')
      const { doc, getDoc } = await import('firebase/firestore')
      const { getFirebaseDb } = await import('@/lib/firebase')

      const authInstance = getFirebaseAuth()
      unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
        if (firebaseUser) {
          const db = getFirebaseDb()
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
          const userData = userDoc.exists()
            ? (userDoc.data() as Usuario)
            : {
                uid: firebaseUser.uid,
                nombre: firebaseUser.displayName ?? 'Usuario',
                email: firebaseUser.email ?? '',
                rol: 'cliente' as const,
                photoURL: firebaseUser.photoURL ?? undefined,
                createdAt: new Date(),
              }
          dispatch({ type: 'SET_USUARIO', payload: userData })
        } else {
          dispatch({ type: 'SET_USUARIO', payload: null })
        }
        dispatch({ type: 'SET_CARGANDO_AUTH', payload: false })
      })
      await cargarDatos()
    })()

    return () => unsubscribe()
  }, [cargarDatos])

  const ctx: AppContextType = {
    ...state,
    setUsuario: (u) => dispatch({ type: 'SET_USUARIO', payload: u }),
    setCargandoAuth: (v) => dispatch({ type: 'SET_CARGANDO_AUTH', payload: v }),
    setFincas: (f) => dispatch({ type: 'SET_FINCAS', payload: f }),
    setProductos: (p) => dispatch({ type: 'SET_PRODUCTOS', payload: p }),
    setPedidos: (p) => dispatch({ type: 'SET_PEDIDOS', payload: p }),
    agregarAlCarrito: (item) => {
      dispatch({ type: 'AGREGAR_CARRITO', payload: item })
      toast.success(`${item.nombre} agregado al carrito`)
      dispatch({
        type: 'AGREGAR_NOTIFICACION',
        payload: {
          id: crypto.randomUUID(),
          titulo: 'Producto agregado',
          mensaje: `${item.nombre} está en tu carrito`,
          leida: false,
          fecha: new Date(),
          tipo: 'producto',
        },
      })
    },
    quitarDelCarrito: (id) => dispatch({ type: 'QUITAR_CARRITO', payload: id }),
    cambiarCantidad: (id, delta) => dispatch({ type: 'CAMBIAR_CANTIDAD', payload: { productoId: id, delta } }),
    vaciarCarrito: () => dispatch({ type: 'VACIAR_CARRITO' }),
    setCarritoAbierto: (v) => dispatch({ type: 'SET_CARRITO_ABIERTO', payload: v }),
    agregarNotificacion: (n) =>
      dispatch({
        type: 'AGREGAR_NOTIFICACION',
        payload: { ...n, id: crypto.randomUUID(), fecha: new Date(), leida: false },
      }),
    marcarNotificacionesLeidas: () => dispatch({ type: 'MARCAR_NOTIFICACIONES_LEIDAS' }),
    setVista: (vista, fincaId) => dispatch({ type: 'SET_VISTA', payload: { vista, fincaId } }),
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>
}
