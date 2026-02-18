import Link from "next/link"
import Image from "next/image"
import { Printer, Layers, Search, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        {/* Logos */}
        <div className="flex items-center justify-center gap-6">
          <Image
            src="/images/logo-sh.png"
            alt="SH Artes Graficas"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
          <Image
            src="/images/logo-myapp.png"
            alt="MyApp"
            width={90}
            height={90}
            className="object-contain"
            priority
          />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            Control de Procesos
          </h1>
          <p className="text-muted-foreground text-base">
            Selecciona tu estacion de trabajo
          </p>
        </div>

        {/* Station buttons */}
        <div className="flex w-full flex-col gap-4">
          <Link
            href="/impresion"
            className="group flex items-center gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-6 transition-all hover:border-amber-500 hover:bg-amber-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-500">
              <Printer className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Local de Impresion / Creacion de Tickets
              </span>
              <span className="text-sm text-muted-foreground">
                Crear tickets y gestionar impresiones
              </span>
            </div>
          </Link>

          <Link
            href="/laminado"
            className="group flex items-center gap-4 rounded-xl border-2 border-violet-300 bg-violet-50 p-6 transition-all hover:border-violet-500 hover:bg-violet-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-violet-500">
              <Layers className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Local de Laminado
              </span>
              <span className="text-sm text-muted-foreground">
                Recibir trabajos y gestionar laminado
              </span>
            </div>
          </Link>

          <Link
            href="/reportes"
            className="group flex items-center gap-4 rounded-xl border-2 border-blue-300 bg-blue-50 p-6 transition-all hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-500">
              <BarChart3 className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Reportes
              </span>
              <span className="text-sm text-muted-foreground">
                Ver el rendimiento y cumplimiento de tickets
              </span>
            </div>
          </Link>
        </div>

        {/* Separator */}
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Para clientes</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Client lookup */}
        <Link
          href="/consulta"
          className="group flex w-full items-center gap-4 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6 transition-all hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-lg active:scale-[0.98]"
        >
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
            <Search className="size-7 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-foreground">
              Consultar Pedido
            </span>
            <span className="text-sm text-muted-foreground">
              Busca tu ticket y revisa si tu trabajo esta listo
            </span>
          </div>
        </Link>

        <p className="text-xs text-muted-foreground text-center">
          Cada local debe abrir su propia URL en su dispositivo
        </p>
      </div>
    </main>
  )
}
