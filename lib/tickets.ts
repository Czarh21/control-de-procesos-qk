import { createClient } from "@/lib/supabase/client"

/* =========================================================
   TYPES
   ========================================================= */

export type TicketEstado =
  | "en_impresion"
  | "listo_para_laminado"
  | "en_laminado"
  | "listo_para_impresion_2"
  | "en_impresion_2"
  | "listo_para_foil"
  | "en_foil"
  | "listo_para_corte"
  | "en_corte"
  | "listo_para_acabados"
  | "en_acabados"
  | "terminado"

export type TipoServicio =
  | "solo_impresion"
  | "solo_laminado"
  | "imp_lam"
  | "imp_lam_corte"
  | "imp_lam_foil"
  | "imp_lam_foil_corte"

export interface Ticket {
  id: string
  ticketPOS: string
  cliente: string
  tipoServicio: TipoServicio
  conAcabados: boolean
  estado: TicketEstado
  tiempoImpresion: number | null
  tiempoLaminado: number | null
  tiempoImpresion2: number | null
  tiempoFoil: number | null
  tiempoCorte: number | null
  tiempoAcabados: number | null
  creadoEn: string
  inicioImpresion?: string
  finImpresion?: string
  inicioLaminado?: string
  finLaminado?: string
  inicioImpresion2?: string
  finImpresion2?: string
  inicioFoil?: string
  finFoil?: string
  inicioCorte?: string
  finCorte?: string
  inicioAcabados?: string
  finAcabados?: string
  realizadoPorImpresion?: string
  realizadoPorLaminado?: string
  realizadoPorImpresion2?: string
  realizadoPorFoil?: string
  realizadoPorCorte?: string
  realizadoPorAcabados?: string
  notas?: string
}

/* =========================================================
   STATE MACHINE – defines the process flow for each tipo
   ========================================================= */

/** Get the ordered list of process steps for a given tipo + acabados */
export function getProcessSteps(
  tipo: TipoServicio,
  conAcabados: boolean
): TicketEstado[] {
  let steps: TicketEstado[] = []

  switch (tipo) {
    case "solo_impresion":
      steps = ["en_impresion"]
      break
    case "solo_laminado":
      steps = ["en_laminado"]
      break
    case "imp_lam":
      steps = ["en_impresion", "en_laminado"]
      break
    case "imp_lam_corte":
      steps = ["en_impresion", "en_laminado", "en_corte"]
      break
    case "imp_lam_foil":
      steps = ["en_impresion", "en_laminado", "en_impresion_2", "en_foil"]
      break
    case "imp_lam_foil_corte":
      steps = [
        "en_impresion",
        "en_laminado",
        "en_impresion_2",
        "en_foil",
        "en_corte",
      ]
      break
  }

  if (conAcabados) {
    steps.push("en_acabados")
  }

  steps.push("terminado")
  return steps
}

/** The "listo_para_X" state that precedes an "en_X" state */
const LISTO_PARA_MAP: Record<string, TicketEstado> = {
  en_laminado: "listo_para_laminado",
  en_impresion_2: "listo_para_impresion_2",
  en_foil: "listo_para_foil",
  en_corte: "listo_para_corte",
  en_acabados: "listo_para_acabados",
}

/**
 * Given the current "en_X" state, returns the next state in the flow.
 * If the next step is another "en_X", returns the "listo_para_X" intermediary.
 * If the next step is "terminado", returns "terminado" directly.
 */
export function getNextEstado(
  tipo: TipoServicio,
  conAcabados: boolean,
  currentEstado: TicketEstado
): TicketEstado {
  const steps = getProcessSteps(tipo, conAcabados)
  const idx = steps.indexOf(currentEstado)

  // If not found or already last step, return terminado
  if (idx === -1 || idx >= steps.length - 1) return "terminado"

  const nextStep = steps[idx + 1]

  // If next is "terminado", go directly
  if (nextStep === "terminado") return "terminado"

  // Otherwise return the "listo_para" intermediary
  return LISTO_PARA_MAP[nextStep] || "terminado"
}

/**
 * Get the "en_X" state from a "listo_para_X" state
 */
export function getEnEstadoFromListo(listoEstado: TicketEstado): TicketEstado {
  switch (listoEstado) {
    case "listo_para_laminado":
      return "en_laminado"
    case "listo_para_impresion_2":
      return "en_impresion_2"
    case "listo_para_foil":
      return "en_foil"
    case "listo_para_corte":
      return "en_corte"
    case "listo_para_acabados":
      return "en_acabados"
    default:
      return listoEstado
  }
}

