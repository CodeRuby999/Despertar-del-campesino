'use client'

import { useRef, useEffect } from 'react'
import { X, Minus, Plus, Trash2, ShoppingCart, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { Pedido, ItemPedido } from '@/lib/types'

const COSTO_DOMICILIO = 5000

export function CarritoLateral() {
  const {
    carrito, carritoAbierto, setCarritoAbierto,
    quitarDelCarrito, cambiarCantidad, vaciarCarrito,
    usuario, agregarNotificacion, setPedidos, pedidos,
  } = useApp()

  const panelRef = useRef<HTMLDivElement>(null)

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const total = subtotal + (carrito.length > 0 ? COSTO_DOMICILIO : 0)

  // Cerrar con clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setCarritoAbierto(false)
      }
    }
    if (carritoAbierto) {
      document.addEventListener('mousedown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('mousedown', handler)
      document.body.style.overflow = ''
    }
  }, [carritoAbierto, setCarritoAbierto])

  const handleCheckout = async () => {
    if (!usuario) {
      toast.error('Debes iniciar sesión para realizar un pedido')
      return
    }
    if (carrito.length === 0) return

    // Guardar pedido
    const nuevoPedido: Pedido = {
      id: `pedido-${Date.now()}`,
      usuarioUid: usuario.uid,
      usuarioNombre: usuario.nombre,
      items: carrito as ItemPedido[],
      subtotal,
      domicilio: COSTO_DOMICILIO,
      total,
      estado: 'pendiente',
      fecha: new Date(),
    }

    // Intentar guardar en Firestore
    if (isFirebaseConfigured()) {
      try {
        const { getFirebaseDb } = await import('@/lib/firebase')
        const { doc, setDoc } = await import('firebase/firestore')
        await setDoc(doc(getFirebaseDb(), 'pedidos', nuevoPedido.id), nuevoPedido)
      } catch { /* fallback silencioso */ }
    }

    // Guardar localmente
    setPedidos([nuevoPedido, ...pedidos])

    // Mensaje WhatsApp
    const resumen = carrito.map(i => `• ${i.nombre} x${i.cantidad} (${i.unidad}) — $${(i.precio * i.cantidad).toLocaleString('es-CO')}`).join('\n')
    const mensaje = encodeURIComponent(
      `¡Hola! Quiero realizar este pedido desde El Despertar del Campesino:\n\n${resumen}\n\n` +
      `Subtotal: $${subtotal.toLocaleString('es-CO')}\n` +
      `Domicilio: $${COSTO_DOMICILIO.toLocaleString('es-CO')}\n` +
      `*TOTAL: $${total.toLocaleString('es-CO')}*\n\n` +
      `Nombre: ${usuario.nombre}`
    )
    const whatsappURL = `https://wa.me/573001234567?text=${mensaje}`

    agregarNotificacion({
      titulo: 'Pedido enviado',
      mensaje: `Tu pedido por $${total.toLocaleString('es-CO')} fue enviado por WhatsApp`,
      tipo: 'pedido',
    })

    vaciarCarrito()
    setCarritoAbierto(false)
    toast.success('¡Pedido confirmado! Serás redirigido a WhatsApp.')

    setTimeout(() => window.open(whatsappURL, '_blank'), 800)
  }

  if (!carritoAbierto) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      {/* Panel lateral */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-card shadow-2xl z-50 flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl text-foreground">Mi carrito</h2>
            {carrito.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {carrito.reduce((s, i) => s + i.cantidad, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setCarritoAbierto(false)}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground opacity-40" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Tu carrito está vacío</p>
                <p className="text-muted-foreground text-sm mt-1">Agrega productos frescos del campo</p>
              </div>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item.productoId} className="flex gap-3 bg-muted rounded-2xl p-3">
                <img
                  src={item.imagenURL}
                  alt={item.nombre}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-border"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=200&q=80' }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-snug truncate">{item.nombre}</h3>
                  <p className="text-xs text-muted-foreground">{item.unidad}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 bg-card rounded-lg p-0.5">
                      <button
                        onClick={() => cambiarCantidad(item.productoId, -1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <span className="text-xs font-bold text-foreground w-4 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => cambiarCantidad(item.productoId, 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => quitarDelCarrito(item.productoId)}
                  className="self-start w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resumen y checkout */}
        {carrito.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Domicilio</span>
                <span>${COSTO_DOMICILIO.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground text-base pt-1 border-t border-border">
                <span>Total</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3.5 rounded-xl hover:bg-[#20b858] transition-all duration-200 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Pedir por WhatsApp
            </button>

            <button
              onClick={vaciarCarrito}
              className="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
