/**
 * Capa de servicios para operaciones CRUD con Firebase Firestore.
 * Todos los componentes deben usar estas funciones en lugar de llamar
 * directamente a Firestore para mantener la lógica centralizada.
 */

import type { Finca, Producto } from '@/lib/types'
import { isFirebaseConfigured, getFirebaseDb } from '@/lib/firebase'

// ─── Helpers internos ─────────────────────────────────────────────

async function importFirestore() {
  const fs = await import('firebase/firestore')
  return fs
}

function requireDb() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado. Revisa las variables de entorno.')
  }
  return getFirebaseDb()
}

// ─── Fincas ───────────────────────────────────────────────────────

/**
 * Crea una nueva finca en Firestore y retorna el objeto con el ID generado.
 */
export async function crearFinca(data: Omit<Finca, 'id'>): Promise<Finca> {
  const db = requireDb()
  const { collection, addDoc } = await importFirestore()

  const ref = await addDoc(collection(db, 'fincas'), data)
  return { id: ref.id, ...data }
}

/**
 * Actualiza una finca existente en Firestore.
 * Solo persiste los campos que se pasan (sin sobreescribir campos omitidos).
 */
export async function actualizarFinca(
  id: string,
  cambios: Partial<Omit<Finca, 'id'>>
): Promise<void> {
  const db = requireDb()
  const { doc, updateDoc } = await importFirestore()

  await updateDoc(doc(db, 'fincas', id), cambios as Record<string, unknown>)
}

/**
 * Elimina una finca y todos sus productos asociados (eliminación en cascada).
 * Primero elimina los productos con fincaId === id, luego la finca.
 */
export async function eliminarFinca(id: string): Promise<{ productosEliminados: number }> {
  const db = requireDb()
  const { collection, query, where, getDocs, doc, deleteDoc, writeBatch } = await importFirestore()

  // Buscar productos asociados a esta finca
  const productosSnap = await getDocs(
    query(collection(db, 'productos'), where('fincaId', '==', id))
  )

  // Usar batch para eliminar todos en una sola operación atómica
  const batch = writeBatch(db)
  productosSnap.docs.forEach(d => batch.delete(d.ref))
  batch.delete(doc(db, 'fincas', id))

  await batch.commit()
  return { productosEliminados: productosSnap.size }
}

// ─── Productos ────────────────────────────────────────────────────

/**
 * Crea un nuevo producto en Firestore y retorna el objeto con el ID generado.
 */
export async function crearProducto(data: Omit<Producto, 'id'>): Promise<Producto> {
  const db = requireDb()
  const { collection, addDoc } = await importFirestore()

  const ref = await addDoc(collection(db, 'productos'), data)
  return { id: ref.id, ...data }
}

/**
 * Actualiza un producto existente en Firestore.
 */
export async function actualizarProducto(
  id: string,
  cambios: Partial<Omit<Producto, 'id'>>
): Promise<void> {
  const db = requireDb()
  const { doc, updateDoc } = await importFirestore()

  await updateDoc(doc(db, 'productos', id), cambios as Record<string, unknown>)
}

/**
 * Elimina un producto de Firestore.
 */
export async function eliminarProducto(id: string): Promise<void> {
  const db = requireDb()
  const { doc, deleteDoc } = await importFirestore()

  await deleteDoc(doc(db, 'productos', id))
}
