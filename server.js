require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.static('public'));
app.use(express.json());

// Stripe Checkout
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Biglietto Italo',
        },
        unit_amount: 1500, // €15.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://genuine-platypus-99089c.netlify.app/successo.html',
    cancel_url: 'https://genuine-platypus-99089c.netlify.app/annullato.html',
    customer_email: req.body.email,
  });

  res.json({ id: session.id });
});

// Invio biglietto PDF con QR
app.post('/send-ticket', async (req, res) => {
  const { email, nome, partenza, arrivo, data, prezzo } = req.body;

  const qrData = `https://genuine-platypus-99089c.netlify.app/ticket?id=${Date.now()}`;
  const qrImage = await QRCode.toDataURL(qrData);

  const doc = new PDFDocument();
  const filePath = `ticket_${Date.now()}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('🎟️ Biglietto Italo Treni', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Nome: ${nome}`);
  doc.text(`Partenza: ${partenza}`);
  doc.text(`Arrivo: ${arrivo}`);
  doc.text(`Data: ${data}`);
  doc.text(`Prezzo: €${prezzo}`);
  doc.moveDown();
  doc.image(qrImage, { fit: [120, 120], align: 'center', valign: 'center' });
  doc.end();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: 'Il tuo biglietto Italo 🚄',
    text: 'In allegato trovi il tuo biglietto. Buon viaggio!',
    attachments: [{ filename: 'biglietto.pdf', path: filePath }],
  };

  try {
    await transporter.sendMail(mailOptions);
    fs.unlinkSync(filePath);
    res.json({ message: 'Email inviata con successo!' });
  } catch (error) {
    res.status(500).json({ error: 'Errore nell’invio email.' });
  }
});

app.listen(3000, () => console.log('🎯 Server attivo su http://localhost:3000'));
