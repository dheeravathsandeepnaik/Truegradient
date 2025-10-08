import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import authMiddleware from '../middleware/authMiddleware.js';
import { get, run } from '../db.js';

const router = Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Public key for frontend checkout
// The frontend needs only the public key to open the Razorpay Checkout widget.
router.get('/key', authMiddleware, (req, res) => {
  return res.json({ key: process.env.RAZORPAY_KEY_ID || '' });
});

// Create order for payment
// The client asks the server to create an order for a certain credit amount.
// We record the order on our side to keep an audit trail (see payments table).
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    // Record order in payments table
    await run(
      'INSERT INTO payments (user_id, order_id, amount, status) VALUES (?, ?, ?, ?)',
      [req.user.id, order.id, amount, 'created']
    );
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and update credits
// Razorpay sends us (via the frontend handler) the order_id, payment_id, and signature.
// We verify the signature using our secret, mark the payment as paid, and add credits once.
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { order_id, payment_id, signature, amount } = req.body;
    
    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + '|' + payment_id)
      .digest('hex');

    if (generated_signature !== signature) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }

    // Idempotency: check if already processed
    const paymentRow = await get('SELECT * FROM payments WHERE order_id = ?', [order_id]);
    if (!paymentRow) {
      // Create a record if missing (edge case)
      await run(
        'INSERT INTO payments (user_id, order_id, payment_id, amount, status, signature) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, order_id, payment_id, amount, 'paid', signature]
      );
    } else if (paymentRow.status === 'paid') {
      const updatedUser = await get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
      return res.json({ success: true, credits: updatedUser.credits, message: 'Already processed' });
    } else {
      await run('UPDATE payments SET payment_id = ?, status = ?, signature = ? WHERE order_id = ?', [payment_id, 'paid', signature, order_id]);
    }

    // Update user credits once
    await run('UPDATE users SET credits = credits + ? WHERE id = ?', [amount, req.user.id]);
    
    // Get updated credits
    const updatedUser = await get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
    
    res.json({ 
      success: true, 
      credits: updatedUser.credits,
      message: 'Credits added successfully' 
    });
    
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
