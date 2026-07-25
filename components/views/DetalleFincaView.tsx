'use client'

import { useState } from 'react'
import { Star, MapPin, Phone, Leaf, ChevronLeft, Calendar } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ProductoCard } from '@/components/marketplace/ProductoCard'
import { ProductoModal } from '@/components/marketplace/ProductoModal'
import type { Producto } from '@/lib/types'

export function DetalleFincaView() {
  const { fincas, productos, fincaSeleccionadaId, setVista } = useApp()
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)

  const finca = fincas.find(f => f.id === fincaSeleccionadaId)
  const productosDeEstaFinca = productos.filter(p => p.fincaId === fincaSeleccionadaId)

  if (!finca) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Finca no encontrada</p>
        <button onClick={() => setVista('fincas')} className="text-primary mt-2 hover:underline text-sm">
          Volver a fincas
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <button
        onClick={() => setVista('fincas')}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a fincas
      </button>

      {/* Hero de la finca */}
      <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 mb-6">
        <img
          src={finca.imagenURL}
          alt={finca.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-white text-balance">{finca.nombre}</h1>
              <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {finca.ubicacion}
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 fill-harvest text-harvest" />
              <span className="text-white font-semibold">{finca.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="md:col-span-2 space-y-5">
          {/* Descripción */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-display text-xl text-foreground mb-3">Sobre esta finca</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">{finca.descripcion}</p>
          </div>

          {/* Productos */}
          <div>
            <h2 className="font-display text-xl text-foreground mb-4">
              Productos disponibles
              <span className="text-base font-sans text-muted-foreground ml-2">({productosDeEstaFinca.length})</span>
            </h2>
            {productosDeEstaFinca.length === 0 ? (
              <div className="bg-muted rounded-2xl p-8 text-center text-muted-foreground text-sm">
                Esta finca aún no tiene productos disponibles.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productosDeEstaFinca.map(p => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onVerDetalle={() => setProductoSeleccionado(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar del productor */}
        <aside className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 sticky top-20">
            <h3 className="font-semibold text-foreground mb-4">Datos del productor</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Propietario</p>
                  <p className="text-sm font-medium text-foreground">{finca.propietario}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="text-sm font-medium text-foreground">{finca.ubicacion}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Desde</p>
                  <p className="text-sm font-medium text-foreground">{finca.año}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <a
                    href={`tel:${finca.telefono.replace(/\s/g, '')}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {finca.telefono}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Tipo de cultivo</p>
              <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                {finca.tipoCultivo}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de producto */}
      {productoSeleccionado && (
        <ProductoModal
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
        />
      )}
    </div>
  )
}