/* =========================================================
   LABELS
   ========================================================= */

export function tipoServicioLabel(tipo: TipoServicio): string {
  switch (tipo) {
    case "solo_impresion":
      return "Solo Impresi\u00f3n"
    case "solo_laminado":
      return "Solo Laminado"
    case "imp_lam":
      return "Impresi\u00f3n + Laminado"
    case "imp_lam_corte":
      return "Impresi\u00f3n + Laminado + Corte"
    case "imp_lam_foil":
      return "Impresi\u00f3n + Laminado + Foil"
    case "imp_lam_foil_corte":
      return "Impresi\u00f3n + Laminado + Foil + Corte"
  }
}

export function estadoLabel(estado: TicketEstado): string {
  switch (estado) {
    case "en_impresion":
      return "En Impresi\u00f3n"
    case "listo_para_laminado":
      return "Listo para Laminado"
    case "en_laminado":
      return "En Laminado"
    case "listo_para_impresion_2":
      return "Listo para 2da Impresi\u00f3n"
    case "en_impresion_2":
      return "En 2da Impresi\u00f3n"
    case "listo_para_foil":
      return "Listo para Foil"
    case "en_foil":
      return "En Foil"
    case "listo_para_corte":
      return "Listo para Corte"
    case "en_corte":
      return "En Corte"
    case "listo_para_acabados":
      return "Listo para Acabados"
    case "en_acabados":
      return "En Acabados"
    case "terminado":
      return "Terminado"
  }
}

export function estadoColor(estado: TicketEstado): string {
  switch (estado) {
    case "en_impresion":
    case "en_impresion_2":
      return "bg-blue-100 text-blue-800"
    case "listo_para_laminado":
    case "listo_para_impresion_2":
    case "listo_para_foil":
    case "listo_para_corte":
    case "listo_para_acabados":
      return "bg-amber-100 text-amber-800"
    case "en_laminado":
    case "en_foil":
      return "bg-purple-100 text-purple-800"
    case "en_corte":
      return "bg-orange-100 text-orange-800"
    case "en_acabados":
      return "bg-teal-100 text-teal-800"
    case "terminado":
      return "bg-green-100 text-green-800"
  }
}

/* =========================================================
   DB HELPERS
   ========================================================= */

function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as string,
    ticketPOS: row.ticket_pos as string,
    cliente: row.cliente as string,
    tipoServicio: (row.tipo_servicio as TipoServicio) ?? "imp_lam",
    conAcabados: (row.con_acabados as boolean) ?? false,
    estado: row.estado as TicketEstado,
    tiempoImpresion: row.tiempo_impresion != null ? (row.tiempo_impresion as number) : null,
    tiempoLaminado: row.tiempo_laminado != null ? (row.tiempo_laminado as number) : null,
    tiempoImpresion2: row.tiempo_impresion_2 != null ? (row.tiempo_impresion_2 as number) : null,
    tiempoFoil: row.tiempo_foil != null ? (row.tiempo_foil as number) : null,
    tiempoCorte: row.tiempo_corte != null ? (row.tiempo_corte as number) : null,
    tiempoAcabados: row.tiempo_acabados != null ? (row.tiempo_acabados as number) : null,
    creadoEn: row.creado_en as string,
    inicioImpresion: (row.inicio_impresion as string) || undefined,
    finImpresion: (row.fin_impresion as string) || undefined,
    inicioLaminado: (row.inicio_laminado as string) || undefined,
    finLaminado: (row.fin_laminado as string) || undefined,
    inicioImpresion2: (row.inicio_impresion_2 as string) || undefined,
    finImpresion2: (row.fin_impresion_2 as string) || undefined,
    inicioFoil: (row.inicio_foil as string) || undefined,
    finFoil: (row.fin_foil as string) || undefined,
    inicioCorte: (row.inicio_corte as string) || undefined,
    finCorte: (row.fin_corte as string) || undefined,
    inicioAcabados: (row.inicio_acabados as string) || undefined,
    finAcabados: (row.fin_acabados as string) || undefined,
    realizadoPorImpresion: (row.realizado_por_impresion as string) || undefined,
    realizadoPorLaminado: (row.realizado_por_laminado as string) || undefined,
    realizadoPorImpresion2: (row.realizado_por_impresion_2 as string) || undefined,
    realizadoPorFoil: (row.realizado_por_foil as string) || undefined,
    realizadoPorCorte: (row.realizado_por_corte as string) || undefined,
    realizadoPorAcabados: (row.realizado_por_acabados as string) || undefined,
    notas: (row.notas as string) || undefined,
  }
}

