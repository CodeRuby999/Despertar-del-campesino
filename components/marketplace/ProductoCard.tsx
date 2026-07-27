'use client'

import { useState } from 'react'
import { ShoppingCart, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import type { Producto } from '@/lib/types'


interface Props {
  producto: Producto
  onVerDetalle?: () => void
}


export function ProductoCard({ producto, onVerDetalle }: Props) {

  const {
    agregarAlCarrito,
    setCarritoAbierto
  } = useApp()


  const [agregando, setAgregando] = useState(false)



  const handleAgregar = (e: React.MouseEvent) => {

    e.stopPropagation()

    setAgregando(true)


    agregarAlCarrito({

      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      unidad: producto.unidad,
      imagenURL: producto.imagenURL,

    })


    setTimeout(()=>{

      setAgregando(false)
      setCarritoAbierto(true)

    },600)

  }



  return (

    <div

      onClick={onVerDetalle}

      style={{
        transformStyle:"preserve-3d"
      }}

      className={`

        group

        bg-gradient-to-r
        from-black/80
        via-black/70
        to-green-800/20


        rounded-2xl

        overflow-hidden

        shadow-lg


        hover:-translate-y-1

        transition-all
        duration-300


        ${onVerDetalle ? 'cursor-pointer':''}

      `}

    >



      {/* =========================
          ZONA 3D
      ========================== */}



      <motion.div

        className="
          relative
          aspect-square
        "

        style={{
          perspective:1000
        }}

        whileHover="hover"

      >


        <motion.div

          className="
            relative
            w-full
            h-full
          "

          variants={{

            hover:{

              rotateY:180

            }

          }}


          transition={{

            duration:0.6,

            ease:"easeInOut"

          }}


          style={{

            transformStyle:"preserve-3d"

          }}

        >





          {/* =====================
              CARA FRONTAL
          ====================== */}



          <div

            className="
              absolute
              inset-0

              overflow-hidden

              rounded-t-2xl
            "

            style={{

              backfaceVisibility:"hidden"

            }}

          >



            <img

              src={producto.imagenURL}

              alt={producto.nombre}


              className="

                w-full
                h-full

                object-cover


                group-hover:scale-105

                transition-transform

                duration-500

              "



              onError={(e)=>{

                e.currentTarget.src =
                "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80"

              }}

            />




            {/* Categoria */}

            <div

              className="
                absolute
                top-2
                left-2
              "

            >

              <span

                className="
                  bg-yellow-600/90

                  backdrop-blur-sm

                  text-white

                  text-[10px]

                  font-medium

                  px-2

                  py-0.5

                  rounded-full

                "

              >

                {producto.categoria}


              </span>


            </div>





            {/* Stock */}

            {
              producto.stock < 10 && (

                <div

                  className="
                    absolute
                    top-2
                    right-2
                  "

                >

                  <span

                    className="
                      bg-red-600

                      text-white

                      text-[10px]

                      px-2

                      py-0.5

                      rounded-full
                    "

                  >

                    Últimas unidades


                  </span>


                </div>

              )
            }



          </div>






          {/* =====================
              CARA TRASERA
          ====================== */}



          <div

            className="

              absolute

              inset-0


              rounded-t-2xl


              



              p-5



              flex

              flex-col

              justify-center



              text-white

            "



            style={{

              transform:"rotateY(180deg)",

              backfaceVisibility:"hidden"

            }}


          >



            <h3

              className="

                text-xl

               

                text-yellow-400

                mb-3

              "

            >

              {producto.nombre}


            </h3>





            <p

              className="

                text-sm

                text-white/80

                leading-relaxed

                mb-4

                line-clamp-7

              "

            >

              {producto.descripcion}


            </p>





            <div className="space-y-2">


              <h4

                className="

                  text-sm

                  font-semibold

                  text-green-600

                "

              >

                Beneficios:


              </h4>




              {

                producto.beneficios?.slice(0,3).map(

                  (beneficio,index)=>(

                    <p

                      key={index}

                      className="

                        text-sm

                        text-white/90

                        flex

                        items-center

                        gap-2

                      "

                    >


                      <span className="text-yellow-400">

                        ✓

                      </span>



                      {beneficio}



                    </p>

                  )

                )

              }



            </div>



          </div>




        </motion.div>


      </motion.div>
            {/* =========================
          PARTE INFERIOR FIJA
      ========================== */}


      <div

        className="
          p-3
        "

      >



        {/* Finca */}

        <p

          className="
            text-[15px]

            text-green-500/80

            mb-0.5

            truncate
          "

        >

          {producto.fincaNombre}


        </p>





        {/* Nombre producto */}

        <h3

          className="

            font-thin

            text-lg

            text-white

            leading-snug

            line-clamp-2

            mb-2

          "

        >

          {producto.nombre}


        </h3>






        {/* Precio + boton */}


        <div

          className="

            flex

            items-center

            justify-between

          "

        >



          <div>


            <span

              className="

                text-yellow-400

                tracking-wider

              "

            >

              ${producto.precio.toLocaleString('es-CO')}


            </span>




            <span

              className="

                text-white

                text-xs

              "

            >

              / {producto.unidad}


            </span>


          </div>








          {/* =====================
              BOTON CARRITO
          ====================== */}



          <button


            onClick={handleAgregar}



            className={`


              w-8

              h-8


              rounded-xl
              
              
              flex

              items-center

              justify-center




              transition-all

              duration-300




              ${

                agregando

                ?



                `

                  bg-primary

                  text-primary-foreground

                  scale-95

                `

                :



                `

                  bg-gradient-to-r

                  from-green-700/80

                  via-yellow-600/60
                  to-green-700/80
                  


                

                  text-white



                  hover:scale-110


                  

                  shadow-lg

                  shadow-green-700/30


                `

              }



            `}



            aria-label="Agregar al carrito"


          >




            {

              agregando



              ?



              <ShoppingCart

                className="

                  w-3.5

                  h-3.5

                "

              />



              :



              <Plus

                className="

                  w-3.5

                  h-3.5

                "

              />

            }





          </button>




        </div>




      </div>



    </div>

  )

}