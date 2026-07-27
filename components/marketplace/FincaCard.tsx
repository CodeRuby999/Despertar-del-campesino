'use client'

import { Star, MapPin, Leaf } from 'lucide-react'
import { useApp } from '@/lib/store'
import type { Finca } from '@/lib/types'

interface Props {
  finca: Finca
}

export function FincaCard({ finca }: Props) {
  const { setVista, productos } = useApp()
  const numProductos = productos.filter(p => p.fincaId === finca.id).length

  return (
    <div
      onClick={() => setVista('detalle-finca', finca.id)}
      className="group bg-black/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={finca.imagenURL}
          alt={finca.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-white font-medium text-base text-balance leading-tight">
            {finca.nombre}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-white">{finca.ubicacion}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <Leaf className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span className="truncate text-white">{finca.tipoCultivo}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-harvest text-harvest" />
            <span className="text-sm font-semibold text-white">{finca.rating}</span>
          </div>
          <span className="text-xs text-white bg-yellow-500/40 px-2 py-0.5 rounded-full">
            {numProductos} productos
          </span>
        </div>
      </div>
    </div>
  )
}
