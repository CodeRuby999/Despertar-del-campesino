'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Sprout, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { UserRole, Usuario } from '@/lib/types'

type Modo = 'login' | 'registro'

export function AuthScreen() {
  const { setUsuario, setCargandoAuth, agregarNotificacion } = useApp()
  const [modo, setModo] = useState<Modo>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<UserRole>('cliente')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [cargandoGoogle, setCargandoGoogle] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cargando) return
    setCargando(true)

    if (!isFirebaseConfigured()) {
      // Modo demo sin Firebase
      const usuario: Usuario = {
        uid: `demo-${Date.now()}`,
        nombre: nombre || email.split('@')[0],
        email,
        rol: email.includes('admin') ? 'admin' : rol,
        createdAt: new Date(),
      }
      setUsuario(usuario)
      agregarNotificacion({ titulo: 'Bienvenido', mensaje: `Hola ${usuario.nombre}, bienvenido a El Despertar del Campesino.`, tipo: 'sesion' })
      toast.success(`¡Bienvenido, ${usuario.nombre}!`)
      setCargando(false)
      return
    }

    try {
      const { getFirebaseAuth, getFirebaseDb } = await import('@/lib/firebase')
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const { doc, setDoc, getDoc } = await import('firebase/firestore')

      const authInstance = getFirebaseAuth()
      const db = getFirebaseDb()

      if (modo === 'login') {
        const { user } = await signInWithEmailAndPassword(authInstance, email, password)
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
        const userData = userDoc.exists()
          ? (userDoc.data() as Usuario)
          : { uid: user.uid, nombre: user.displayName ?? email.split('@')[0], email, rol: 'cliente' as UserRole, createdAt: new Date() }
        setUsuario(userData)
        agregarNotificacion({ titulo: 'Sesión iniciada', mensaje: `Bienvenido de vuelta, ${userData.nombre}`, tipo: 'sesion' })
        toast.success(`¡Bienvenido, ${userData.nombre}!`)
      } else {
        const { user } = await createUserWithEmailAndPassword(authInstance, email, password)
        await updateProfile(user, { displayName: nombre })
        const userData: Usuario = { uid: user.uid, nombre, email, rol, createdAt: new Date() }
        await setDoc(doc(db, 'usuarios', user.uid), userData)
        setUsuario(userData)
        agregarNotificacion({ titulo: 'Cuenta creada', mensaje: `¡Tu cuenta fue creada exitosamente!`, tipo: 'sesion' })
        toast.success(`¡Cuenta creada! Bienvenido, ${nombre}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de autenticación'
      toast.error(msg.includes('user-not-found') ? 'Usuario no encontrado' : msg.includes('wrong-password') ? 'Contraseña incorrecta' : 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  const handleGoogle = async () => {
    if (cargandoGoogle) return
    setCargandoGoogle(true)

    if (!isFirebaseConfigured()) {
      const usuario: Usuario = {
        uid: `google-demo-${Date.now()}`,
        nombre: 'Usuario Google Demo',
        email: 'demo@google.com',
        rol: 'cliente',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user=s64',
        createdAt: new Date(),
      }
      setUsuario(usuario)
      toast.success('¡Bienvenido por Google (modo demo)!')
      setCargandoGoogle(false)
      return
    }

    try {
      const { getFirebaseAuth, getFirebaseDb } = await import('@/lib/firebase')
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const { doc, setDoc, getDoc } = await import('firebase/firestore')

      const authInstance = getFirebaseAuth()
      const db = getFirebaseDb()
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(authInstance, provider)

      const userRef = doc(db, 'usuarios', user.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        const userData: Usuario = {
          uid: user.uid,
          nombre: user.displayName ?? 'Usuario',
          email: user.email ?? '',
          rol: 'cliente',
          photoURL: user.photoURL ?? undefined,
          createdAt: new Date(),
        }
        await setDoc(userRef, userData)
        setUsuario(userData)
      } else {
        setUsuario(userDoc.data() as Usuario)
      }

      agregarNotificacion({ titulo: 'Sesión iniciada', mensaje: 'Accediste con tu cuenta de Google', tipo: 'sesion' })
      toast.success(`¡Bienvenido, ${user.displayName}!`)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('popup-closed')) {
        toast.info('Inicio con Google cancelado')
      } else {
        toast.error('Error al iniciar con Google')
      }
    } finally {
      setCargandoGoogle(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — imagen */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden ">
        <img
          src="/images/hero-campo.png"
          alt="Campo colombiano al atardecer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 "  />
        <div className="relative z-10 flex flex-col pt-35 pb-14 pl-17 pr-14 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-3xl p-2 flex items-center justify-center">
            {/* <img src="images/Logo-despertar-campesino.png" alt="" className='w-full h-full object-contain' /> */}
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-white/80 text-sm font-medium tracking-wider uppercase">El Despertar del Campesino</span>
          </div>
          <h1 className="font-display text-5xl leading-tight mb-4">
            Del campo<br />
            <span className="text-harvest">a tu mesa.</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm">
            Conectamos directamente a los campesinos del Atlántico colombiano con consumidores que valoran la frescura y el esfuerzo del campo.
          </p>
          <div className="flex gap-6 mt-10">
            {[
              { valor: '+120', label: 'Campesinos' },
              { valor: '+500', label: 'Productos' },
              { valor: '4.9★', label: 'Calificación' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.valor}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="relative flex-1 flex items-center justify-center p-6 bg-center bg-cover overflow-hidden" style={{
        backgroundImage: "url('/images/imagen-background.webp')",
      }}>
        <div className="absolute inset-0 bg-white/50 backdrop"></div>
        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          {/* Logo mobile */}
          {/* <img src="images/Logo-despertar-campesino.png" alt="Logo-despertar-campesino" className='w-30 h-30 object-cover object-center' /> */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">El Despertar del Campesino</span>
          </div>



          {/* Icono de la página */}
          <div className="flex items-center gap-5 mb-8">

          {/* Texto */}
          <div>
            <h2 className="font-display text-3xl text-foreground mb-1">
              {modo === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta ahora'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {modo === 'login'
                ? 'Ingresa a tu cuenta para continuar'
                : 'Únete a nuestra comunidad agrícola'}
            </p>
            
          </div>
          <div className="w-40 h-30  rounded-2xl flex items-center justify-center shrink-0">
              <img src="images/Logo-despertar-campesino.png" alt="" className='w-full h-full object-contain '/>
          </div>
        </div>

          {/* Tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            {(['login', 'registro'] as Modo[]).map(m => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${modo === m
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Botón Google */}
          <button
            onClick={handleGoogle}
            disabled={cargandoGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-200 text-sm font-medium text-foreground mb-5 disabled:opacity-60"
          >
            {cargandoGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">o continúa con email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {modo === 'registro' && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={mostrarPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Selector de rol en registro */}
            {modo === 'registro' && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">¿Eres...?</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'cliente', label: 'Comprador', desc: 'Quiero comprar productos' },
                    { value: 'campesino', label: 'Campesino', desc: 'Quiero vender mi cosecha' },
                  ] as { value: UserRole; label: string; desc: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRol(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${rol === opt.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:border-primary/40'
                        }`}
                    >
                      <div className="font-medium text-sm text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={cargando}
              className="w-full py-3 h-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200"
            >
              {cargando ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>

          {!isFirebaseConfigured() && (
            <p className="text-xs text-muted-foreground text-center mt-4 p-3 bg-harvest/10 rounded-lg">
              Modo demo activo — ingresa cualquier email y contraseña para explorar la app
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center mt-6">
            Al continuar aceptas nuestros{' '}
            <span className="text-primary cursor-pointer hover:underline">Términos de uso</span> y{' '}
            <span className="text-primary cursor-pointer hover:underline">Política de privacidad</span>
          </p>
        </div>
      </div>
    </div>
  )
}
