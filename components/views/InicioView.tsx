'use client'

import { useState } from 'react'
import { ArrowRight, Star, TrendingUp, Users, Package, ShoppingBag, Leaf } from 'lucide-react'
import { useApp } from '@/lib/store'
import { CATEGORIAS } from '@/lib/seed-data'
import { ProductoCard } from '@/components/marketplace/ProductoCard'
import { FincaCard } from '@/components/marketplace/FincaCard'
import Typewriter from '@/components/ui/Typewriter'

export function InicioView() {
  const { fincas, productos, pedidos, setVista } = useApp()
  const [categoriaActiva, setCategoriaActiva] = useState('todas')

  const productosFiltrados = categoriaActiva === 'todas'
    ? productos.slice(0, 8)
    : productos.filter(p => p.categoria === categoriaActiva).slice(0, 8)

  const stats = [
  {
    icon: Users,
    valor: fincas.length || '4+',
    label: 'Fincas activas',
    color: 'text-green-700 bg-green-100',
    card: 'bg-gradient-to-br from-green-800 to-black-200/30 ' ,
    border: '',
    numberColor: 'text-green-100',
  },
  {
    icon: Package,
    valor: productos.length || '10+',
    label: 'Productos frescos',
    color: 'text-yellow-700 bg-yellow-100',
    card: 'bg-gradient-to-br from-yellow-300 to-black/30',
    border: 'border-yellow-200',
    numberColor: 'text-yellow-100',
  },
  {
    icon: ShoppingBag,
    valor: pedidos.length || '0',
    label: 'Pedidos entregados',
    color: 'text-blue-700 bg-blue-100',
    card: 'bg-gradient-to-br from-blue-600 to-black/30',
    border: 'border-blue-200',
    numberColor: 'text-blue-100',
  },
  {
    icon: TrendingUp,
    valor: '4.9★',
    label: 'Calificación promedio',
    color: 'text-orange-700 bg-orange-100',
    card: 'bg-gradient-to-br from-orange-600/50 to-black/30',
    border: 'border-orange-200',
    numberColor: 'text-orange-100',
  },
]

  return (
      <div className="relative min-h-screen pt-30">

            {/* Hero */}
            <section
        className="
          relative
          z-10
          overflow-hidden
          px-6
          py-16
          md:py-24
        "
>
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 "></div>
          <img src="images/imagen-campo-2.png" alt="" className='w-full h-full object-cover ' />
        </div> */}
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" />
            Directamente del campo colombiano
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white text-balance mb-4">
            Productos frescos
            <br />
            <span className="text-harvest">directo del Productor</span>
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed  ">
             <Typewriter text="Conectamos a los campesinos del Atlántico con consumidores que valoran la frescura, el trabajo del campo y la economía justa." />
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
            onClick={() => setVista('fincas')}
  className="
    relative
    overflow-hidden
    rounded-xl
    px-6
    py-3

    bg-green-800/80
    flex
    items-center
    text-white
    font-semibold
    shadow-lg
    shadow-[#88A201]/30

    transition-transform
    hover:scale-105
  "
>
  {/* Línea de brillo diagonal */}
  <span
    className="
      absolute

      top-0
      left-[-100%]

      w-12
      h-[200%]

      rotate-45
      
      bg-gradient-to-r
      from-transparent
      via-white/40
      to-transparent

      animate-shine-diagonal

      pointer-events-none
    "
  />
  

  <span className="relative z-10" >
    Explorar fincas
  </span>
  <ArrowRight className="relative z-10 w-5 h-5 " />
</button>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="max-w-7xl mx-auto px-4 mt-6 relative z-10">
        <div className="mb-4 mt-30">
    <h2 className="font-display text-2xl text-white ">
      Nuestras Cifras
    </h2>
    <p className="text-white/70 text-sm mb-8">
      Datos destacados de nuestra comunidad agrícola
    </p>
  </div>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

    {stats.map(stat => (
      <div
        key={stat.label}
        className={`
          ${stat.card}
          ${stat.border}
          
          rounded-2xl
          p-3
          shadow-3xl
          
          flex
          items-center
          gap-3
          hover:-translate-y-1
          transition-all
          duration-300
        `}
      >

        <div 
          className={`
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            shrink-0
            ${stat.color}
          `}
        >
          <stat.icon className="w-5 h-5" />
        </div>

        <div>
          <div className={`font-display text-xl font-bold ${stat.numberColor}`}>
            {stat.valor}
          </div>

          <div className="text-xs text-white">
            {stat.label}
          </div>
        </div>

      </div>
    ))}

  </div>
</section>
      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 mt-10 relative z-10">
        <div className="grid items-center justify-between mb-4">
          <h2 className="font-display text-2xl  text-white">Categorías</h2>
          <p className="text-white/70 text-sm">
          Descubre productos según su tipo
        </p>

        </div>
        <div className="flex gap-2 overflow-x-auto  pb-2 scrollbar-hide">
          {CATEGORIAS.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-6 py-2 font-semibold rounded-xl text-sm font-medium transition-all duration-200 ${
                categoriaActiva === cat.id
                  ? 'bg-green-800/80 text-white  shadow-lg '
                  : 'bg-black/40 backdrop-blur-sm text-white  hover:border-primary/40 hover:bg-white/80 hover:text-black'
              }`}
            >
              <span>{cat.icono}</span>
              {cat.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-white">Productos frescos</h2>
          <button
            onClick={() => setVista('fincas')}
            className="text-sm text-white font-medium flex items-center gap-1 hover:underline"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No hay productos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {productosFiltrados.map(p => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </section>

      {/* Fincas destacadas */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-12 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-white">Fincas destacadas</h2>
          <button
            onClick={() => setVista('fincas')}
            className="text-sm text-white font-medium flex items-center gap-1 hover:underline"
          >
            Ver todas
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fincas.slice(0, 4).map(f => (
            <FincaCard key={f.id} finca={f} />
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="bg-black/60 py-14 px-6 relative z-10 ">
        <div className="max-w-3xl mx-auto text-center justify-center">
          <h2 className="font-display text-3xl text-yellow-500/90 mb-3">
            ¿Eres campesino? 
          </h2>
          <p className="text-white/80 mb-6 leading-relaxed">
            Regístrate como productor y conecta directamente con miles de compradores que valoran tu trabajo.
          </p>
          <button  className="
                      mx-auto
                      relative
                      overflow-hidden
                      rounded-xl
                      px-6
                      py-3
                      bg-green-800/80
                      flex
                      items-center
                      text-white
                      font-semibold
                      shadow-lg
                      
                      transition-transform
                      hover:scale-105
                    "
        >
  <span
    className="
      absolute

      top-0
      left-[-100%]

      w-12
      h-[200%]

      rotate-45
      
      bg-gradient-to-r
      from-transparent
      via-white/40
      to-transparent

      animate-shine-diagonal

      pointer-events-none
    "
  />

            <Star className="w-4 h-4" />
            Únete como campesino
          </button>
        </div>
      </section>
    </div>
  )
}
