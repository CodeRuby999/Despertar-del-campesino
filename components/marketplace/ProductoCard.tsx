'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Images } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { Producto } from '@/lib/types'
import { url } from 'inspector'

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
      className={`group bg-gradient-to-br from-black/60 via-black/80 to-green-500/10  rounded-2xl overflow-hidden shadow-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${onVerDetalle ? 'cursor-pointer' : ''}`}

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
          <span className="bg-yellow-600 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
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
        <p className="text-[15px] text-green-500/80 mb-0.5 truncate">{producto.fincaNombre}</p>
        <h3 className="font-thin text-lg text-white leading-snug line-clamp-2 mb-2">
          {producto.nombre}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-yellow-400 text-green-500 tracking-wider">
              ${producto.precio.toLocaleString('es-CO')}
            </span>
            <span className="text-white text-xs"> / {producto.unidad}</span>
          </div>
        <button
  onClick={handleAgregar}
  className={`
    w-8
    h-8
    rounded-xl
    flex
    items-center
    justify-center
    transition-all
    duration-300
    
    ${
      agregando
        ? `
          bg-primary
          text-primary-foreground
          scale-95
        `
        : `
          bg-gradient-to-r
          from-green-800/60
          via-yellow-600/70
          to-green-800/60

          bg-[length:200%_auto]

       

          text-white

          hover:scale-110
          shadow-lg
          shadow-green-700/30
        `
    }
  `}
  aria-label="Agregar al carrito"
>
  {agregando 
    ? <ShoppingCart className="w-3.5 h-3.5" /> 
    : <Plus className="w-3.5 h-3.5" />
  }
</button>
        </div>
      </div>
    </div>
  )
}
