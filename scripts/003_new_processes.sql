-- Full tickets table with all processes
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_pos TEXT NOT NULL,
  cliente TEXT NOT NULL,

  tipo_servicio TEXT NOT NULL DEFAULT 'imp_lam'
    CHECK (tipo_servicio IN (
      'solo_impresion',
      'solo_laminado',
      'imp_lam',
      'imp_lam_corte',
      'imp_lam_foil',
      'imp_lam_foil_corte'
    )),

  con_acabados BOOLEAN NOT NULL DEFAULT false,

  estado TEXT NOT NULL DEFAULT 'en_impresion'
    CHECK (estado IN (
      'en_impresion',
      'listo_para_laminado',
      'en_laminado',
      'listo_para_impresion_2',
      'en_impresion_2',
      'listo_para_foil',
      'en_foil',
      'listo_para_corte',
      'en_corte',
      'listo_para_acabados',
      'en_acabados',
      'terminado'
    )),

  tiempo_impresion INTEGER,
  tiempo_laminado INTEGER,
  tiempo_impresion_2 INTEGER,
  tiempo_foil INTEGER,
  tiempo_corte INTEGER,
  tiempo_acabados INTEGER,

  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  inicio_impresion TIMESTAMPTZ,
  fin_impresion TIMESTAMPTZ,
  inicio_laminado TIMESTAMPTZ,
  fin_laminado TIMESTAMPTZ,
  inicio_impresion_2 TIMESTAMPTZ,
  fin_impresion_2 TIMESTAMPTZ,
  inicio_foil TIMESTAMPTZ,
  fin_foil TIMESTAMPTZ,
  inicio_corte TIMESTAMPTZ,
  fin_corte TIMESTAMPTZ,
  inicio_acabados TIMESTAMPTZ,
  fin_acabados TIMESTAMPTZ,

  realizado_por_impresion TEXT,
  realizado_por_laminado TEXT,
  realizado_por_impresion_2 TEXT,
  realizado_por_foil TEXT,
  realizado_por_corte TEXT,
  realizado_por_acabados TEXT,

  notas TEXT
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_select_all" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "allow_insert_all" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_all" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "allow_delete_all" ON public.tickets FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets (estado);
CREATE INDEX IF NOT EXISTS idx_tickets_creado_en ON public.tickets (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_pos ON public.tickets (ticket_pos);
CREATE INDEX IF NOT EXISTS idx_tickets_tipo_servicio ON public.tickets (tipo_servicio);
CREATE INDEX IF NOT EXISTS idx_tickets_con_acabados ON public.tickets (con_acabados);
