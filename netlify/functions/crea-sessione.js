const Stripe = require("stripe");
const { google } = require("googleapis");

// 👉 Chiave Stripe
const stripe = Stripe("rk_live_...");

// 👉 Configurazione Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "italotreni@italo-465923.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\nTUA_CHIAVE_PRIVATA\n-----END PRIVATE KEY-----\n",
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });
const sheetId = "1TjucIZZYopyrUk2isxuR5MSKfxgTukX0d9h2IkMQMXo";
const sheetName = "italotreni-prenotazione";

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Metodo non consentito" };
  }

  const dati = JSON.parse(event.body);
  const { from, to, data, orario, ambiente, passeggeri, prezzo, email } = dati;

  try {
    // 🔄 Crea la sessione Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Biglietto ${from} → ${to} (${data} - ${orario})`,
            description: `${ambiente} - ${passeggeri} passeggeri`,
          },
          unit_amount: prezzo,
        },
        quantity: 1
      }],
      customer_email: email,
      mode: "payment",
      success_url: "https://genuine-platypus-99089c.netlify.app/ticket.html",
      cancel_url: "https://genuine-platypus-99089c.netlify.app/",
    });

    // 📤 Invia i dati al foglio Google
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      resource: {
        values: [[from, to, data, orario, ambiente, passeggeri, prezzo / 100, email, session.id]]
      }
    });

    return { statusCode: 200, body: JSON.stringify({ id: session.id }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
