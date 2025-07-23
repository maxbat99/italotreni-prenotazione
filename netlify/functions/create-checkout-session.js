const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    const dati = JSON.parse(event.body);
    const { codice, partenza, arrivo, orario, ambiente, prezzo, email, data, posto } = dati;

    const prezzoCentesimi = Math.round(parseFloat(prezzo) * 100);
    if (!email || !email.includes("@") || isNaN(prezzoCentesimi)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "❌ Dati non validi" })
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `https://resplendent-marshmallow-ad77ce.netlify.app/success.html?codice=${codice}&data=${encodeURIComponent(data)}&posto=${encodeURIComponent(posto)}`,
      cancel_url: `https://resplendent-marshmallow-ad77ce.netlify.app/errore.html`,
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: prezzoCentesimi,
          product_data: {
            name: `Treno ${codice} - ${partenza} → ${arrivo}`,
            description: `${ambiente}, ${orario} del ${data} - Posto ${posto}`
          }
        },
        quantity: 1
      }],
      customer_email: email
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Italotreni Biglietteria" <${process.env.NOTIFY_EMAIL}>`,
      to: email,
      subject: `🎫 Biglietto ${codice} confermato`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#B2002E;">🎫 Il tuo biglietto è confermato</h2>
          <p><strong>Treno:</strong> ${codice}</p>
          <p><strong>Da:</strong> ${partenza} → <strong>A:</strong> ${arrivo}</p>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Orario:</strong> ${orario}</p>
          <p><strong>Posto:</strong> ${posto}</p>
          <p><strong>Ambiente:</strong> ${ambiente}</p>
          <p><strong>Prezzo:</strong> €${prezzo}</p>
          <br>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=italotreni:${codice}" alt="QR Biglietto" />
        </div>
      `
    });

    await transporter.sendMail({
      from: `"Italotreni Notifica" <${process.env.NOTIFY_EMAIL}>`,
      to: "jonathanbreeen@gmail.com",
      subject: `📬 Nuova prenotazione ${codice}`,
      html: `
        <div style="font-family: Arial; padding: 16px;">
          <h2>📬 Nuovo biglietto acquistato</h2>
          <p><strong>Email cliente:</strong> ${email}</p>
          <p><strong>Treno:</strong> ${codice}</p>
          <p><strong>Da:</strong> ${partenza}</p>
          <p><strong>A:</strong> ${arrivo}</p>
          <p><strong>Data:</strong> ${data}</p>
          <p><strong>Orario:</strong> ${orario}</p>
          <p><strong>Posto:</strong> ${posto}</p>
          <p><strong>Prezzo:</strong> €${prezzo}</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error("❌ Errore:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "❌ Errore: " + err.message })
    };
  }
};
