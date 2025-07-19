const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const dati = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Prenotazione Italo Bob: ${dati.partenza} → ${dati.arrivo}`,
            description: `Ambiente: ${dati.ambiente} | Orario: ${dati.orario} | Codice treno: ${dati.codice}`
          },
          unit_amount: Math.round(parseFloat(dati.prezzo) * 100)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: "https://italotreni.netlify.app/successo",
      cancel_url: "https://italotreni.netlify.app/errore"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (err) {
    console.error("❌ Errore Stripe:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
