const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // 🔍 Validazione campi ricevuti
    const { codice, partenza, arrivo, prezzo, email, orario, ambiente } = data;

    // Validazione base
    if (!codice || !partenza || !arrivo || !prezzo || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Dati incompleti per la prenotazione" })
      };
    }

    // Validazione prezzo
    const prezzoCentesimi = Math.round(parseFloat(prezzo) * 100);
    if (isNaN(prezzoCentesimi) || prezzoCentesimi <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Prezzo non valido" })
      };
    }

    // Validazione email (formato semplice)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Email non valida" })
      };
    }

    // 📦 Crea sessione Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "https://italotreni.netlify.app/successo.html",
      cancel_url: "https://italotreni.netlify.app/errore.html",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Treno ${codice}: ${partenza} → ${arrivo}`
            },
            unit_amount: prezzoCentesimi
          },
          quantity: 1
        }
      ]
    });

    // 📨 Configura Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_PASSWORD
      }
    });

    // 📬 Email interna
    await transporter.sendMail({
      from: `"Italo Bob Prenotazioni" <${process.env.NOTIFY_EMAIL}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `🎫 Nuova prenotazione: Treno ${codice}`,
      html: `
        <h3>📬 Nuova prenotazione</h3>
        <ul>
          <li><strong>Codice:</strong> ${codice}</li>
          <li><strong>Partenza:</strong> ${partenza}</li>
          <li><strong>Arrivo:</strong> ${arrivo}</li>
          <li><strong>Email cliente:</strong> ${email}</li>
          <li><strong>Prezzo:</strong> €${prezzo}</li>
        </ul>
      `
    });

    // 📬 Email al cliente
    await transporter.sendMail({
      from: `"Italo Bob" <${process.env.NOTIFY_EMAIL}>`,
      to: email,
      subject: `🎫 Il tuo biglietto per il Treno ${codice}`,
      html: `
        <h2>Grazie per la tua prenotazione!</h2>
        <p><strong>Treno:</strong> ${codice}</p>
        <p><strong>Da:</strong> ${partenza} → <strong>A:</strong> ${arrivo}</p>
        <p><strong>Orario:</strong> ${orario || "N/D"}</p>
        <p><strong>Ambiente:</strong> ${ambiente || "N/D"}</p>
        <p><strong>Prezzo:</strong> €${prezzo}</p>
        <p><strong>Codice prenotazione:</strong> ${session.id}</p>
        <br>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Treno-${codice}-${orario || 'xx:xx'}" alt="QR Biglietto" />
        <br><br>
        <p>Porta questo biglietto digitale con te 🚆</p>
      `
    });

    // 🔗 Ritorna il link Stripe
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error("❌ Errore backend:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
