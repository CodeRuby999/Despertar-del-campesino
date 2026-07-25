'use client'

import { useApp } from '@/lib/store'
import { AppProvider } from '@/components/providers/AppProvider'
import { AuthScreen } from '@/components/auth/AuthScreen'
import { MarketplaceLayout } from '@/components/layout/MarketplaceLayout'
import { Sprout } from 'lucide-react'

function AppContent() {
  const { usuario, cargandoAuth } = useApp()

  if (cargandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center animate-pulse-green">
            <Sprout className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="font-display text-xl text-foreground">El Despertar del Campesino</p>
            <p className="text-muted-foreground text-sm mt-1">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return <AuthScreen />
  }

  return <MarketplaceLayout />
}

export default function HomePage() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
