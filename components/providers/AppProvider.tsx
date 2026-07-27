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
    case 'SET_USUARIO':         return { ...state, usuario: action.payload }
    case 'SET_CARGANDO_AUTH':   return { ...state, cargandoAuth: action.payload }
    case 'SET_FINCAS':          return { ...state, fincas: action.payload }
    case 'SET_PRODUCTOS':       return { ...state, productos: action.payload }
    case 'SET_PEDIDOS':         return { ...state, pedidos: action.payload }
    case 'VACIAR_CARRITO':      return { ...state, carrito: [] }
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

// ─── Helpers de Firebase ───────────────────────────────────────────

/**
 * Lee las colecciones `fincas` y `productos` de Firestore.
 * Enriquece cada producto con `fincaNombre` desde la finca correspondiente.
 * Retorna los datos tipados, o `null` si ambas colecciones están vacías.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function obtenerDatosFirebase(db: any): Promise<{ fincas: Finca[]; productos: Producto[] } | null> {
  const { collection, getDocs } = await import('firebase/firestore')

  const [fincasSnap, productosSnap] = await Promise.all([
    getDocs(collection(db, 'fincas')),
    getDocs(collection(db, 'productos')),
  ])

  if (fincasSnap.empty && productosSnap.empty) return null

  const fincas: Finca[] = fincasSnap.docs.map(d => ({ id: d.id, ...d.data() } as Finca))

  // Mapa id → nombre para enriquecer productos con fincaNombre real
  const mapaFincaNombres = new Map<string, string>(fincas.map(f => [f.id, f.nombre]))

  const productos: Producto[] = productosSnap.docs.map(d => {
    const data = d.data() as Omit<Producto, 'id'>
    return {
      id: d.id,
      ...data,
      // Asegurar fincaNombre desde Firestore, con fallback al valor guardado
      fincaNombre: mapaFincaNombres.get(data.fincaId) ?? data.fincaNombre ?? '',
    } as Producto
  })

  console.info(
    `[AppProvider] Datos cargados desde Firestore: ${fincas.length} fincas, ${productos.length} productos.`
  )

  return { fincas, productos }
}

/**
 * Crea el seed inicial en Firestore usando `addDoc()` para obtener
 * IDs automáticos. Garantiza relaciones correctas finca → producto.
 *
 * Flujo:
 * 1. Crea cada finca y captura el ID generado por Firestore.
 * 2. Construye un mapa { 'finca-0' → '<firestoreId>' }.
 * 3. Crea cada producto reemplazando el fincaId temporal por el real.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function crearDatosInicialesFirebase(db: any): Promise<{ fincas: Finca[]; productos: Producto[] }> {
  const { collection, addDoc } = await import('firebase/firestore')

  // ── 1. Crear fincas y registrar IDs reales ──────────────────────
  const fincasCreadas: Finca[] = []
  const mapaFincaIds = new Map<string, string>() // clave temporal → ID real Firestore

  for (let i = 0; i < SEED_FINCAS.length; i++) {
    try {
      const ref = await addDoc(collection(db, 'fincas'), SEED_FINCAS[i])
      fincasCreadas.push({ id: ref.id, ...SEED_FINCAS[i] })
      mapaFincaIds.set(`finca-${i}`, ref.id)
    } catch (error) {
      console.error(`[AppProvider] Error creando finca-${i} en Firestore:`, error)
    }
  }

  // ── 2. Crear productos con el fincaId real y fincaNombre correcto ─
  const productosCreados: Producto[] = []

  for (let i = 0; i < SEED_PRODUCTOS.length; i++) {
    const semilla = SEED_PRODUCTOS[i]
    // Resolver clave temporal ('finca-1') al ID real generado por Firestore
    const fincaIdReal = mapaFincaIds.get(semilla.fincaId) ?? semilla.fincaId
    // Usar el nombre real de la finca creada (no el hardcodeado del seed)
    const fincaReal   = fincasCreadas.find(f => f.id === fincaIdReal)
    const fincaNombre = fincaReal?.nombre ?? semilla.fincaNombre ?? ''

    const productoParaFirestore: Omit<Producto, 'id'> = {
      ...semilla,
      fincaId: fincaIdReal,
      fincaNombre,
    }

    try {
      const ref = await addDoc(collection(db, 'productos'), productoParaFirestore)
      productosCreados.push({ id: ref.id, ...productoParaFirestore })
    } catch (error) {
      console.error(`[AppProvider] Error creando producto-${i} en Firestore:`, error)
    }
  }

  console.info(
    `[AppProvider] Seed inicial creado: ${fincasCreadas.length} fincas, ${productosCreados.length} productos.`
  )
  return { fincas: fincasCreadas, productos: productosCreados }
}

// ─── Helpers de localStorage ───────────────────────────────────────

/**
 * Persiste fincas y productos en localStorage como capa de fallback.
 */
function guardarEnLocalStorage(fincas: Finca[], productos: Producto[]): void {
  try {
    localStorage.setItem('edc_fincas', JSON.stringify(fincas))
    localStorage.setItem('edc_productos', JSON.stringify(productos))
  } catch (error) {
    console.error('[AppProvider] Error guardando datos en localStorage:', error)
  }
}

/**
 * Carga datos desde localStorage. Si no existen, genera desde seed-data
 * y los persiste para las siguientes cargas.
 */
