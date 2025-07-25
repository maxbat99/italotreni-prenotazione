const stripe = Stripe("pk_test_TUA_CHIAVE_PUBBLICA"); // 🔐 Inserisci la tua chiave pubblica Stripe

function pagaTreno(treno) {
  // Salva i dati del biglietto nel localStorage
  localStorage.setItem("bigliettoItalo", JSON.stringify({
    from: treno.from,
    to: treno.to,
    data: treno.data,
    orario: treno.orario,
    ambiente: treno.ambiente,
    passeggeri: treno.passeggeri,
    prezzo: treno.prezzo,
    email: treno.email
  }));

  // Crea la sessione Stripe e reindirizza
  fetch('http://localhost:4242/crea-sessione', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(treno)
  })
  .then(res => res.json())
  .then(data => {
    stripe.redirectToCheckout({ sessionId: data.id });
  })
  .catch(err => {
    alert("❌ Errore nella creazione della sessione Stripe.");
    console.error(err);
  });
}
