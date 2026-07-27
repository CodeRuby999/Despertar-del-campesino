'use client'

import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import { useApp } from '@/lib/store'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { Pedido, EstadoPedido } from '@/lib/types'
import { RastreoProgreso } from '@/components/marketplace/RastreoProgreso'

const ESTADO_INFO: Record<EstadoPedido, { label: string; icon: React.ElementType; color: string }> = {
  pendiente: { label: 'Pendiente', icon: Clock, color: 'text-harvest-foreground bg-harvest/30' },
  confirmado: { label: 'Confirmado', icon: CheckCircle, color: 'text-primary bg-primary/10' },
  en_camino: { label: 'En camino', icon: Truck, color: 'text-primary bg-primary/10' },
  entregado: { label: 'Entregado', icon: CheckCircle, color: 'text-primary bg-primary/10' },
  cancelado: { label: 'Cancelado', icon: XCircle, color: 'text-destructive bg-destructive/10' },
}

export function PedidosView() {
  const { usuario, pedidos, setPedidos } = useApp()
  const [pedidoRastreado, setPedidoRastreado] = useState<Pedido | null>(null)

  useEffect(() => {
    if (!usuario || !isFirebaseConfigured()) return

    ;(async () => {
      try {
        const { getFirebaseDb } = await import('@/lib/firebase')
        const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
        const db = getFirebaseDb()
        const q = query(
          collection(db, 'pedidos'),
          where('usuarioUid', '==', usuario.uid),
          orderBy('fecha', 'desc')
        )
        const snap = await getDocs(q)
        const result = snap.docs.map(d => ({ ...d.data(), id: d.id } as Pedido))
        setPedidos(result)
      } catch { /* usa los pedidos locales */ }
    })()
  }, [usuario, setPedidos])

  const misPedidos = pedidos.filter(p => p.usuarioUid === usuario?.uid)

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-8">
      <h1 className="font-display text-3xl text-foreground mb-1">Mis pedidos</h1>
      <p className="text-muted-foreground text-sm mb-6">Historial completo de tus compras</p>

      {misPedidos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground opacity-40" />
          </div>
          <h3 className="font-display text-xl text-foreground mb-1">Sin pedidos aún</h3>
          <p className="text-muted-foreground text-sm">Cuando realices una compra aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {misPedidos.map(pedido => {
            const estadoInfo = ESTADO_INFO[pedido.estado]
            const EstadoIcon = estadoInfo.icon
            return (
              <div key={pedido.id} className="bg-card rounded-2xl border border-border p-5 space-y-4">
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido #{pedido.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pedido.fecha).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${estadoInfo.color}`}>
                    <EstadoIcon className="w-3 h-3" />
                    {estadoInfo.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {pedido.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.imagenURL}
                        alt={item.nombre}
                        className="w-10 h-10 rounded-xl object-cover bg-muted"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=100&q=80' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">x{item.cantidad} {item.unidad}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="pt-3 border-t border-border text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${pedido.subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Domicilio</span>
                    <span>${pedido.domicilio.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>${pedido.total.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                {/* Rastreo */}
                {(pedido.estado === 'confirmado' || pedido.estado === 'en_camino') && (
                  <button
                    onClick={() => setPedidoRastreado(pedidoRastreado?.id === pedido.id ? null : pedido)}
                    className="w-full text-center text-sm text-primary font-medium hover:underline"
                  >
                    {pedidoRastreado?.id === pedido.id ? 'Ocultar rastreo' : 'Ver rastreo del pedido'}
                  </button>
                )}
                {pedidoRastreado?.id === pedido.id && <RastreoProgreso pedido={pedido} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
