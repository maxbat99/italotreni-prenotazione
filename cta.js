// 🔄 Caricamento delle stazioni Trenitalia dal JSON
fetch("trenitalia_train_stations.json")
  .then(res => res.json())
  .then(data => {
    const datalist = document.getElementById("stazioni");
    datalist.innerHTML = "";
    data.forEach(station => {
      const nome = Object.keys(station)[0];
      const opt = document.createElement("option");
      opt.value = nome;
      datalist.appendChild(opt);
    });
  })
  .catch(err => {
    console.error("❌ Errore nel caricamento stazioni:", err);
    alert("⚠️ Impossibile caricare le stazioni. Controlla il file JSON.");
  });

// 🧠 Integrazione Stripe e invio dati form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("italotreni-form");
  const risultati = document.getElementById("risultati");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dati = {
      from: document.getElementById("from").value,
      to: document.getElementById("to").value,
      data: document.getElementById("date-andata").value,
      ritorno: document.getElementById("date-ritorno").value,
      passeggeri: document.getElementById("passengers").value,
      ambiente: document.getElementById("ambiente").value,
      email: document.getElementById("email").value,
      orario: "08:40",
      prezzo: 3990
    };

    risultati.innerText = "🔎 Ricerca in corso...";

    try {
      const response = await fetch("/.netlify/functions/crea-sessione-con-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dati)
      });

      const result = await response.json();

      if (result.id) {
        const stripe = Stripe("pk_test_TUA_CHIAVE_PUBBLICA"); // ⛳ Inserisci la tua chiave Stripe
        stripe.redirectToCheckout({ sessionId: result.id });
      } else {
        risultati.innerText = "❌ Errore: " + (result.error || "Sessione non creata.");
      }
    } catch (error) {
      console.error("❌ Errore:", error);
      risultati.innerText = "⚠️ Errore durante la prenotazione. Riprova.";
    }
  });
});
