# Prenotazioni – Educazione finanziaria in 2 ore

Sito di prenotazione per domenica 25 ottobre, ore 16:00.

## Contenuto
- `public/index.html` – pagina con locandina, prenotazione e area admin
- `public/locandina.jpg` – la locandina
- `netlify/functions/` – salvataggio prenotazioni e area admin (Netlify Functions + Netlify Blobs)
- `netlify.toml`, `package.json` – configurazione per Netlify

## Pubblicazione (consigliata: GitHub + Netlify)
1. Crea un repository su github.com e carica tutti questi file (Add file → Upload files), mantenendo le cartelle.
2. Su app.netlify.com: Add new project → Import an existing project → GitHub → scegli il repository.
3. Lascia le impostazioni proposte (vengono lette da netlify.toml) e premi Deploy.

Il trascinamento della cartella su Netlify Drop potrebbe non attivare le funzioni: in quel caso le prenotazioni non vengono salvate. Usa GitHub o la Netlify CLI (`npx netlify-cli deploy --prod`).

## Dopo la pubblicazione
Apri subito il sito, clicca "Area admin" e crea la password: si imposta una sola volta, la prima persona che ci entra la sceglie.

Per cambiare password in futuro: nel pannello Netlify, Blobs → store "impostazioni" → elimina la voce "admin", poi reimpostala dall'Area admin.
