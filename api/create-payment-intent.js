// POST /api/create-payment-intent
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: req.body.amountCents, // e.g. 21500 = $215.00
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { invoiceNumber: req.body.invoiceNumber }
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};