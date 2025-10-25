import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://perlstlhcuyahpvnvmeh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcmxzdGxoY3V5YWhwdm52bWVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0ODI2NywiZXhwIjoyMDczNzI0MjY3fQ.O-dDnnB8HhMHkIyoVBsXsaO62WJXhb6uYv3YWvpQgYI'
);

const CLIENT_ROLE_ID = '1344434596795777084';

export default async function handler(req, res) {
  const discord_id = req.query.discord_id;

  if (!discord_id) return res.status(400).json({ error: 'Brak discord_id' });

  const { data, error } = await supabase
    .from('users')
    .select('roles')
    .eq('discord_id', discord_id)
    .single();

  if (error || !data) {
    return res.status(403).json({ error: 'Nie znaleziono użytkownika' });
  }

  const hasClientRole = data.roles?.includes(CLIENT_ROLE_ID);

  if (!hasClientRole) {
    return res.status(403).json({ error: 'Brak roli klienta – dostęp zabroniony' });
  }

  return res.status(200).json({ roles: data.roles });
}
