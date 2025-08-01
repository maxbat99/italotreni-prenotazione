const { google } = require("googleapis");
const scrapeItalo = require("./scrapeItalo");
const path = require("path");

async function saveToSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(__dirname, "creds", "credenziali.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1tmY7r8cVpbRwY5_KkCOStkoGA9IdYHK93aL9SrWgLHc";
    const dati = await scrapeItalo();

    if (!dati || dati.length === 0) {
      console.warn("⚠️ Nessun dato da salvare.");
      return;
    }

    const valori = dati.map(r => [
      r.from,
      r.to,
      r.date,
      r.train,
      r.departure,
      r.arrival,
      r.price,
      r.ambiente
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Foglio1!A2",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: valori }
    });

    console.log("✅ Dati salvati correttamente nel foglio!");
  } catch (err) {
    console.error("❌ Errore durante il salvataggio:", err.message);
  }
}

saveToSheets();
