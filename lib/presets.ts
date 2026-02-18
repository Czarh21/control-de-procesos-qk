import type { TipoPaso } from "@/lib/tickets"
import {
  Printer,
  Layers,
  Scissors,
  Sparkles,
  SquareStack,
  type LucideIcon,
} from "lucide-react"

export interface StepTemplate {
  tipo: TipoPaso
  label: string
  defaultMinutes: number
}

export interface PresetWorkflow {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string // tailwind text color class
  bgColor: string // tailwind bg color class for selected state
  steps: StepTemplate[]
}

export const WORKFLOW_PRESETS: PresetWorkflow[] = [
  {
    id: "impresion_laminado",
    label: "Imprimir + Laminar",
    description: "El proceso mas comun",
    icon: SquareStack,
    color: "text-sky-600",
    bgColor: "bg-sky-50 border-sky-500",
    steps: [
      { tipo: "impresion", label: "Impresion", defaultMinutes: 30 },
      { tipo: "laminado", label: "Laminado", defaultMinutes: 15 },
    ],
  },
  {
    id: "impresion_laminado_corte",
    label: "Imprimir + Laminar + Corte",
    description: "Con corte al final",
    icon: Scissors,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-500",
    steps: [
      { tipo: "impresion", label: "Impresion", defaultMinutes: 30 },
      { tipo: "laminado", label: "Laminado", defaultMinutes: 15 },
      { tipo: "corte", label: "Corte", defaultMinutes: 10 },
    ],
  },
  {
    id: "foil",
    label: "Foil",
    description: "Imp + Lam + Re-Imp + Foil",
    icon: Sparkles,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-500",
    steps: [
      { tipo: "impresion", label: "Impresion", defaultMinutes: 30 },
      { tipo: "laminado", label: "Laminado", defaultMinutes: 15 },
      { tipo: "reimprimir", label: "Re-Impresion", defaultMinutes: 20 },
      { tipo: "foil", label: "Foil", defaultMinutes: 15 },
    ],
  },
  {
    id: "foil_corte",
    label: "Foil + Corte",
    description: "Proceso foil completo con corte",
    icon: Sparkles,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-500",
    steps: [
      { tipo: "impresion", label: "Impresion", defaultMinutes: 30 },
      { tipo: "laminado", label: "Laminado", defaultMinutes: 15 },
      { tipo: "reimprimir", label: "Re-Impresion", defaultMinutes: 20 },
      { tipo: "foil", label: "Foil", defaultMinutes: 15 },
      { tipo: "corte", label: "Corte", defaultMinutes: 10 },
    ],
  },
  {
    id: "solo_impresion",
    label: "Solo Imprimir",
    description: "Unicamente impresion",
    icon: Printer,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-500",
    steps: [
      { tipo: "impresion", label: "Impresion", defaultMinutes: 30 },
    ],
  },
  {
    id: "solo_laminado",
    label: "Solo Laminar",
    description: "Unicamente laminado",
    icon: Layers,
    color: "text-violet-600",
    bgColor: "bg-violet-50 border-violet-500",
    steps: [
      { tipo: "laminado", label: "Laminado", defaultMinutes: 15 },
    ],
  },
]

/** Acabados step template to append */
export const ACABADOS_STEP: StepTemplate = {
  tipo: "acabados",
  label: "Acabados",
  defaultMinutes: 15,
}

/** Station metadata for navigation and UI */
export const ESTACIONES = [
  {
    id: "impresion" as const,
    label: "Impresion",
    description: "Impresion y Re-Impresion",
    icon: Printer,
    href: "/impresion",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "laminado" as const,
    label: "Laminado",
    description: "Laminado y Foil",
    icon: Layers,
    href: "/laminado",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  {
    id: "corte" as const,
    label: "Corte",
    description: "Corte de material",
    icon: Scissors,
    href: "/corte",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "acabados" as const,
    label: "Acabados",
    description: "Acabados finales",
    icon: Sparkles,
    href: "/acabados",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
] as const
