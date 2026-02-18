-- Add tipo_servicio column to support optional services
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS tipo_servicio TEXT NOT NULL DEFAULT 'ambos'
CHECK (tipo_servicio IN ('solo_impresion', 'solo_laminado', 'ambos'));

-- Make tiempo_impresion nullable (not needed for solo_laminado)
ALTER TABLE public.tickets ALTER COLUMN tiempo_impresion DROP NOT NULL;

-- Make tiempo_laminado nullable (not needed for solo_impresion)
ALTER TABLE public.tickets ALTER COLUMN tiempo_laminado DROP NOT NULL;

-- Index on tipo_servicio for filtering
CREATE INDEX IF NOT EXISTS idx_tickets_tipo_servicio ON public.tickets (tipo_servicio);
