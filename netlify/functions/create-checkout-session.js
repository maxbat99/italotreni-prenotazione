const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    // 🔍 Verifica che body sia presente
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Corpo richiesta mancante" })
      };
    }

    // 🧪 Parsing sicuro
    let dati;
    try {
      dati = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ JSON malformato" })
      };
    }

    const { codice, partenza, arrivo, orario, ambiente, prezzo, email } = dati;

    // 💳 Validazione prezzo
    const prezzoCentesimi = Math.round(parseFloat(prezzo) * 100);
    if (isNaN(prezzoCentesimi) || prezzoCentesimi <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Prezzo non valido" })
      };
    }

    // ✅ Crea sessione Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `https://genuine-platypus-99089c.netlify.app/successo.html?codice=${codice}`,
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
    } catch (stripeErr) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "❌ Errore Stripe: " + stripeErr.message })
      };
    }

    // 📬 Invio email (non blocca il pagamento se fallisce)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NOTIFY_EMAIL,
          pass: process.env.NOTIFY_PASSWORD
        }
      });

      // ✉️ Email al cliente
      await transporter.sendMail({
        from: `"italotreni - Biglietteria" <${process.env.NOTIFY_EMAIL}>`,
        to: email,
        subject: `🎫 Prenotazione treno ${codice} confermata`,
        html: `
          <h2>Grazie per aver prenotato con italotreni!</h2>
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

      // ✉️ Notifica interna
      await transporter.sendMail({
        from: `"italotreni - Notifica" <${process.env.NOTIFY_EMAIL}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `📬 Nuova prenotazione: ${codice}`,
        text: `Nuovo biglietto venduto a ${email} per il treno ${codice}`
      });

    } catch (emailErr) {
      console.error("⚠️ Email fallita:", emailErr.message);
      // Non blocchiamo il pagamento per errore email
    }

    // 🔗 Restituisci l’URL di pagamento
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error("❌ Errore backend:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "❌ Errore backend: " + err.message })
    };
  }
};
