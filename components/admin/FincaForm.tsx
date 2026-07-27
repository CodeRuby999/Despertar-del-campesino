'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Finca } from '@/lib/types'

interface Props {
  initialData?: Partial<Finca>
  onSave: (data: Omit<Finca, 'id'>) => Promise<void>
  onCancel: () => void
}

type FormData = Omit<Finca, 'id'>

const EMPTY: FormData = {
  nombre: '',
  propietario: '',
  propietarioUid: '',
  año: new Date().getFullYear(),
  ubicacion: '',
  tipoCultivo: '',
  telefono: '',
  rating: 5,
  descripcion: '',
  imagenURL: '',
  videoURL: '',
}

export function FincaForm({ initialData, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initialData })
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<keyof FormData, string>>>({})

  const set = (campo: keyof FormData, valor: string | number) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }))
  }

  const validar = (): boolean => {
    const nuevosErrores: Partial<Record<keyof FormData, string>> = {}
    if (!form.nombre.trim())       nuevosErrores.nombre      = 'El nombre es obligatorio'
    if (!form.propietario.trim())  nuevosErrores.propietario = 'El propietario es obligatorio'
    if (!form.ubicacion.trim())    nuevosErrores.ubicacion   = 'La ubicación es obligatoria'
    if (!form.tipoCultivo.trim())  nuevosErrores.tipoCultivo = 'El tipo de cultivo es obligatorio'
    if (!form.imagenURL.trim())    nuevosErrores.imagenURL   = 'La URL de imagen es obligatoria'
    if (form.rating < 1 || form.rating > 5) nuevosErrores.rating = 'El rating debe estar entre 1 y 5'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      await onSave(form)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-display text-xl text-foreground">
            {initialData?.nombre ? 'Editar finca' : 'Nueva finca'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Cerrar formulario"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <Campo
              label="Nombre de la finca"
              error={errores.nombre}
              required
            >
              <input
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Finca El Manantial"
                className={inputCls(errores.nombre)}
              />
            </Campo>

            {/* Propietario */}
            <Campo
              label="Propietario"
              error={errores.propietario}
              required
            >
              <input
                value={form.propietario}
                onChange={e => set('propietario', e.target.value)}
                placeholder="Juan García"
                className={inputCls(errores.propietario)}
              />
            </Campo>

            {/* Ubicación */}
            <Campo
              label="Ubicación"
              error={errores.ubicacion}
              required
            >
              <input
                value={form.ubicacion}
                onChange={e => set('ubicacion', e.target.value)}
                placeholder="Boyacá, Colombia"
                className={inputCls(errores.ubicacion)}
              />
            </Campo>

            {/* Tipo de cultivo */}
            <Campo
              label="Tipo de cultivo"
              error={errores.tipoCultivo}
              required
            >
              <input
                value={form.tipoCultivo}
                onChange={e => set('tipoCultivo', e.target.value)}
                placeholder="Hortalizas orgánicas"
                className={inputCls(errores.tipoCultivo)}
              />
            </Campo>

            {/* Año */}
            <Campo label="Año de fundación">
              <input
                type="number"
                value={form.año}
                min={1900}
                max={new Date().getFullYear()}
                onChange={e => set('año', parseInt(e.target.value))}
                className={inputCls()}
              />
            </Campo>

            {/* Teléfono */}
            <Campo label="Teléfono">
              <input
                value={form.telefono}
                onChange={e => set('telefono', e.target.value)}
                placeholder="+57 300 000 0000"
                className={inputCls()}
              />
            </Campo>

            {/* Rating */}
            <Campo label="Rating (1–5)" error={errores.rating}>
              <input
                type="number"
                value={form.rating}
                min={1}
                max={5}
                step={0.1}
                onChange={e => set('rating', parseFloat(e.target.value))}
                className={inputCls(errores.rating)}
              />
            </Campo>

            {/* propietarioUid (oculto pero requerido por el tipo) */}
            <Campo label="UID del propietario">
              <input
                value={form.propietarioUid}
                onChange={e => set('propietarioUid', e.target.value)}
                placeholder="UID de Firebase Auth (opcional)"
                className={inputCls()}
              />
            </Campo>
          </div>

          {/* Imagen URL */}
          <Campo
            label="URL de imagen"
            error={errores.imagenURL}
            required
          >
            <input
              value={form.imagenURL}
              onChange={e => set('imagenURL', e.target.value)}
              placeholder="https://..."
              className={inputCls(errores.imagenURL)}
            />
          </Campo>

          {/* Video URL */}
          <Campo label="URL de video (opcional)">
            <input
              value={form.videoURL ?? ''}
              onChange={e => set('videoURL', e.target.value)}
              placeholder="https://youtube.com/..."
              className={inputCls()}
            />
          </Campo>

          {/* Descripción */}
          <Campo label="Descripción">
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={3}
              placeholder="Describe la finca y sus características..."
              className={`${inputCls()} resize-none`}
            />
          </Campo>

          {/* Vista previa de imagen */}
          {form.imagenURL && (
            <div className="rounded-xl overflow-hidden border border-border h-36">
              <img
                src={form.imagenURL}
                alt="Vista previa"
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-xl hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {guardando ? 'Guardando...' : initialData?.nombre ? 'Guardar cambios' : 'Crear finca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────

function inputCls(error?: string) {
  return `w-full px-3 py-2 text-sm bg-muted border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-destructive focus:ring-destructive/30'
      : 'border-border focus:ring-primary/30'
  }`
}

function Campo({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
