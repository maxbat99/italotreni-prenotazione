require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Biglietto Frecciarossa Napoli–Milano'
          },
          unit_amount: 11000
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: 'https://genuine-platypus-99089c.netlify.app/successo',
      cancel_url: 'https://genuine-platypus-99089c.netlify.app/annullato'
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
