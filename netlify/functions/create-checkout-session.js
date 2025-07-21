const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const { codice, partenza, arrivo, orario, ambiente, prezzo, email } = JSON.parse(event.body);

    // 💳 Validazione prezzo
    const prezzoCentesimi = Math.round(parseFloat(prezzo) * 100);
    if (isNaN(prezzoCentesimi) || prezzoCentesimi <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Prezzo non valido" })
      };
    }

    // ✅ Crea sessione Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "https://genuine-platypus-99089c.netlify.app/successo.html?codice=" + codice,
      cancel_url: "https://genuine-platypus-99089c.netlify.app/errore.html",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Treno ${codice} - ${partenza} → ${arrivo}`,
            description: `${ambiente} - Orario ${orario}`
          },
          unit_amount: prezzoCentesimi
        },
        quantity: 1
      }],
      customer_email: email
    });

    // 📬 Configura trasporto email (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_PASSWORD
      }
    });

    // ✉️ Email al cliente
    await transporter.sendMail({
      from: `"Italo Bob - Biglietteria" <${process.env.NOTIFY_EMAIL}>`,
      to: email,
      subject: `🎫 Prenotazione treno ${codice} confermata`,
      html: `
        <h2>Grazie per aver prenotato con Italo Bob!</h2>
        <p>Ecco i dettagli del tuo viaggio:</p>
        <ul>
          <li><strong>Codice:</strong> ${codice}</li>
          <li><strong>Da:</strong> ${partenza} → <strong>A:</strong> ${arrivo}</li>
          <li><strong>Orario:</strong> ${orario}</li>
          <li><strong>Ambiente:</strong> ${ambiente}</li>
          <li><strong>Prezzo:</strong> €${prezzo}</li>
        </ul>
        <p>Riceverai un QR code alla conferma del pagamento.</p>
      `
    });

    // ✉️ Notifica interna (opzionale)
    await transporter.sendMail({
      from: `"Italo Bob - Notifica" <${process.env.NOTIFY_EMAIL}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `📬 Nuova prenotazione: ${codice}`,
      text: `Nuovo biglietto venduto a ${email} per il treno ${codice}`
    });

    // 🔗 Restituisci URL Stripe
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error("❌ Errore backend:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ Errore backend: " + err.message })
    };
  }
};
