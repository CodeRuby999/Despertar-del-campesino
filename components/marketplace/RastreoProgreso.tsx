'use client'

import { useEffect, useState } from 'react'
import { Truck, CheckCircle, Package, MapPin } from 'lucide-react'
import type { Pedido } from '@/lib/types'

interface Props {
  pedido: Pedido
}

const PASOS = [
  { id: 0, label: 'Pedido confirmado', desc: 'Tu pedido fue confirmado', icon: CheckCircle },
  { id: 1, label: 'Preparando', desc: 'El campesino está preparando tu pedido', icon: Package },
  { id: 2, label: 'En camino', desc: 'El motocarro está en camino', icon: Truck },
  { id: 3, label: 'Cerca de ti', desc: 'Tu pedido está cerca', icon: MapPin },
  { id: 4, label: 'Entregado', desc: '¡Tu pedido llegó!', icon: CheckCircle },
]

export function RastreoProgreso({ pedido }: Props) {
  const [pasoActual, setPasoActual] = useState(0)

  // Simulación del avance del motocarro
  useEffect(() => {
    if (pedido.estado !== 'en_camino' && pedido.estado !== 'confirmado') return

    const intervalo = setInterval(() => {
      setPasoActual(prev => {
        if (prev >= PASOS.length - 1) {
          clearInterval(intervalo)
          return prev
        }
        return prev + 1
      })
    }, 3000) // avanza cada 3 segundos en la demo

    return () => clearInterval(intervalo)
  }, [pedido.estado])

  const porcentaje = (pasoActual / (PASOS.length - 1)) * 100

  return (
    <div className="bg-muted rounded-2xl p-4 space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground">Rastreo en tiempo real</h3>
      </div>

      {/* Barra de progreso */}
      <div className="relative">
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Pasos */}
      <div className="space-y-2">
        {PASOS.map((paso) => {
          const completado = paso.id < pasoActual
          const actual = paso.id === pasoActual
          const PasoIcon = paso.icon
          return (
            <div
              key={paso.id}
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                paso.id > pasoActual ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                completado ? 'bg-primary text-primary-foreground' :
                actual ? 'bg-primary text-primary-foreground animate-pulse-green' :
                'bg-border text-muted-foreground'
              }`}>
                <PasoIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className={`text-sm font-medium ${actual ? 'text-primary' : completado ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {paso.label}
                </p>
                {actual && (
                  <p className="text-xs text-muted-foreground">{paso.desc}</p>
                )}
              </div>
              {actual && (
                <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Actual
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Simulación ilustrativa del recorrido del motocarro
      </p>
    </div>
  )
}
