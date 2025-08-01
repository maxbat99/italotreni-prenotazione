const { chromium } = require("playwright");
const { google } = require("googleapis");
const path = require("path");

// 📌 Configurazione tratte e foglio
const tratte = [
  { from: "Roma Termini", to: "Milano Centrale" },
  { from: "Napoli Centrale", to: "Torino Porta Susa" }
];
const spreadsheetId = "1tmY7r8cVpbRwY5_KkCOStkoGA9IdYHK93aL9SrWgLHc";

// 🧠 Logger semplice
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// 🔎 Scraping Italo
async function scrapeItalo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const date = new Date().toISOString().split("T")[0];
  let risultati = [];

  for (const tratta of tratte) {
    try {
      log(`Scraping: ${tratta.from} → ${tratta.to}`);
      await page.goto("https://www.italotreno.it", { waitUntil: "domcontentloaded", timeout: 60000 });

      // 🚧 Simulazione temporanea (da sostituire con selettori reali)
      risultati.push({
        from: tratta.from,
        to: tratta.to,
        date,
        train: `99${Math.floor(Math.random() * 90 + 10)}`,
        departure: "08:40",
        arrival: "13:15",
        price: (Math.random() * 50 + 19).toFixed(2),
        ambiente: "Smart"
      });
    } catch (err) {
      log(`Errore nella tratta ${tratta.from} → ${tratta.to}: ${err}`);
    }
  }

  await browser.close();
  return risultati;
}

// 📤 Salvataggio su Google Sheets
async function saveToSheets(dati) {
  if (!dati.length) return log("⚠️ Nessun dato da salvare");

  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, "creds", "credenziali.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const valori = dati.map(r => [
    r.from, r.to, r.date, r.train, r.departure, r.arrival, r.price, r.ambiente
  ]);

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Foglio1!A2",
      valueInputOption: "USER_ENTERED",
      resource: { values: valori }
    });
    log("✅ Dati aggiornati su Google Sheets");
  } catch (error) {
    log("❌ Errore nel salvataggio: " + error);
  }
}

// 🏁 Esecuzione completa
(async () => {
  const dati = await scrapeItalo();
  await saveToSheets(dati);
})();