function cargarDesdeLocalStorage(): { fincas: Finca[]; productos: Producto[] } {
  const localFincas   = localStorage.getItem('edc_fincas')
  const localProductos = localStorage.getItem('edc_productos')

  if (localFincas && localProductos) {
    return {
      fincas:    JSON.parse(localFincas)   as Finca[],
      productos: JSON.parse(localProductos) as Producto[],
    }
  }

  // Última opción: generar desde seed-data con IDs locales
  const fincas: Finca[]     = SEED_FINCAS.map((f, i) => ({ ...f, id: `finca-${i}` }))
  const productos: Producto[] = SEED_PRODUCTOS.map((p, i) => ({ ...p, id: `producto-${i}` }))
  guardarEnLocalStorage(fincas, productos)
  return { fincas, productos }
}

// ─── Provider ─────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  /**
   * Carga de datos con prioridad:
   *   1. Firebase Firestore  (fuente principal)
   *   2. localStorage        (fallback ante error de Firestore)
   *   3. seed-data           (inicialización si localStorage vacío)
   */
  const cargarDatos = useCallback(async () => {
    // ── Sin Firebase: ir directo al fallback local ──────────────────
    if (!isFirebaseConfigured()) {
      const { fincas, productos } = cargarDesdeLocalStorage()
      dispatch({ type: 'SET_FINCAS', payload: fincas })
      dispatch({ type: 'SET_PRODUCTOS', payload: productos })
      return
    }

    // ── Firebase configurado ────────────────────────────────────────
    try {
      const { getFirebaseDb } = await import('@/lib/firebase')
      const db = getFirebaseDb()

      let datos = await obtenerDatosFirebase(db)

      if (!datos) {
        // Firestore vacío → ejecutar seed con IDs automáticos
        console.info('[AppProvider] Firestore vacío. Creando datos iniciales...')
        datos = await crearDatosInicialesFirebase(db)
        guardarEnLocalStorage(datos.fincas, datos.productos)
        console.info(
          `[AppProvider] Seed completado: ${datos.fincas.length} fincas, ${datos.productos.length} productos.`
        )
      }

      dispatch({ type: 'SET_FINCAS', payload: datos.fincas })
      dispatch({ type: 'SET_PRODUCTOS', payload: datos.productos })
    } catch (error) {
      console.error('[AppProvider] Error cargando datos desde Firebase. Usando localStorage como respaldo:', error)
      const { fincas, productos } = cargarDesdeLocalStorage()
      dispatch({ type: 'SET_FINCAS', payload: fincas })
      dispatch({ type: 'SET_PRODUCTOS', payload: productos })
    }
  }, [])

  // ── Auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      dispatch({ type: 'SET_CARGANDO_AUTH', payload: false })
      cargarDatos()
      return
    }

    let unsubscribe = () => {}
    ;(async () => {
      try {
        const { getFirebaseAuth, getFirebaseDb } = await import('@/lib/firebase')
        const { onAuthStateChanged } = await import('firebase/auth')
        const { doc, getDoc } = await import('firebase/firestore')

        const authInstance = getFirebaseAuth()
        const db = getFirebaseDb()

        unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
              const userData: Usuario = userDoc.exists()
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
          } catch (error) {
            console.error('[AppProvider] Error obteniendo datos de usuario desde Firestore:', error)
            dispatch({ type: 'SET_USUARIO', payload: null })
          } finally {
            dispatch({ type: 'SET_CARGANDO_AUTH', payload: false })
          }
        })

        await cargarDatos()
      } catch (error) {
        console.error('[AppProvider] Error iniciando el listener de autenticación:', error)
        dispatch({ type: 'SET_CARGANDO_AUTH', payload: false })
        cargarDatos()
      }
    })()

    return () => unsubscribe()
  }, [cargarDatos])

  // ── Contexto ───────────────────────────────────────────────────────
  const ctx: AppContextType = {
    ...state,
    setUsuario:       (u) => dispatch({ type: 'SET_USUARIO', payload: u }),
    setCargandoAuth:  (v) => dispatch({ type: 'SET_CARGANDO_AUTH', payload: v }),
    setFincas:        (f) => dispatch({ type: 'SET_FINCAS', payload: f }),
    setProductos:     (p) => dispatch({ type: 'SET_PRODUCTOS', payload: p }),
    setPedidos:       (p) => dispatch({ type: 'SET_PEDIDOS', payload: p }),
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
    quitarDelCarrito:           (id)        => dispatch({ type: 'QUITAR_CARRITO', payload: id }),
    cambiarCantidad:            (id, delta) => dispatch({ type: 'CAMBIAR_CANTIDAD', payload: { productoId: id, delta } }),
    vaciarCarrito:              ()          => dispatch({ type: 'VACIAR_CARRITO' }),
    setCarritoAbierto:          (v)         => dispatch({ type: 'SET_CARRITO_ABIERTO', payload: v }),
    agregarNotificacion: (n) =>
      dispatch({
        type: 'AGREGAR_NOTIFICACION',
        payload: { ...n, id: crypto.randomUUID(), fecha: new Date(), leida: false },
      }),
    marcarNotificacionesLeidas: () => dispatch({ type: 'MARCAR_NOTIFICACIONES_LEIDAS' }),
    setVista: (vista, fincaId)    => dispatch({ type: 'SET_VISTA', payload: { vista, fincaId } }),
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>
}
