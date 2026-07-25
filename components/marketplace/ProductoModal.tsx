'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Check, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'
import type { Producto } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface Props {
  producto: Producto
  onClose: () => void
}

type MensajeNegociacion = { rol: 'usuario' | 'sistema'; texto: string }

export function ProductoModal({ producto, onClose }: Props) {
  const { agregarAlCarrito, setCarritoAbierto } = useApp()
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const [mostrarNegociacion, setMostrarNegociacion] = useState(false)
  const [oferta, setOferta] = useState('')
  const [mensajes, setMensajes] = useState<MensajeNegociacion[]>([
    { rol: 'sistema', texto: `Hola! Puedes negociar el precio de "${producto.nombre}". El precio base es $${producto.precio.toLocaleString('es-CO')} por ${producto.unidad}.` },
  ])

  // Bloquear scroll al abrir
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleAgregar = () => {
    agregarAlCarrito({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      unidad: producto.unidad,
      imagenURL: producto.imagenURL,
    })
    setAgregado(true)
    setTimeout(() => {
      setCarritoAbierto(true)
      onClose()
    }, 800)
  }

  const handleNegociar = () => {
    const val = parseFloat(oferta)
    if (isNaN(val) || val <= 0) {
      toast.error('Ingresa una oferta válida')
      return
    }

    const porcentaje = val / producto.precio
    setMensajes(prev => [...prev, { rol: 'usuario', texto: `Mi oferta: $${val.toLocaleString('es-CO')} por ${producto.unidad}` }])
    setOferta('')

    let respuesta: string
    if (porcentaje >= 0.95) {
      respuesta = `¡Oferta aceptada! Te vendemos "${producto.nombre}" a $${val.toLocaleString('es-CO')} por ${producto.unidad}. Agrega el producto al carrito.`
    } else if (porcentaje >= 0.85) {
      const contraoferta = Math.round(producto.precio * 0.92)
      respuesta = `Gracias por tu propuesta. Como contraoferta te ofrecemos $${contraoferta.toLocaleString('es-CO')} por ${producto.unidad}. ¿Lo aceptas?`
    } else {
      respuesta = `Lo sentimos, no podemos bajar de $${Math.round(producto.precio * 0.88).toLocaleString('es-CO')} por ${producto.unidad} (88% del precio base). Ese es nuestro límite.`
    }

    setTimeout(() => {
      setMensajes(prev => [...prev, { rol: 'sistema', texto: respuesta }])
    }, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-5 py-4 z-10">
          <h2 className="font-display text-xl text-foreground">{producto.nombre}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Imagen */}
        <div className="relative h-56 overflow-hidden bg-muted">
          <img
            src={producto.imagenURL}
            alt={producto.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80'
            }}
          />
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full border border-border">
              {producto.categoria}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Precio y finca */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{producto.fincaNombre}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-2xl text-primary">
                  ${producto.precio.toLocaleString('es-CO')}
                </span>
                <span className="text-muted-foreground text-sm">/ {producto.unidad}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              producto.stock > 20 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
            }`}>
              {producto.stock > 20 ? `${producto.stock} disponibles` : `¡Solo ${producto.stock}!`}
            </span>
          </div>

          {/* Descripción */}
          <p className="text-muted-foreground text-sm leading-relaxed">{producto.descripcion}</p>

          {/* Beneficios */}
          {producto.beneficios.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Beneficios</h3>
              <div className="flex flex-wrap gap-1.5">
                {producto.beneficios.map(b => (
                  <span key={b} className="text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Cantidad:</span>
            <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
              <button
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                className="w-7 h-7 rounded-lg bg-card flex items-center justify-center text-foreground hover:bg-border transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-foreground">{cantidad}</span>
              <button
                onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))}
                className="w-7 h-7 rounded-lg bg-card flex items-center justify-center text-foreground hover:bg-border transition-colors"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground ml-auto">
              Total: <strong className="text-foreground">${(producto.precio * cantidad).toLocaleString('es-CO')}</strong>
            </span>
          </div>

          {/* Botón agregar */}
          <Button
            onClick={handleAgregar}
            disabled={agregado}
            className="w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200"
          >
            {agregado ? (
              <><Check className="w-4 h-4 mr-2" />¡Agregado al carrito!</>
            ) : (
              <><ShoppingCart className="w-4 h-4 mr-2" />Agregar al carrito — ${(producto.precio * cantidad).toLocaleString('es-CO')}</>
            )}
          </Button>

          {/* Negociación de precio */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setMostrarNegociacion(!mostrarNegociacion)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageCircle className="w-4 h-4 text-primary" />
                Negociar precio
              </div>
              {mostrarNegociacion ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {mostrarNegociacion && (
              <div className="px-4 pb-4">
                {/* Historial de mensajes */}
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto mb-3">
                  {mensajes.map((m, i) => (
                    <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        m.rol === 'usuario'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}>
                        {m.texto}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de oferta */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      placeholder={`Precio base: ${producto.precio.toLocaleString('es-CO')}`}
                      value={oferta}
                      onChange={e => setOferta(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleNegociar()
                      }}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    onClick={handleNegociar}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
