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
import { addTicket, type TipoServicio } from "@/lib/tickets"
import { revalidateAllTickets } from "@/hooks/use-tickets"
import { Plus, Loader2, Printer, Layers, SquareStack } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TicketFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketFormDialog({ open, onOpenChange }: TicketFormDialogProps) {
  const [ticketPOS, setTicketPOS] = useState("")
  const [cliente, setCliente] = useState("")
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>("ambos")
  const [tiempoImpresion, setTiempoImpresion] = useState("")
  const [tiempoLaminado, setTiempoLaminado] = useState("")
  const [realizadoPor, setRealizadoPor] = useState("")
  const [notas, setNotas] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsImpresion = tipoServicio !== "solo_laminado"
  const needsLaminado = tipoServicio !== "solo_impresion"

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
    if (needsImpresion && (!tiempoImpresion || Number(tiempoImpresion) <= 0)) {
      setError("El tiempo de impresion debe ser mayor a 0")
      return
    }
    if (needsLaminado && (!tiempoLaminado || Number(tiempoLaminado) <= 0)) {
      setError("El tiempo de laminado debe ser mayor a 0")
      return
    }

    setIsSubmitting(true)
    try {
      await addTicket({
        ticketPOS: ticketPOS.trim(),
        cliente: cliente.trim(),
        tipoServicio,
        tiempoImpresion: needsImpresion ? Number(tiempoImpresion) : null,
        tiempoLaminado: needsLaminado ? Number(tiempoLaminado) : null,
        realizadoPorImpresion: realizadoPor.trim() || undefined,
        realizadoPorLaminado: realizadoPor.trim() || undefined,
        notas: notas.trim() || undefined,
      })
      revalidateAllTickets()
      toast.success(`Ticket #${ticketPOS.trim()} creado`)

      // Reset form
      setTicketPOS("")
      setCliente("")
      setTipoServicio("ambos")
      setTiempoImpresion("")
      setTiempoLaminado("")
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
    if (!newOpen) {
      setError("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Ticket</DialogTitle>
          <DialogDescription>
            Registra un nuevo trabajo de impresion y/o laminado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticketPOS">
              Numero de Ticket POS *
            </Label>
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
            <Label htmlFor="cliente">
              Nombre del Cliente *
            </Label>
            <Input
              id="cliente"
              placeholder="Ej: Juan Perez"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="h-11 text-base"
            />
          </div>

          {/* Service type selector */}
          <div className="flex flex-col gap-2">
            <Label>Tipo de Servicio *</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "ambos", label: "Ambos", icon: SquareStack },
                { value: "solo_impresion", label: "Solo Imprimir", icon: Printer },
                { value: "solo_laminado", label: "Solo Laminar", icon: Layers },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTipoServicio(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition-colors",
                    tipoServicio === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-muted bg-background text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Time fields - shown conditionally based on service type */}
          <div className={cn("grid gap-3", needsImpresion && needsLaminado ? "grid-cols-2" : "grid-cols-1")}>
            {needsImpresion && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="tiempoImpresion">
                  Tiempo Impresion (min) *
                </Label>
                <Input
                  id="tiempoImpresion"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={tiempoImpresion}
                  onChange={(e) => setTiempoImpresion(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
            )}
            {needsLaminado && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="tiempoLaminado">
                  Tiempo Laminado (min) *
                </Label>
                <Input
                  id="tiempoLaminado"
                  type="number"
                  min="1"
                  placeholder="15"
                  value={tiempoLaminado}
                  onChange={(e) => setTiempoLaminado(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="realizadoPor">
              Realizado por (opcional)
            </Label>
            <Input
              id="realizadoPor"
              placeholder="Nombre del operador"
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

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-11"
            >
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

// Edit dialog for updating ticket fields
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
          <DialogDescription>
            Modifica los datos del ticket
          </DialogDescription>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
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
