-- Step 1: Add new columns
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS con_acabados BOOLEAN DEFAULT false;

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_impresion_2 INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_impresion_2 TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_impresion_2 TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_impresion_2 TEXT;

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_foil INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_foil TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_foil TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_foil TEXT;

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_corte INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_corte TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_corte TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_corte TEXT;

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS tiempo_acabados INTEGER;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inicio_acabados TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS fin_acabados TIMESTAMPTZ;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS realizado_por_acabados TEXT;