/* =========================================================
   CRUD
   ========================================================= */

export async function getTickets(): Promise<Ticket[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("creado_en", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error.message)
    return []
  }
  return (data ?? []).map(rowToTicket)
}

export async function getTicketsByEstado(estados: TicketEstado[]): Promise<Ticket[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .in("estado", estados)
    .order("creado_en", { ascending: false })

  if (error) {
    console.error("Error fetching tickets by estado:", error.message)
    return []
  }
  return (data ?? []).map(rowToTicket)
}

export interface AddTicketData {
  ticketPOS: string
  cliente: string
  tipoServicio: TipoServicio
  conAcabados: boolean
  tiempoImpresion: number | null
  tiempoLaminado: number | null
  tiempoImpresion2: number | null
  tiempoFoil: number | null
  tiempoCorte: number | null
  tiempoAcabados: number | null
  realizadoPorImpresion?: string
  realizadoPorLaminado?: string
  notas?: string
}

export async function addTicket(ticketData: AddTicketData): Promise<Ticket> {
  const supabase = createClient()
  const now = new Date().toISOString()
  const tipo = ticketData.tipoServicio

  // Determine initial state
  let estadoInicial: TicketEstado
  if (tipo === "solo_laminado") {
    estadoInicial = "en_laminado"
  } else {
    estadoInicial = "en_impresion"
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      ticket_pos: ticketData.ticketPOS,
      cliente: ticketData.cliente,
      tipo_servicio: tipo,
      con_acabados: ticketData.conAcabados,
      estado: estadoInicial,
      tiempo_impresion: ticketData.tiempoImpresion,
      tiempo_laminado: ticketData.tiempoLaminado,
      tiempo_impresion_2: ticketData.tiempoImpresion2,
      tiempo_foil: ticketData.tiempoFoil,
      tiempo_corte: ticketData.tiempoCorte,
      tiempo_acabados: ticketData.tiempoAcabados,
      creado_en: now,
      inicio_impresion: tipo !== "solo_laminado" ? now : null,
      inicio_laminado: tipo === "solo_laminado" ? now : null,
      realizado_por_impresion:
        tipo !== "solo_laminado" ? (ticketData.realizadoPorImpresion || null) : null,
      realizado_por_laminado:
        tipo === "solo_laminado" ? (ticketData.realizadoPorLaminado || null) : null,
      notas: ticketData.notas || null,
    })
    .select()
    .single()

  if (error) throw new Error(`Error creating ticket: ${error.message}`)
  return rowToTicket(data)
}

export async function updateTicket(
  id: string,
  updates: Partial<Omit<Ticket, "id">>
): Promise<Ticket | null> {
  const supabase = createClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.ticketPOS !== undefined) dbUpdates.ticket_pos = updates.ticketPOS
  if (updates.cliente !== undefined) dbUpdates.cliente = updates.cliente
  if (updates.tipoServicio !== undefined) dbUpdates.tipo_servicio = updates.tipoServicio
  if (updates.conAcabados !== undefined) dbUpdates.con_acabados = updates.conAcabados
  if (updates.tiempoImpresion !== undefined) dbUpdates.tiempo_impresion = updates.tiempoImpresion
  if (updates.tiempoLaminado !== undefined) dbUpdates.tiempo_laminado = updates.tiempoLaminado
  if (updates.tiempoImpresion2 !== undefined) dbUpdates.tiempo_impresion_2 = updates.tiempoImpresion2
  if (updates.tiempoFoil !== undefined) dbUpdates.tiempo_foil = updates.tiempoFoil
  if (updates.tiempoCorte !== undefined) dbUpdates.tiempo_corte = updates.tiempoCorte
  if (updates.tiempoAcabados !== undefined) dbUpdates.tiempo_acabados = updates.tiempoAcabados
  if (updates.estado !== undefined) dbUpdates.estado = updates.estado
  if (updates.inicioImpresion !== undefined) dbUpdates.inicio_impresion = updates.inicioImpresion
  if (updates.finImpresion !== undefined) dbUpdates.fin_impresion = updates.finImpresion
  if (updates.inicioLaminado !== undefined) dbUpdates.inicio_laminado = updates.inicioLaminado
  if (updates.finLaminado !== undefined) dbUpdates.fin_laminado = updates.finLaminado
  if (updates.inicioImpresion2 !== undefined) dbUpdates.inicio_impresion_2 = updates.inicioImpresion2
  if (updates.finImpresion2 !== undefined) dbUpdates.fin_impresion_2 = updates.finImpresion2
  if (updates.inicioFoil !== undefined) dbUpdates.inicio_foil = updates.inicioFoil
  if (updates.finFoil !== undefined) dbUpdates.fin_foil = updates.finFoil
  if (updates.inicioCorte !== undefined) dbUpdates.inicio_corte = updates.inicioCorte
  if (updates.finCorte !== undefined) dbUpdates.fin_corte = updates.finCorte
  if (updates.inicioAcabados !== undefined) dbUpdates.inicio_acabados = updates.inicioAcabados
  if (updates.finAcabados !== undefined) dbUpdates.fin_acabados = updates.finAcabados
  if (updates.realizadoPorImpresion !== undefined)
    dbUpdates.realizado_por_impresion = updates.realizadoPorImpresion
  if (updates.realizadoPorLaminado !== undefined)
    dbUpdates.realizado_por_laminado = updates.realizadoPorLaminado
  if (updates.realizadoPorImpresion2 !== undefined)
    dbUpdates.realizado_por_impresion_2 = updates.realizadoPorImpresion2
  if (updates.realizadoPorFoil !== undefined)
    dbUpdates.realizado_por_foil = updates.realizadoPorFoil
  if (updates.realizadoPorCorte !== undefined)
    dbUpdates.realizado_por_corte = updates.realizadoPorCorte
  if (updates.realizadoPorAcabados !== undefined)
    dbUpdates.realizado_por_acabados = updates.realizadoPorAcabados
  if (updates.notas !== undefined) dbUpdates.notas = updates.notas

  const { data, error } = await supabase
    .from("tickets")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating ticket:", error.message)
    return null
  }
  return rowToTicket(data)
}

