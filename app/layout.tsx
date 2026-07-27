import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, DM_Serif_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'El Despertar del Campesino — Marketplace Agrícola',
  description: 'Conectamos directamente a los campesinos del Atlántico colombiano con consumidores finales. Productos frescos, sin intermediarios.',
  keywords: ['marketplace agrícola', 'campesinos Colombia', 'productos frescos', 'Atlántico', 'mercado campesino'],
  authors: [{ name: 'El Despertar del Campesino' }],
  openGraph: {
    title: 'El Despertar del Campesino',
    description: 'Del campo a tu mesa. Marketplace agrícola colombiano.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3d7a3d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} ${dmSerifDisplay.variable} bg-background`}>
      <body className="antialiased font-sans">
        {children}
        <Toaster
          position="top-left"
          toastOptions={{
            classNames: {
              toast: "!bg-green-600/30 !backdrop-blur-md !border-transparent ",
              title: "!text-white",
              description: "!text-white/70",
        },
      }}
    />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
