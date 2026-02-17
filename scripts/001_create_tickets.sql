-- Create tickets table for the turn system
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_pos TEXT NOT NULL,
  cliente TEXT NOT NULL,
  tiempo_impresion INTEGER NOT NULL,
  tiempo_laminado INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en_impresion'
    CHECK (estado IN ('en_impresion', 'listo_para_laminado', 'en_laminado', 'terminado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  inicio_impresion TIMESTAMPTZ,
  fin_impresion TIMESTAMPTZ,
  inicio_laminado TIMESTAMPTZ,
  fin_laminado TIMESTAMPTZ,
  realizado_por_impresion TEXT,
  realizado_por_laminado TEXT,
  notas TEXT
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (no auth required for this system)
CREATE POLICY "allow_select_all" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "allow_insert_all" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_all" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "allow_delete_all" ON public.tickets FOR DELETE USING (true);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets (estado);
CREATE INDEX IF NOT EXISTS idx_tickets_creado_en ON public.tickets (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_pos ON public.tickets (ticket_pos);
