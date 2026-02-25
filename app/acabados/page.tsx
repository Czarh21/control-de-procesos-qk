"use client"

import { useState } from "react"
import Link from "next/link"
import { useTickets, revalidateAllTickets } from "@/hooks/use-tickets"
import { iniciarPaso, terminarPaso, updateTicket } from "@/lib/tickets"
import { TicketCard } from "@/components/ticket-card"
import { EditTicketDialog } from "@/components/ticket-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Pencil,
  ChevronDown,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Ticket, TicketEstado } from "@/lib/tickets"

const FILTER_LISTO: TicketEstado[] = ["listo_para_acabados"]
const FILTER_EN_ACABADOS: TicketEstado[] = ["en_acabados"]

export default function AcabadosPage() {
  const { tickets: listoAcabados } = useTickets(FILTER_LISTO)
  const { tickets: enAcabados } = useTickets(FILTER_EN_ACABADOS)
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [operadorInputs, setOperadorInputs] = useState<Record<string, string>>({})
  const [historialOpen, setHistorialOpen] = useState(false)

  const totalCount = listoAcabados.length + enAcabados.length

  async function handleIniciar(ticket: Ticket) {
    const operador = operadorInputs[ticket.id]?.trim() || ""
    await iniciarPaso(ticket, operador || undefined)
    revalidateAllTickets()
    toast.success(`Ticket #${ticket.ticketPOS} - Acabados iniciado`)
    setOperadorInputs((prev) => {
      const next = { ...prev }
      delete next[ticket.id]
      return next
    })
  }

  async function handleTerminar(ticket: Ticket) {
    await terminarPaso(ticket)
    revalidateAllTickets()
    toast.success(`Ticket #${ticket.ticketPOS} - Terminado`)
  }

  async function handleEditSave(realizadoPor: string, notas: string) {
    if (!editTicket) return
    await updateTicket(editTicket.id, {
      realizadoPorAcabados: realizadoPor || undefined,
      notas: notas || undefined,
    })
    revalidateAllTickets()
    toast.success(`Ticket #${editTicket.ticketPOS} actualizado`)
    setEditTicket(null)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-teal-50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="size-9">
                <ArrowLeft className="size-4" />
                <span className="sr-only">Volver al inicio</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Acabados</h1>
              {totalCount > 0 && (
                <Badge className="bg-teal-500 text-white border-none text-sm">
                  {totalCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {listoAcabados.length > 0 && (
              <Badge variant="outline" className="border-amber-400 text-amber-700">
                {listoAcabados.length} por recibir
              </Badge>
            )}
            {enAcabados.length > 0 && (
              <Badge variant="outline" className="border-teal-400 text-teal-700">
                {enAcabados.length} en proceso
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        {/* Pending */}
        {listoAcabados.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Pendientes por recibir ({listoAcabados.length})
            </h2>
            {listoAcabados.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
                  <div className="flex w-full flex-col gap-2">
                    <Input
                      placeholder="Operador (opcional)"
                      value={operadorInputs[ticket.id] || ""}
                      onChange={(e) =>
                        setOperadorInputs((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      className="h-11 text-base"
                    />
                    <Button
                      onClick={() => handleIniciar(ticket)}
                      className="h-12 w-full gap-2 bg-teal-600 text-white hover:bg-teal-700 text-base"
                    >
                      <Play className="size-5" />
                      Iniciar Acabados
                    </Button>
                  </div>
                }
              />
            ))}
          </section>
        )}

        {/* In progress */}
        {enAcabados.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              En Acabados ({enAcabados.length})
            </h2>
            {enAcabados.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showProcessSteps
                actions={
                  <>
                    <Button
                      onClick={() => handleTerminar(ticket)}
                      className="h-12 flex-1 gap-2 bg-green-600 text-white hover:bg-green-700 text-base"
                    >
                      <CheckCircle2 className="size-5" />
                      Marcar Terminado
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-12"
                      onClick={() => setEditTicket(ticket)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  </>
                }
              />
            ))}
          </section>
        )}

        {/* Empty */}
        {totalCount === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Star className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No hay tickets en acabados</p>
            <p className="text-muted-foreground text-sm">
              Los tickets con acabados habilitado apareceran aqui como ultimo paso
            </p>
          </div>
        )}

        <Collapsible open={historialOpen} onOpenChange={setHistorialOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
              <span>Historial</span>
              <ChevronDown className={cn("size-4 transition-transform", historialOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 text-sm text-muted-foreground text-center">
            Consulta el historial completo en la seccion de Consulta.
          </CollapsibleContent>
        </Collapsible>
      </main>

      {editTicket && (
        <EditTicketDialog
          open={!!editTicket}
          onOpenChange={(open) => { if (!open) setEditTicket(null) }}
          initialRealizadoPor={editTicket.realizadoPorAcabados || ""}
          initialNotas={editTicket.notas || ""}
          title={`Editar Ticket #${editTicket.ticketPOS}`}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
