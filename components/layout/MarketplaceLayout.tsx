'use client'

import { useApp } from '@/lib/store'
import { Navbar } from './Navbar'
import { CarritoLateral } from '@/components/marketplace/CarritoLateral'
import { InicioView } from '@/components/views/InicioView'
import { FincasView } from '@/components/views/FincasView'
import { DetalleFincaView } from '@/components/views/DetalleFincaView'
import { PedidosView } from '@/components/views/PedidosView'
import { AdminView } from '@/components/views/AdminView'

export function MarketplaceLayout() {
  const { vista } = useApp()

  const renderVista = () => {
    switch (vista) {
      case 'inicio': return <InicioView />
      case 'fincas': return <FincasView />
      case 'detalle-finca': return <DetalleFincaView />
      case 'pedidos': return <PedidosView />
      case 'admin': return <AdminView />
      default: return <InicioView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {renderVista()}
      </main>
      <CarritoLateral />
    </div>
  )
}
