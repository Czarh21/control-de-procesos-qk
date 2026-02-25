"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { addTicket, type TipoServicio } from "@/lib/tickets"
import { revalidateAllTickets } from "@/hooks/use-tickets"
import {
  Plus,
  Loader2,
  Printer,
  Layers,
  Scissors,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* =========================================================
   PROCESS FLOW DEFINITIONS
   ========================================================= */

interface ProcessOption {
  value: TipoServicio
  label: string
  description: string
  steps: { icon: React.ElementType; label: string }[]
}

const PROCESS_OPTIONS: ProcessOption[] = [
  {
    value: "solo_impresion",
    label: "Solo Impresion",
    description: "Solo se imprime",
    steps: [{ icon: Printer, label: "Impresion" }],
  },
  {
    value: "solo_laminado",
    label: "Solo Laminado",
    description: "Solo se lamina",
    steps: [{ icon: Layers, label: "Laminado" }],
  },
  {
    value: "imp_lam",
    label: "Impresion + Laminado",
    description: "Se imprime y despues se lamina",
    steps: [
      { icon: Printer, label: "Impresion" },
      { icon: Layers, label: "Laminado" },
    ],
  },
  {
    value: "imp_lam_corte",
    label: "Impresion + Laminado + Corte",
    description: "Se imprime, se lamina y se va a corte",
    steps: [
      { icon: Printer, label: "Impresion" },
      { icon: Layers, label: "Laminado" },
      { icon: Scissors, label: "Corte" },
    ],
  },
  {
    value: "imp_lam_foil",
    label: "Impresion + Laminado + Foil",
    description: "Se imprime, se lamina, regresa a impresion y regresa a laminar para foil",
    steps: [
      { icon: Printer, label: "Impresion" },
      { icon: Layers, label: "Laminado" },
      { icon: Printer, label: "2da Imp." },
      { icon: Sparkles, label: "Foil" },
    ],
  },
  {
    value: "imp_lam_foil_corte",
    label: "Impresion + Laminado + Foil + Corte",
    description: "Se imprime, se lamina, regresa a impresion, foil y se va a corte",
    steps: [
      { icon: Printer, label: "Impresion" },
      { icon: Layers, label: "Laminado" },
      { icon: Printer, label: "2da Imp." },
      { icon: Sparkles, label: "Foil" },
      { icon: Scissors, label: "Corte" },
    ],
  },
]

/* =========================================================
   TIME FIELDS CONFIG
   ========================================================= */

function getTimeFields(tipo: TipoServicio, conAcabados: boolean) {
  const fields: { key: string; label: string; placeholder: string }[] = []

  if (tipo !== "solo_laminado") {
    fields.push({ key: "tiempoImpresion", label: "Tiempo Impresion (min)", placeholder: "30" })
  }
  if (tipo !== "solo_impresion") {
    fields.push({ key: "tiempoLaminado", label: "Tiempo Laminado (min)", placeholder: "15" })
  }
  if (tipo === "imp_lam_foil" || tipo === "imp_lam_foil_corte") {
    fields.push({ key: "tiempoImpresion2", label: "Tiempo 2da Impresion (min)", placeholder: "20" })
    fields.push({ key: "tiempoFoil", label: "Tiempo Foil (min)", placeholder: "15" })
  }
  if (tipo === "imp_lam_corte" || tipo === "imp_lam_foil_corte") {
    fields.push({ key: "tiempoCorte", label: "Tiempo Corte (min)", placeholder: "10" })
  }
  if (conAcabados) {
    fields.push({ key: "tiempoAcabados", label: "Tiempo Acabados (min)", placeholder: "20" })
  }

  return fields
}

/* =========================================================
   FORM COMPONENT
   ========================================================= */

interface TicketFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketFormDialog({ open, onOpenChange }: TicketFormDialogProps) {
  const [ticketPOS, setTicketPOS] = useState("")
  const [cliente, setCliente] = useState("")
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>("imp_lam")
  const [conAcabados, setConAcabados] = useState(false)
  const [tiempos, setTiempos] = useState<Record<string, string>>({})
  const [realizadoPor, setRealizadoPor] = useState("")
  const [notas, setNotas] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timeFields = getTimeFields(tipoServicio, conAcabados)
  const selectedOption = PROCESS_OPTIONS.find((o) => o.value === tipoServicio)!

  // Build the visual steps including acabados
  const displaySteps = [
    ...selectedOption.steps,
    ...(conAcabados ? [{ icon: Star, label: "Acabados" }] : []),
  ]

  function updateTiempo(key: string, val: string) {
    setTiempos((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!ticketPOS.trim()) {
      setError("El numero de ticket POS es obligatorio")
      return
    }
    if (!cliente.trim()) {
      setError("El nombre del cliente es obligatorio")
      return
    }

    // Validate all required time fields
    for (const f of timeFields) {
      const val = tiempos[f.key]
      if (!val || Number(val) <= 0) {
        setError(`${f.label.replace(" (min)", "")} debe ser mayor a 0`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      await addTicket({
        ticketPOS: ticketPOS.trim(),
        cliente: cliente.trim(),
        tipoServicio,
        conAcabados,
        tiempoImpresion: tiempos.tiempoImpresion ? Number(tiempos.tiempoImpresion) : null,
        tiempoLaminado: tiempos.tiempoLaminado ? Number(tiempos.tiempoLaminado) : null,
        tiempoImpresion2: tiempos.tiempoImpresion2 ? Number(tiempos.tiempoImpresion2) : null,
        tiempoFoil: tiempos.tiempoFoil ? Number(tiempos.tiempoFoil) : null,
        tiempoCorte: tiempos.tiempoCorte ? Number(tiempos.tiempoCorte) : null,
        tiempoAcabados: tiempos.tiempoAcabados ? Number(tiempos.tiempoAcabados) : null,
        realizadoPorImpresion: realizadoPor.trim() || undefined,
        realizadoPorLaminado: realizadoPor.trim() || undefined,
        notas: notas.trim() || undefined,
      })
      revalidateAllTickets()
      toast.success(`Ticket #${ticketPOS.trim()} creado`)

      // Reset
      setTicketPOS("")
      setCliente("")
      setTipoServicio("imp_lam")
      setConAcabados(false)
      setTiempos({})
      setRealizadoPor("")
      setNotas("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) setError("")
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Ticket</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de proceso y registra los tiempos estimados
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ticketPOS">Ticket POS *</Label>
              <Input
                id="ticketPOS"
                placeholder="Ej: 1234"
                value={ticketPOS}
                onChange={(e) => setTicketPOS(e.target.value)}
                autoFocus
                className="h-11 text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                placeholder="Ej: Juan Perez"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="h-11 text-base"
              />
            </div>
          </div>

          {/* Process type selector */}
          <div className="flex flex-col gap-2">
            <Label>Tipo de Proceso *</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROCESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTipoServicio(opt.value)
                    setTiempos({})
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all",
                    tipoServicio === opt.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted bg-background hover:border-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      tipoServicio === opt.value ? "text-primary" : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual flow preview */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Flujo del proceso</Label>
            <div className="flex items-center gap-1 flex-wrap rounded-lg bg-muted/50 p-3">
              {displaySteps.map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <ArrowRight className="size-3 text-muted-foreground shrink-0" />}
                  <div className="flex items-center gap-1 rounded-md bg-background px-2 py-1 border shadow-sm">
                    <step.icon className="size-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">{step.label}</span>
                  </div>
                </div>
              ))}
              <ArrowRight className="size-3 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 border border-green-300">
                <span className="text-xs font-medium text-green-800">Terminado</span>
              </div>
            </div>
          </div>

          {/* Acabados toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3 bg-background">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="acabados-toggle" className="font-medium cursor-pointer">
                Incluir Acabados
              </Label>
              <span className="text-xs text-muted-foreground">
                Agrega un paso final de acabados al proceso
              </span>
            </div>
            <Switch
              id="acabados-toggle"
              checked={conAcabados}
              onCheckedChange={(checked) => {
                setConAcabados(checked)
                if (!checked) {
                  setTiempos((prev) => {
                    const next = { ...prev }
                    delete next.tiempoAcabados
                    return next
                  })
                }
              }}
            />
          </div>

          {/* Time fields */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs">Tiempos estimados</Label>
            <div
              className={cn(
                "grid gap-3",
                timeFields.length <= 2 ? "grid-cols-2" : "grid-cols-3"
              )}
            >
              {timeFields.map((f) => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <Label htmlFor={f.key} className="text-xs">
                    {f.label} *
                  </Label>
                  <Input
                    id={f.key}
                    type="number"
                    min="1"
                    placeholder={f.placeholder}
                    value={tiempos[f.key] || ""}
                    onChange={(e) => updateTiempo(f.key, e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Operator and notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="realizadoPor">Operador (opcional)</Label>
              <Input
                id="realizadoPor"
                placeholder="Nombre"
                value={realizadoPor}
                onChange={(e) => setRealizadoPor(e.target.value)}
                className="h-11 text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Input
                id="notas"
                placeholder="Detalles adicionales"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="h-11 text-base"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="h-11">
              Cancelar
            </Button>
            <Button type="submit" className="h-11 gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {isSubmitting ? "Creando..." : "Crear Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* =========================================================
   EDIT DIALOG (unchanged)
   ========================================================= */

interface EditTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRealizadoPor: string
  initialNotas: string
  title: string
  onSave: (realizadoPor: string, notas: string) => void
}

export function EditTicketDialog({
  open,
  onOpenChange,
  initialRealizadoPor,
  initialNotas,
  title,
  onSave,
}: EditTicketDialogProps) {
  const [realizadoPor, setRealizadoPor] = useState(initialRealizadoPor)
  const [notas, setNotas] = useState(initialNotas)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(realizadoPor.trim(), notas.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Modifica los datos del ticket</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-realizadoPor">Realizado por</Label>
            <Input
              id="edit-realizadoPor"
              placeholder="Nombre del operador"
              value={realizadoPor}
              onChange={(e) => setRealizadoPor(e.target.value)}
              autoFocus
              className="h-11 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-notas">Notas</Label>
            <Input
              id="edit-notas"
              placeholder="Detalles adicionales"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11">
              Cancelar
            </Button>
            <Button type="submit" className="h-11">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
