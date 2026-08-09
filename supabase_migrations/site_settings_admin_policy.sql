-- Allow authenticated admins to toggle maintenance mode from the dashboard
CREATE POLICY "Allow admins to update site_settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- Allow authenticated admins to create the settings row if missing
CREATE POLICY "Allow admins to insert site_settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );
