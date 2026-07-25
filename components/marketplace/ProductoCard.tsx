'use client'

import { useState } from 'react'
import { ShoppingCart, Plus } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { Producto } from '@/lib/types'

interface Props {
  producto: Producto
  onVerDetalle?: () => void
}

export function ProductoCard({ producto, onVerDetalle }: Props) {
  const { agregarAlCarrito, setCarritoAbierto } = useApp()
  const [agregando, setAgregando] = useState(false)

  const handleAgregar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAgregando(true)
    agregarAlCarrito({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      unidad: producto.unidad,
      imagenURL: producto.imagenURL,
    })
    setTimeout(() => {
      setAgregando(false)
      setCarritoAbierto(true)
    }, 600)
  }

  return (
    <div
      onClick={onVerDetalle}
      className={`group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${onVerDetalle ? 'cursor-pointer' : ''}`}
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={producto.imagenURL}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const t = e.currentTarget
            t.src = `https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80`
          }}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full border border-border">
            {producto.categoria}
          </span>
        </div>
        {producto.stock < 10 && (
          <div className="absolute top-2 right-2">
            <span className="bg-destructive text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Últimas unidades
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3">
        <p className="text-[10px] text-muted-foreground mb-0.5 truncate">{producto.fincaNombre}</p>
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 mb-2">
          {producto.nombre}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-base text-primary">
              ${producto.precio.toLocaleString('es-CO')}
            </span>
            <span className="text-muted-foreground text-xs"> / {producto.unidad}</span>
          </div>
          <button
            onClick={handleAgregar}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
              agregando
                ? 'bg-primary text-primary-foreground scale-95'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
            }`}
            aria-label="Agregar al carrito"
          >
            {agregando ? <ShoppingCart className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
