import Link from "next/link"
import Image from "next/image"
import { Printer, Layers, Search, BarChart3, Scissors, Star } from "lucide-react"

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-8 py-8">
        {/* Logos */}
        <div className="flex items-center justify-center gap-6">
          <Image
            src="/images/logo-sh.png"
            alt="SH Artes Graficas"
            width={100}
            height={100}
            className="h-16 w-auto object-contain"
            priority
          />
          <Image
            src="/images/logo-myapp.png"
            alt="MyApp"
            width={90}
            height={90}
            className="h-14 w-auto object-contain"
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
            className="group flex items-center gap-4 rounded-xl border-2 border-blue-300 bg-blue-50 p-5 transition-all hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-500">
              <Printer className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Local de Impresion
              </span>
              <span className="text-sm text-muted-foreground">
                Crear tickets y gestionar impresiones
              </span>
            </div>
          </Link>

          <Link
            href="/laminado"
            className="group flex items-center gap-4 rounded-xl border-2 border-purple-300 bg-purple-50 p-5 transition-all hover:border-purple-500 hover:bg-purple-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-purple-500">
              <Layers className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Local de Laminado
              </span>
              <span className="text-sm text-muted-foreground">
                Recibir trabajos, laminado y foil
              </span>
            </div>
          </Link>

          <Link
            href="/corte"
            className="group flex items-center gap-4 rounded-xl border-2 border-orange-300 bg-orange-50 p-5 transition-all hover:border-orange-500 hover:bg-orange-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-orange-500">
              <Scissors className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Local de Corte
              </span>
              <span className="text-sm text-muted-foreground">
                Recibir y gestionar cortes
              </span>
            </div>
          </Link>

          <Link
            href="/acabados"
            className="group flex items-center gap-4 rounded-xl border-2 border-teal-300 bg-teal-50 p-5 transition-all hover:border-teal-500 hover:bg-teal-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-teal-500">
              <Star className="size-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">
                Local de Acabados
              </span>
              <span className="text-sm text-muted-foreground">
                Ultimo paso del proceso (opcional)
              </span>
            </div>
          </Link>

          <Link
            href="/reportes"
            className="group flex items-center gap-4 rounded-xl border-2 border-indigo-300 bg-indigo-50 p-5 transition-all hover:border-indigo-500 hover:bg-indigo-100 hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-500">
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
          className="group flex w-full items-center gap-4 rounded-xl border-2 border-green-300 bg-green-50 p-5 transition-all hover:border-green-500 hover:bg-green-100 hover:shadow-lg active:scale-[0.98]"
        >
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-green-500">
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
