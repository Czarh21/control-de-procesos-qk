-- Add JSONB pasos column and paso_actual index for multi-step pipeline
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS pasos JSONB NOT NULL DEFAULT '[]';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS paso_actual INTEGER NOT NULL DEFAULT 0;

-- Update estado constraint to new simplified values
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_estado_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_estado_check
  CHECK (estado IN ('en_proceso', 'esperando', 'terminado'));

-- Migrate any existing tickets to terminado so they don't violate the new constraint
UPDATE public.tickets SET estado = 'terminado'
  WHERE estado NOT IN ('en_proceso', 'esperando', 'terminado');

-- Index on paso_actual for station queries
CREATE INDEX IF NOT EXISTS idx_tickets_pasos ON public.tickets USING gin (pasos);
