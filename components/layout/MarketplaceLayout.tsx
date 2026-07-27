'use client'

import { useApp } from '@/lib/store'
import { Navbar } from './Navbar'
import { CarritoLateral } from '@/components/marketplace/CarritoLateral'
import { InicioView } from '@/components/views/InicioView'
import { FincasView } from '@/components/views/FincasView'
import { DetalleFincaView } from '@/components/views/DetalleFincaView'
import { PedidosView } from '@/components/views/PedidosView'
import { AdminView } from '@/components/views/AdminView'
import { AnimatePresence, motion } from 'framer-motion'

export function MarketplaceLayout() {
  const { vista } = useApp()

 const renderVista = () => {
  switch (vista) {
    case 'inicio':
      return <InicioView />

    case 'fincas':
      return <FincasView />

    case 'detalle-finca':
      return <DetalleFincaView />

    case 'pedidos':
      return <PedidosView />

    case 'admin':
      return <AdminView />

    default:
      return <InicioView />
  }
}

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 z-0">
        <img
          src="/images/campo-inicio.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <Navbar />
      <div className="overflow-hidden">

      <AnimatePresence mode="wait">

          <motion.main
            key={vista}
            className="relative z-10"
            initial={{
              x: 80,
              opacity: 0
            }}
            animate={{
              x: 0,
              opacity: 1
            }}
            exit={{
              x: -80,
              opacity: 0
            }}
            transition={{
              duration: 0.35,
              ease: "easeInOut"
            }}
          >
  {renderVista()}
</motion.main>

  </AnimatePresence>

</div>
      <CarritoLateral />
    </div>
  )
}
