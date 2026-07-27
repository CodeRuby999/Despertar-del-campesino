'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Tractor, Package, ShoppingBag, Users,
  TrendingUp, DollarSign, Edit, Trash2, Plus, CheckCircle, Truck, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import type { EstadoPedido } from '@/lib/types'
import { isFirebaseConfigured } from '@/lib/firebase'

type SeccionAdmin = 'dashboard' | 'fincas' | 'productos' | 'pedidos' | 'usuarios'

export function AdminView() {
  const {
    fincas, productos, pedidos, setFincas, setProductos, setPedidos,
  } = useApp()

  const [seccion, setSeccion] = useState<SeccionAdmin>('dashboard')

  const totalIngresos = pedidos.reduce((s, p) => s + p.total, 0)
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length

  const secciones: { id: SeccionAdmin; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fincas', label: 'Fincas', icon: Tractor },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
  ]

  const handleCambiarEstadoPedido = async (pedidoId: string, estado: EstadoPedido) => {
    const actualizados = pedidos.map(p => p.id === pedidoId ? { ...p, estado } : p)
    setPedidos(actualizados)

    if (isFirebaseConfigured()) {
      try {
        const { getFirebaseDb } = await import('@/lib/firebase')
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(getFirebaseDb(), 'pedidos', pedidoId), { estado })
      } catch { /* silencioso */ }
    }
    toast.success('Estado del pedido actualizado')
  }

  const handleEliminarFinca = async (id: string) => {
    setFincas(fincas.filter(f => f.id !== id))
    if (isFirebaseConfigured()) {
      try {
        const { getFirebaseDb } = await import('@/lib/firebase')
        const { doc, deleteDoc } = await import('firebase/firestore')
        await deleteDoc(doc(getFirebaseDb(), 'fincas', id))
      } catch { /* silencioso */ }
    }
    toast.success('Finca eliminada')
  }

  const handleEliminarProducto = async (id: string) => {
    setProductos(productos.filter(p => p.id !== id))
    if (isFirebaseConfigured()) {
      try {
        const { getFirebaseDb } = await import('@/lib/firebase')
        const { doc, deleteDoc } = await import('firebase/firestore')
        await deleteDoc(doc(getFirebaseDb(), 'productos', id))
      } catch { /* silencioso */ }
    }
    toast.success('Producto eliminado')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-6">
      <div className="mb-5">
        <h1 className="font-display text-3xl text-foreground">Panel de Administrador</h1>
        <p className="text-muted-foreground text-sm">Gestión completa de la plataforma</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="md:w-52 shrink-0">
          <div className="bg-card rounded-2xl border border-border p-2 flex flex-row md:flex-col gap-1 overflow-x-auto">
            {secciones.map(s => (
              <button
                key={s.id}
                onClick={() => setSeccion(s.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                  seccion === s.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Dashboard */}
          {seccion === 'dashboard' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: TrendingUp, label: 'Ingresos totales', valor: `$${totalIngresos.toLocaleString('es-CO')}`, color: 'text-primary bg-primary/10' },
                  { icon: ShoppingBag, label: 'Pedidos totales', valor: pedidos.length, color: 'text-earth bg-earth/10' },
                  { icon: Users, label: 'Fincas activas', valor: fincas.length, color: 'text-primary bg-primary/10' },
                  { icon: DollarSign, label: 'Pendientes', valor: pedidosPendientes, color: 'text-harvest-foreground bg-harvest/30' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card rounded-2xl border border-border p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="font-display text-2xl text-foreground">{stat.valor}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Pedidos recientes */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <h2 className="font-display text-xl text-foreground mb-4">Pedidos recientes</h2>
                {pedidos.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Sin pedidos aún</p>
                ) : (
                  <div className="space-y-2">
                    {pedidos.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.usuarioNombre}</p>
                          <p className="text-xs text-muted-foreground">{p.items.length} item(s)</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">${p.total.toLocaleString('es-CO')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.estado === 'entregado' ? 'bg-primary/10 text-primary' :
                          p.estado === 'cancelado' ? 'bg-destructive/10 text-destructive' :
                          'bg-harvest/30 text-harvest-foreground'
                        }`}>
                          {p.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fincas */}
          {seccion === 'fincas' && (
            <div className="bg-card rounded-2xl border border-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-display text-xl text-foreground">Gestión de fincas</h2>
                <button
                  onClick={() => toast.info('Formulario de nueva finca — próximamente')}
                  className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva finca
                </button>
              </div>
              <div className="divide-y divide-border">
                {fincas.map(f => (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3.5">
                    <img
                      src={f.imagenURL}
                      alt={f.nombre}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-muted"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=80' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{f.nombre}</p>
                      <p className="text-xs text-muted-foreground">{f.ubicacion} · {f.tipoCultivo}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toast.info('Editar finca — próximamente')}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminarFinca(f.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productos */}
          {seccion === 'productos' && (
            <div className="bg-card rounded-2xl border border-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-display text-xl text-foreground">Gestión de productos</h2>
                <button
                  onClick={() => toast.info('Formulario de nuevo producto — próximamente')}
                  className="flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo producto
                </button>
              </div>
              <div className="divide-y divide-border">
                {productos.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                    <img
                      src={p.imagenURL}
                      alt={p.nombre}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-muted"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=100&q=80' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground">{p.categoria} · ${p.precio.toLocaleString('es-CO')} / {p.unidad}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 20 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {p.stock} uds
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toast.info('Editar producto — próximamente')}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminarProducto(p.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pedidos */}
          {seccion === 'pedidos' && (
            <div className="bg-card rounded-2xl border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-display text-xl text-foreground">Gestión de pedidos</h2>
              </div>
              {pedidos.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Sin pedidos</div>
              ) : (
                <div className="divide-y divide-border">
                  {pedidos.map(p => (
                    <div key={p.id} className="px-5 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.usuarioNombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.fecha).toLocaleDateString('es-CO')} · {p.items.length} item(s) · <strong>${p.total.toLocaleString('es-CO')}</strong>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {([
                            { estado: 'pendiente', label: 'Pendiente', icon: Clock },
                            { estado: 'confirmado', label: 'Confirmar', icon: CheckCircle },
                            { estado: 'en_camino', label: 'En camino', icon: Truck },
                            { estado: 'entregado', label: 'Entregado', icon: CheckCircle },
                          ] as { estado: EstadoPedido; label: string; icon: React.ElementType }[]).map(btn => (
                            <button
                              key={btn.estado}
                              onClick={() => handleCambiarEstadoPedido(p.id, btn.estado)}
                              className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors border ${
                                p.estado === btn.estado
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                              }`}
                            >
                              <btn.icon className="w-3 h-3" />
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usuarios */}
          {seccion === 'usuarios' && (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-display text-xl text-foreground mb-1">Gestión de usuarios</h3>
              <p className="text-muted-foreground text-sm">
                Esta sección está disponible cuando se conecta Firebase Authentication. <br />
                Configura las variables de entorno para habilitar la gestión de usuarios en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
