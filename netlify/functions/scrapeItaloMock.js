const { google } = require("googleapis");

module.exports = async function(valori) {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1tmY7r8cVpbRwY5_KkCOStkoGA9IdYHK93aL9SrWgLHc"; // metti l'ID del foglio test

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "FoglioTest!A2",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: { values: valori }
  });

  console.log("✅ Dati salvati!");
};
