'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Bell, User, Sprout, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { isFirebaseConfigured } from '@/lib/firebase'
import { toast } from 'sonner'

export function Navbar() {
  const {
    usuario, carrito, notificaciones, carritoAbierto,
    setCarritoAbierto, setVista, setUsuario, vista,
    marcarNotificacionesLeidas,
  } = useApp()

  const [menuUsuario, setMenuUsuario] = useState(false)
  const [menuNotif, setMenuNotif] = useState(false)
  const [menuMobile, setMenuMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50)
  }

  window.addEventListener('scroll', handleScroll)

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}, [])

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)
  const noLeidas = notificaciones.filter(n => !n.leida).length

  const handleLogout = async () => {
    if (isFirebaseConfigured()) {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { signOut } = await import('firebase/auth')
        await signOut(getFirebaseAuth())
      } catch {
        // ignorar
      }
    }
    setUsuario(null)
    toast.info('Sesión cerrada correctamente')
    setMenuUsuario(false)
  }

  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'fincas', label: 'Fincas' },
    { id: 'pedidos', label: 'Mis pedidos' },
  ] as const

  return (
    <header
  className={`
    fixed
    top-4
    left-1/2
    -translate-x-1/2

    w-[95%]
    max-w-7xl

    rounded-2xl

    

    shadow-lg

    z-50

    transition-all
    duration-300

    ${
      scrolled
        ? `
          bg-gradient-to-br from-black/30 via-white/10 to-black/30
          backdrop-blur-xl
          border-gray-200
          shadow-xl
          
        `
        : `
         bg-black/30 via-white/10 to-black/30
          border-gray-200
          shadow-xl
        `
    }
  `}
>
      <div
        className="absolute inset-0 bg-cover bg-center"
      ></div>
      <div className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: "url('/images/imagen-campo')" }}></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => setVista('inicio')}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sprout className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg text-white/90 hidden sm:block">
            El Despertar del Campesino
          </span>
        </button>

        {/* Nav links desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
  key={link.id}
  onClick={() => setVista(link.id)}
  className={`
    relative
    px-4
    py-2
    text-sm
    font-medium
    transition-colors
    duration-300

    ${
      vista === link.id
        ? 'text-white'
        : 'text-white/70 hover:text-white'
    }
  `}
>
  {link.label}

  {vista === link.id && (
    <span
className="
absolute
left-1/2
-translate-x-1/2
bottom-0

w-8
h-1

bg-green-700

rounded-full

transition-all
duration-800
"
/>
  )}
</button>
          ))}
          {usuario?.rol === 'admin' && (
            <button
              onClick={() => setVista('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${vista === 'admin'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              Administrador
            </button>
          )}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1">
          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => {
                setMenuNotif(!menuNotif)
                if (!menuNotif) marcarNotificacionesLeidas()
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-white" />
              {noLeidas > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-green">
                  {noLeidas}
                </span>
              )}
            </button>
            {menuNotif && (
              <div className="absolute right-0 top-11 w-80 bg-popover rounded-2xl shadow-xl border border-border p-2 z-50 animate-fade-in-up">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-semibold text-sm text-foreground">Notificaciones</p>
                </div>
                {notificaciones.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">Sin notificaciones</div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-0.5">
                    {notificaciones.map(n => (
                      <div key={n.id} className="px-3 py-2.5 rounded-xl hover:bg-muted transition-colors">
                        <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.mensaje}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Carrito */}
          <button
            onClick={() => setCarritoAbierto(!carritoAbierto)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setMenuUsuario(!menuUsuario)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors ml-1"
            >
              {usuario?.photoURL ? (
                <img src={usuario.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <span
  className="
    hidden
    sm:block

    text-sm
    font-bold

    relative
    overflow-hidden

    bg-gradient-to-r
    from-yellow-300
    via-green-500
    to-yellow-300

    bg-clip-text
    text-transparent

    bg-[length:200%_auto]

    animate-shine-text

    max-w-24
    truncate
  "
>
  {usuario?.nombre?.split(' ')[0]}
</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {menuUsuario && (
              <div className="absolute right-0 top-11 w-52 bg-popover rounded-2xl shadow-xl border border-border p-2 z-50 animate-fade-in-up">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="font-semibold text-sm text-foreground truncate">{usuario?.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{usuario?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full capitalize">
                    {usuario?.rol}
                  </span>
                </div>
                {usuario?.rol === 'admin' && (
                  <button
                    onClick={() => { setVista('admin'); setMenuUsuario(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm text-foreground"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Panel de admin
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Hamburguesa mobile */}
          <button
            onClick={() => setMenuMobile(!menuMobile)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground ml-1"
          >
            {menuMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {menuMobile && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1 animate-fade-in-up">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => { setVista(link.id); setMenuMobile(false) }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${vista === link.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              {link.label}
            </button>
          ))}
          {usuario?.rol === 'admin' && (
            <button
              onClick={() => { setVista('admin'); setMenuMobile(false) }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Administrador
            </button>
          )}
        </div>
      )}

      {/* Overlay para cerrar menús */}
      {(menuUsuario || menuNotif) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setMenuUsuario(false); setMenuNotif(false) }}
        />
      )}
    </header>
  )
}
