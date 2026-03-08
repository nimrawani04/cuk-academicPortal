
CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  notification_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, notification_type, notification_id)
);

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reads"
  ON public.notification_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reads"
  ON public.notification_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reads"
  ON public.notification_reads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
