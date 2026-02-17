"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import {
  getTickets,
  getTicketsByEstado,
  type Ticket,
  type TicketEstado,
} from "@/lib/tickets"

/** Revalidate all SWR ticket keys so every component refreshes */
export function revalidateAllTickets() {
  globalMutate((key: string) => typeof key === "string" && key.startsWith("tickets-"))
}

export function useTickets(filterEstados?: TicketEstado[]) {
  const key = filterEstados
    ? `tickets-${filterEstados.slice().sort().join(",")}`
    : "tickets-all"

  const fetcher = async () => {
    if (filterEstados && filterEstados.length > 0) {
      return getTicketsByEstado(filterEstados)
    }
    return getTickets()
  }

  const { data, mutate, isLoading } = useSWR<Ticket[]>(key, fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
    fallbackData: [],
  })

  const tickets = data ?? []

  const refresh = () => mutate()

  return { tickets, refresh, isLoading }
}

export function useElapsedTime(startTime?: string) {
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    if (!startTime) {
      setElapsed("--:--")
      return
    }

    const update = () => {
      const start = new Date(startTime).getTime()
      const now = Date.now()
      const diffMs = now - start
      const totalMinutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const seconds = Math.floor((diffMs % 60000) / 1000)

      if (hours > 0) {
        setElapsed(
          `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
        )
      } else {
        setElapsed(
          `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
        )
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return elapsed
}

export function isOverdue(
  startTime: string | undefined,
  estimatedMinutes: number
): boolean {
  if (!startTime) return false
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const diffMinutes = (now - start) / 60000
  return diffMinutes > estimatedMinutes
}
