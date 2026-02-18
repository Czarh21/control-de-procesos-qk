import { createClient } from "@/lib/supabase/client"

export type TicketEstado =
  | "en_impresion"
  | "listo_para_laminado"
  | "en_laminado"
  | "terminado"

export type TipoServicio = "solo_impresion" | "solo_laminado" | "ambos"

export interface Ticket {
  id: string
  ticketPOS: string
  cliente: string
  tipoServicio: TipoServicio
  tiempoImpresion: number | null // minutos – null when solo_laminado
  tiempoLaminado: number | null // minutos – null when solo_impresion
  estado: TicketEstado
  creadoEn: string
  inicioImpresion?: string
  finImpresion?: string
  inicioLaminado?: string
  finLaminado?: string
  realizadoPorImpresion?: string
  realizadoPorLaminado?: string
  notas?: string
}

/* ---------- helpers ---------- */

// Map DB row (snake_case) → app Ticket (camelCase)
function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as string,
    ticketPOS: row.ticket_pos as string,
    cliente: row.cliente as string,
    tipoServicio: (row.tipo_servicio as TipoServicio) ?? "ambos",
    tiempoImpresion: row.tiempo_impresion != null ? (row.tiempo_impresion as number) : null,
    tiempoLaminado: row.tiempo_laminado != null ? (row.tiempo_laminado as number) : null,
    estado: row.estado as TicketEstado,
    creadoEn: row.creado_en as string,
    inicioImpresion: (row.inicio_impresion as string) || undefined,
    finImpresion: (row.fin_impresion as string) || undefined,
    inicioLaminado: (row.inicio_laminado as string) || undefined,
    finLaminado: (row.fin_laminado as string) || undefined,
    realizadoPorImpresion: (row.realizado_por_impresion as string) || undefined,
    realizadoPorLaminado: (row.realizado_por_laminado as string) || undefined,
    notas: (row.notas as string) || undefined,
  }
}

/* ---------- CRUD ---------- */

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

export async function addTicket(
  ticketData: Pick<
    Ticket,
    | "ticketPOS"
    | "cliente"
    | "tipoServicio"
    | "tiempoImpresion"
    | "tiempoLaminado"
    | "realizadoPorImpresion"
    | "realizadoPorLaminado"
    | "notas"
  >
): Promise<Ticket> {
  const supabase = createClient()
  const now = new Date().toISOString()
  const tipo = ticketData.tipoServicio ?? "ambos"

  // Determine initial state based on service type
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
      tiempo_impresion: tipo === "solo_laminado" ? null : ticketData.tiempoImpresion,
      tiempo_laminado: tipo === "solo_impresion" ? null : ticketData.tiempoLaminado,
      estado: estadoInicial,
      creado_en: now,
      // Set timestamps based on the service type
      inicio_impresion: tipo !== "solo_laminado" ? now : null,
      inicio_laminado: tipo === "solo_laminado" ? now : null,
      realizado_por_impresion: tipo !== "solo_laminado" ? (ticketData.realizadoPorImpresion || null) : null,
      realizado_por_laminado: tipo === "solo_laminado" ? (ticketData.realizadoPorLaminado || null) : null,
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

  // Map camelCase updates → snake_case for DB
  const dbUpdates: Record<string, unknown> = {}
  if (updates.ticketPOS !== undefined) dbUpdates.ticket_pos = updates.ticketPOS
  if (updates.cliente !== undefined) dbUpdates.cliente = updates.cliente
  if (updates.tipoServicio !== undefined) dbUpdates.tipo_servicio = updates.tipoServicio
  if (updates.tiempoImpresion !== undefined) dbUpdates.tiempo_impresion = updates.tiempoImpresion
  if (updates.tiempoLaminado !== undefined) dbUpdates.tiempo_laminado = updates.tiempoLaminado
  if (updates.estado !== undefined) dbUpdates.estado = updates.estado
  if (updates.inicioImpresion !== undefined) dbUpdates.inicio_impresion = updates.inicioImpresion
  if (updates.finImpresion !== undefined) dbUpdates.fin_impresion = updates.finImpresion
  if (updates.inicioLaminado !== undefined) dbUpdates.inicio_laminado = updates.inicioLaminado
  if (updates.finLaminado !== undefined) dbUpdates.fin_laminado = updates.finLaminado
  if (updates.realizadoPorImpresion !== undefined)
    dbUpdates.realizado_por_impresion = updates.realizadoPorImpresion
  if (updates.realizadoPorLaminado !== undefined)
    dbUpdates.realizado_por_laminado = updates.realizadoPorLaminado
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

/**
 * When printing finishes:
 * - solo_impresion → terminado (skip laminating entirely)
 * - ambos → listo_para_laminado (move to laminating queue)
 */
export async function terminarImpresion(id: string, tipoServicio: TipoServicio): Promise<Ticket | null> {
  const now = new Date().toISOString()
  if (tipoServicio === "solo_impresion") {
    return updateTicket(id, {
      estado: "terminado",
      finImpresion: now,
    })
  }
  return updateTicket(id, {
    estado: "listo_para_laminado",
    finImpresion: now,
  })
}

export async function iniciarLaminado(
  id: string,
  realizadoPor?: string
): Promise<Ticket | null> {
  return updateTicket(id, {
    estado: "en_laminado",
    inicioLaminado: new Date().toISOString(),
    realizadoPorLaminado: realizadoPor || undefined,
  })
}

export async function terminarLaminado(id: string): Promise<Ticket | null> {
  return updateTicket(id, {
    estado: "terminado",
    finLaminado: new Date().toISOString(),
  })
}

/** Helper: determine a human-readable label for the service type */
export function tipoServicioLabel(tipo: TipoServicio): string {
  switch (tipo) {
    case "solo_impresion":
      return "Solo Impresi\u00f3n"
    case "solo_laminado":
      return "Solo Laminado"
    case "ambos":
      return "Impresi\u00f3n + Laminado"
  }
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