/* =========================================================
   PROCESS TRANSITION HELPERS
   ========================================================= */

/** Finish the current "en_X" step and move to the next state */
export async function terminarPaso(ticket: Ticket): Promise<Ticket | null> {
  const now = new Date().toISOString()
  const nextEstado = getNextEstado(ticket.tipoServicio, ticket.conAcabados, ticket.estado)

  const updates: Partial<Omit<Ticket, "id">> = { estado: nextEstado }

  // Set the fin timestamp for the current step
  switch (ticket.estado) {
    case "en_impresion":
      updates.finImpresion = now
      break
    case "en_laminado":
      updates.finLaminado = now
      break
    case "en_impresion_2":
      updates.finImpresion2 = now
      break
    case "en_foil":
      updates.finFoil = now
      break
    case "en_corte":
      updates.finCorte = now
      break
    case "en_acabados":
      updates.finAcabados = now
      break
  }

  return updateTicket(ticket.id, updates)
}

/** Start a step from a "listo_para_X" state */
export async function iniciarPaso(
  ticket: Ticket,
  realizadoPor?: string
): Promise<Ticket | null> {
  const now = new Date().toISOString()
  const enEstado = getEnEstadoFromListo(ticket.estado)

  const updates: Partial<Omit<Ticket, "id">> = { estado: enEstado }

  switch (enEstado) {
    case "en_laminado":
      updates.inicioLaminado = now
      if (realizadoPor) updates.realizadoPorLaminado = realizadoPor
      break
    case "en_impresion_2":
      updates.inicioImpresion2 = now
      if (realizadoPor) updates.realizadoPorImpresion2 = realizadoPor
      break
    case "en_foil":
      updates.inicioFoil = now
      if (realizadoPor) updates.realizadoPorFoil = realizadoPor
      break
    case "en_corte":
      updates.inicioCorte = now
      if (realizadoPor) updates.realizadoPorCorte = realizadoPor
      break
    case "en_acabados":
      updates.inicioAcabados = now
      if (realizadoPor) updates.realizadoPorAcabados = realizadoPor
      break
  }

  return updateTicket(ticket.id, updates)
}

export async function deleteTicket(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("tickets").delete().eq("id", id)
  if (error) {
    console.error("Error deleting ticket:", error.message)
    return false
  }
  return true
}

/* =========================================================
   PROCESS STEP HELPERS (for UI)
   ========================================================= */

export interface ProcessStep {
  key: string
  label: string
  tiempoEstimado: number | null
  inicio?: string
  fin?: string
  realizadoPor?: string
  estado: "completado" | "en_progreso" | "pendiente" | "no_aplica"
}

