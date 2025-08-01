const { chromium } = require('playwright');

async function scrapeItalo() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const tratte = [
    { from: "Roma Termini", to: "Milano Centrale" },
    { from: "Napoli Centrale", to: "Torino Porta Susa" }
  ];

  const date = new Date().toISOString().split("T")[0];
  let risultati = [];

  for (const tratta of tratte) {
    await page.goto("https://www.italotreno.it", { waitUntil: "load" });

    // Simulazione: puoi implementare selezione campi reali qui
    risultati.push({
      from: tratta.from,
      to: tratta.to,
      date,
      train: "9954",
      departure: "08:40",
      arrival: "13:15",
      price: "39.90",
      ambiente: "Smart"
    });
  }

  await browser.close();
  return risultati;
}

module.exports = scrapeItalo;
