// /pages/api/oauth.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://perlstlhcuyahpvnvmeh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcmxzdGxoY3V5YWhwdm52bWVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0ODI2NywiZXhwIjoyMDczNzI0MjY3fQ.O-dDnnB8HhMHkIyoVBsXsaO62WJXhb6uYv3YWvpQgYI'
);

const guildId = '1344430123272900700'; // <- ID twojego serwera
const botToken = processMTQxNzk5ODE2MjkxMTY5MDgzMg.GzHawo.lshKhIIwhdw9gA7qWE2Zhr3RVPmRwM5S9n-VfI.env.DISCORD_BOT_TOKEN; // <- Dodaj do .env lub wpisz ręcznie (jeśli testujesz)

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Brak kodu Discord');

  try {
    // 1. Pobierz access_token z Discorda
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://lala-bice.vercel.app/login.html'
      })      
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(401).send('Błąd tokenu Discord');

    // 2. Dane użytkownika
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userRes.json();
    const { id, username, avatar } = userData;
    if (!id) return res.status(500).send('Błąd danych użytkownika Discord');

    // 3. Pobranie ról użytkownika z serwera
    const memberRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${id}`, {
      headers: { Authorization: `Bot ${botToken}` }  // Użyj tokena BOTA
    });

    if (!memberRes.ok) {
      return res.status(403).send('Nie jesteś członkiem serwera Discord');
    }

    const memberData = await memberRes.json();
    const roles = memberData.roles || [];

    // 4. Zapis do Supabase
    const { error } = await supabase
      .from('users')
      .upsert({
        discord_id: id,
        username,
        avatar,
        roles,
        last_login: new Date()
      }, { onConflict: 'discord_id' });

    if (error) {
      console.error(error);
      return res.status(500).send('Błąd Supabase');
    }

    // 5. Przekierowanie
    return res.redirect(`/main.html?discord_id=${id}`);
  } catch (err) {
    console.error('Błąd ogólny:', err);
    return res.status(500).send('Błąd logowania');
  }
}
