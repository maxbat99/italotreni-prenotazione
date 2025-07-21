const nodemailer = require("nodemailer");

exports.handler = async () => {
  try {
    // Configurazione SMTP per Virgilio
    const transporter = nodemailer.createTransport({
      host: "out.virgilio.it",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_PASSWORD
      }
    });

    // Email di test
    await transporter.sendMail({
      from: `"Test Nodemailer" <${process.env.NOTIFY_EMAIL}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: "✅ Verifica Email da Netlify",
      text: "La tua email Virgilio è stata configurata correttamente con Nodemailer!",
      html: "<h3>✅ Email inviata correttamente da Netlify</h3><p>Configurazione SMTP OK 🎉</p>"
    });

    return {
      statusCode: 200,
      body: "✅ Email di verifica inviata con successo!"
    };
  } catch (err) {
    console.error("❌ Errore nell'invio:", err);
    return {
      statusCode: 500,
      body: `❌ Errore: ${err.message}`
    };
  }
};
