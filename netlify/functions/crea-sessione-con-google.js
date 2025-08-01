require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ✅ (Facoltativo) salvataggio su Google Sheets
// const saveToSheets = require('./saveToSheets');

exports.handler = async function(event) {
  try {
    const { email, treno, prezzo } = JSON.parse(event.body);

    // 💾 Salvataggio su Sheets (se vuoi attivarlo, decommenta la riga sopra)
    // await saveToSheets({ email, treno, prezzo });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Biglietto ${treno}`
          },
          unit_amount: Math.round(prezzo * 100)  // Prezzo in centesimi
        },
        quantity: 1
      }],
      customer_email: email,
      mode: 'payment',
      success_url: 'https://genuine-platypus-99089c.netlify.app/successo',
      cancel_url: 'https://genuine-platypus-99089c.netlify.app/annullato'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionUrl: session.url })
    };
  } catch (error) {
    console.error('❌ Errore Stripe:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
