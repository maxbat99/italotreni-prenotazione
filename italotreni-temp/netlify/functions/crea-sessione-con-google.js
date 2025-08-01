const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  try {
    const dati = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Biglietto da ${dati.from} a ${dati.to}`
          },
          unit_amount: dati.prezzo
        },
        quantity: parseInt(dati.passeggeri)
      }],
      customer_email: dati.email,
      success_url: "https://genuine-platypus-99089c.netlify.app/successo.html",
      cancel_url: "https://genuine-platypus-99089c.netlify.app/errore.html"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    console.error("❌ Errore Stripe:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Errore interno" })
    };
  }
};
