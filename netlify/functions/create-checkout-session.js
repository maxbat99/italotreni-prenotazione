const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Corpo richiesta mancante" })
      };
    }

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

    const prezzoCentesimi = Math.round(parseFloat(prezzo) * 100);
    if (isNaN(prezzoCentesimi) || prezzoCentesimi <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Prezzo non valido" })
      };
    }

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

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NOTIFY_EMAIL,
          pass: process.env.NOTIFY_PASSWORD
        }
      });

      await transporter.sendMail({
        from: `"italotreni - Biglietteria" <${process.env.NOTIFY_EMAIL}>`,
        to: email,
        subject: `🎫 Biglietto treno ${codice} confermato`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc">
            <h2 style="color: #d90000;">🎫 Biglietto treno confermato</h2>
            <p>Grazie per aver prenotato con <strong>italotreni</strong>!</p>
            <hr />
            <p><strong>Codice treno:</strong> ${codice}</p>
            <p><strong>Partenza:</strong> ${partenza}</p>
            <p><strong>Arrivo:</strong> ${arrivo}</p>
            <p><strong>Orario:</strong> ${orario}</p>
            <p><strong>Ambiente:</strong> ${ambiente}</p>
            <p><strong>Prezzo:</strong> €${prezzo}</p>
            <hr />
            <p><strong>📲 QR Code del biglietto:</strong></p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=italotreni:${codice}" alt="QR code biglietto" />
            <p style="font-size: 0.9em; color: #555">Mostra questo QR alla partenza o stampalo per sicurezza.</p>
            <br />
            <p style="font-size: 0.9em;">Per assistenza: <a href="mailto:italotreni.booking@gmail.com">italotreni.booking@gmail.com</a></p>
          </div>
        `
      });

      await transporter.sendMail({
        from: `"italotreni - Notifica" <${process.env.NOTIFY_EMAIL}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `📬 Nuova prenotazione: ${codice}`,
        text: `Nuovo biglietto venduto a ${email} per il treno ${codice}`
      });

    } catch (emailErr) {
      console.error("⚠️ Email fallita:", emailErr.message);
    }

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