/** Get a display-friendly list of process steps for a ticket */
export function getTicketProcessSteps(ticket: Ticket): ProcessStep[] {
  const allSteps: ProcessStep[] = []
  const tipo = ticket.tipoServicio
  const hasImpresion = tipo !== "solo_laminado"
  const hasLaminado = tipo !== "solo_impresion"
  const hasImpresion2 = tipo === "imp_lam_foil" || tipo === "imp_lam_foil_corte"
  const hasFoil = tipo === "imp_lam_foil" || tipo === "imp_lam_foil_corte"
  const hasCorte = tipo === "imp_lam_corte" || tipo === "imp_lam_foil_corte"
  const hasAcabados = ticket.conAcabados

  if (hasImpresion) {
    allSteps.push({
      key: "impresion",
      label: "Impresi\u00f3n",
      tiempoEstimado: ticket.tiempoImpresion,
      inicio: ticket.inicioImpresion,
      fin: ticket.finImpresion,
      realizadoPor: ticket.realizadoPorImpresion,
      estado: ticket.finImpresion
        ? "completado"
        : ticket.inicioImpresion
          ? "en_progreso"
          : "pendiente",
    })
  }

  if (hasLaminado) {
    allSteps.push({
      key: "laminado",
      label: "Laminado",
      tiempoEstimado: ticket.tiempoLaminado,
      inicio: ticket.inicioLaminado,
      fin: ticket.finLaminado,
      realizadoPor: ticket.realizadoPorLaminado,
      estado: ticket.finLaminado
        ? "completado"
        : ticket.inicioLaminado
          ? "en_progreso"
          : "pendiente",
    })
  }

  if (hasImpresion2) {
    allSteps.push({
      key: "impresion_2",
      label: "2da Impresi\u00f3n",
      tiempoEstimado: ticket.tiempoImpresion2,
      inicio: ticket.inicioImpresion2,
      fin: ticket.finImpresion2,
      realizadoPor: ticket.realizadoPorImpresion2,
      estado: ticket.finImpresion2
        ? "completado"
        : ticket.inicioImpresion2
          ? "en_progreso"
          : "pendiente",
    })
  }

  if (hasFoil) {
    allSteps.push({
      key: "foil",
      label: "Foil",
      tiempoEstimado: ticket.tiempoFoil,
      inicio: ticket.inicioFoil,
      fin: ticket.finFoil,
      realizadoPor: ticket.realizadoPorFoil,
      estado: ticket.finFoil
        ? "completado"
        : ticket.inicioFoil
          ? "en_progreso"
          : "pendiente",
    })
  }

  if (hasCorte) {
    allSteps.push({
      key: "corte",
      label: "Corte",
      tiempoEstimado: ticket.tiempoCorte,
      inicio: ticket.inicioCorte,
      fin: ticket.finCorte,
      realizadoPor: ticket.realizadoPorCorte,
      estado: ticket.finCorte
        ? "completado"
        : ticket.inicioCorte
          ? "en_progreso"
          : "pendiente",
    })
  }

  if (hasAcabados) {
    allSteps.push({
      key: "acabados",
      label: "Acabados",
      tiempoEstimado: ticket.tiempoAcabados,
      inicio: ticket.inicioAcabados,
      fin: ticket.finAcabados,
      realizadoPor: ticket.realizadoPorAcabados,
      estado: ticket.finAcabados
        ? "completado"
        : ticket.inicioAcabados
          ? "en_progreso"
          : "pendiente",
    })
  }

  return allSteps
}

/** Get the active time and estimated time for the current step of a ticket */
export function getCurrentStepInfo(ticket: Ticket): {
  startTime?: string
  estimatedMinutes: number | null
  stepLabel: string
} {
  switch (ticket.estado) {
    case "en_impresion":
      return {
        startTime: ticket.inicioImpresion,
        estimatedMinutes: ticket.tiempoImpresion,
        stepLabel: "Impresi\u00f3n",
      }
    case "en_laminado":
      return {
        startTime: ticket.inicioLaminado,
        estimatedMinutes: ticket.tiempoLaminado,
        stepLabel: "Laminado",
      }
    case "en_impresion_2":
      return {
        startTime: ticket.inicioImpresion2,
        estimatedMinutes: ticket.tiempoImpresion2,
        stepLabel: "2da Impresi\u00f3n",
      }
    case "en_foil":
      return {
        startTime: ticket.inicioFoil,
        estimatedMinutes: ticket.tiempoFoil,
        stepLabel: "Foil",
      }
    case "en_corte":
      return {
        startTime: ticket.inicioCorte,
        estimatedMinutes: ticket.tiempoCorte,
        stepLabel: "Corte",
      }
    case "en_acabados":
      return {
        startTime: ticket.inicioAcabados,
        estimatedMinutes: ticket.tiempoAcabados,
        stepLabel: "Acabados",
      }
    default:
      return { estimatedMinutes: null, stepLabel: "" }
  }
}
