const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const axios = require("axios"); // Per inviare notifica (es. Zapier)

exports.handler = async (event) => {
  const { codice, partenza, arrivo, prezzo, data, posto, email } = JSON.parse(event.body);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Treno ${codice}: ${partenza} → ${arrivo}`,
            description: `Data: ${data} | Posto: ${posto}`
          },
          unit_amount: Math.round(parseFloat(prezzo) * 100)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: "https://TUA_URL_NETLIFY/successo.html",
      cancel_url: "https://TUA_URL_NETLIFY/annullato.html"
    });

    // 🔔 Notifica via Zapier/Make (facoltativo)
    await axios.post("https://hooks.zapier.com/hooks/catch/TUO_WEBHOOK_ID/", {
      codice, partenza, arrivo, prezzo, data, posto, email
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

