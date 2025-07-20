const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // ✅ Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: 'https://tua-app.netlify.app/successo.html',
      cancel_url: 'https://tua-app.netlify.app/errore.html',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Treno ${data.codice}: ${data.partenza} → ${data.arrivo}`
          },
          unit_amount: Math.round(parseFloat(data.prezzo) * 100)
        },
        quantity: 1
      }]
    });

    // ✅ Configura transport mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_PASSWORD
      }
    });

    // ✅ Email a te
    await transporter.sendMail({
      from: `"Italo Bob Prenotazioni" <${process.env.NOTIFY_EMAIL}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `🎫 Nuova prenotazione: Treno ${data.codice}`,
      html: `
        <h3>📬 Nuova prenotazione</h3>
        <ul>
          <li><strong>Codice:</strong> ${data.codice}</li>
          <li><strong>Partenza:</strong> ${data.partenza}</li>
          <li><strong>Arrivo:</strong> ${data.arrivo}</li>
          <li><strong>Prezzo:</strong> €${data.prezzo}</li>
          <li><strong>Email cliente:</strong> ${data.email}</li>
        </ul>
      `
    });

    // ✅ Email al cliente
    await transporter.sendMail({
      from: `"Italo Bob" <${process.env.NOTIFY_EMAIL}>`,
      to: data.email,
      subject: `🎫 Il tuo biglietto per il Treno ${data.codice}`,
      html: `
        <h2>Grazie per la tua prenotazione!</h2>
        <p><strong>Treno:</strong> ${data.codice}</p>
        <p><strong>Da:</strong> ${data.partenza} → <strong>A:</strong> ${data.arrivo}</p>
        <p><strong>Orario:</strong> ${data.orario || "N/D"}</p>
        <p><strong>Ambiente:</strong> ${data.ambiente || "N/D"}</p>
        <p><strong>Prezzo:</strong> €${data.prezzo}</p>
        <p><strong>Codice prenotazione:</strong> ${session.id}</p>
        <br>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Treno-${data.codice}-${data.orario || 'xx:xx'}" alt="QR Biglietto">
        <br><br>
        <p>Porta questo biglietto con te! 🚆</p>
      `
    });

    // ✅ Ritorna l'ID della sessione Stripe
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (err) {
    console.error("❌ Errore:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
