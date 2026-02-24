-- Migration: Add new process types (Corte, Foil, Impresion 2, Acabados)

-- 1. Add new columns for extended processes
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS con_acabados BOOLEAN NOT NULL DEFAULT false;

-- Impresion 2da pasada
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_impresion_2 INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_impresion_2 TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_impresion_2 TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_impresion_2 TEXT;

-- Foil (en local de laminado)
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_foil INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_foil TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_foil TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_foil TEXT;

-- Corte
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_corte INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_corte TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_corte TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_corte TEXT;

-- Acabados
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_acabados INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_acabados TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_acabados TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_acabados TEXT;

-- 2. Migrate existing 'ambos' -> 'imp_lam'
UPDATE public.tickets SET tipo_servicio = 'imp_lam' WHERE tipo_servicio = 'ambos';

-- 3. Drop old constraints and add new ones
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_tipo_servicio_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_tipo_servicio_check
  CHECK (tipo_servicio IN (
    'solo_impresion', 'solo_laminado', 'imp_lam',
    'imp_lam_corte', 'imp_lam_imp_foil', 'imp_lam_imp_foil_corte'
  ));

ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_estado_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_estado_check
  CHECK (estado IN (
    'en_impresion', 'listo_para_laminado', 'en_laminado',
    'listo_para_impresion_2', 'en_impresion_2',
    'listo_para_foil', 'en_foil',
    'listo_para_corte', 'en_corte',
    'listo_para_acabados', 'en_acabados',
    'terminado'
  ));

-- 4. Indexes for new states
CREATE INDEX IF NOT EXISTS idx_tickets_con_acabados ON public.tickets (con_acabados);
