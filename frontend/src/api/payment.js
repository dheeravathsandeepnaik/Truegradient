import api from './axios.js';

export async function getRazorpayKey() {
  const res = await api.get('/api/payment/key');
  return res.data.key;
}

export async function createOrder(amount) {
  const res = await api.post('/api/payment/create-order', { amount });
  return res.data; // order
}

export async function verifyPayment({ order_id, payment_id, signature, amount }) {
  const res = await api.post('/api/payment/verify-payment', {
    order_id,
    payment_id,
    signature,
    amount,
  });
  return res.data;
}

export async function fetchCredits() {
  const res = await api.get('/api/user/credits');
  return res.data.credits;
}
