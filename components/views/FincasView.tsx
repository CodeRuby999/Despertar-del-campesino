'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin } from 'lucide-react'
import { useApp } from '@/lib/store'
import { FincaCard } from '@/components/marketplace/FincaCard'

export function FincasView() {
  const { fincas } = useApp()
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  const tipos = ['todos', ...Array.from(new Set(fincas.map(f => f.tipoCultivo)))]

  const fincasFiltradas = fincas.filter(f => {
    const matchBusqueda = f.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.tipoCultivo.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || f.tipoCultivo === filtroTipo
    return matchBusqueda && matchTipo
  })

  return (
    <div
    className="
      min-h-screen
      bg-cover
      bg-center
      bg-no-repeat
      relative
      pt-30
      px-4
      py-8
    "
    style={{
      backgroundImage: "url('/images/finca-view.png')",
    }}
  >
  <div
  className="
    absolute
    inset-0
    pointer-events-none
    bg-black/30
  "
/>
      {/* Header */}
      <div className="mb-6 relative z-10 max-w-7xl mx-auto">
        <h1 className="font-display text-3xl text-foreground mb-1 text-yellow-400">Fincas del Atlántico</h1>
        <p className="text-white">Descubre productores verificados que llevan su cosecha directamente a ti</p>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10 max-w-7xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, ubicación o cultivo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 relative z-10 max-w-7xl mx-auto">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-2 overflow-x-auto">
            {tipos.map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  filtroTipo === tipo
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {tipo === 'todos' ? 'Todos los cultivos' : tipo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {fincasFiltradas.length === 0 ? (
        <div className="text-center py-16 relative z-10 max-w-7xl mx-auto">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-display text-xl text-foreground mb-1">Sin resultados</h3>
          <p className="text-muted-foreground text-sm">Intenta con otros términos de búsqueda</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4 relative z-10 max-w-7xl mx-auto">
            {fincasFiltradas.length} finca{fincasFiltradas.length !== 1 ? 's' : ''} encontrada{fincasFiltradas.length !== 1 ? 's' : ''}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10 max-w-7xl mx-auto">
            {fincasFiltradas.map(f => (
              <FincaCard key={f.id} finca={f} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
