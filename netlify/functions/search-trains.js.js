const { google } = require("googleapis");
const path = require("path");

exports.handler = async () => {
  try {
    // 🔐 Autenticazione Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(__dirname, "../../creds/credenziali.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // 📄 Lettura dati dal foglio
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: "1tmY7r8cVpbRwY5_KkCOStkoGA9IdYHK93aL9SrWgLHc",
      range: "Foglio1!A2:H"
    });

    const rows = res.data.values || [];

    if (rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "🚫 Nessun treno disponibile" })
      };
    }

    // 🧪 Mappatura dati pulita
    const treni = rows
      .filter(r => r.length >= 8)
      .map(r => ({
        from: r[0],
        to: r[1],
        date: r[2],
        train: r[3],
        departure: r[4],
        arrival: r[5],
        price: r[6],
        ambiente: r[7]
      }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(treni)
    };

  } catch (error) {
    console.error("❌ Errore search-trains:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore nel recupero treni", details: error.message })
    };
  }
};
