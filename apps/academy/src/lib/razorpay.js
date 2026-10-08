// Opens the Razorpay checkout for a server-raised order. Confirmation is
// webhook-based on apps/server (not a client-submitted signature check), so
// this only resolves once the user has completed the checkout modal — the
// caller is responsible for polling access until the webhook lands.

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function getRazorpayCtor() {
  return window.Razorpay;
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (getRazorpayCtor()) return resolve(true);

    const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT_URL}"]`);
    const script = existing || document.createElement('script');

    script.onload = () => resolve(Boolean(getRazorpayCtor()));
    script.onerror = () => resolve(false);

    if (!existing) {
      script.src = CHECKOUT_SCRIPT_URL;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

// Resolves true once the learner completes payment in the modal, false if
// they dismiss it without paying.
export async function openRazorpayCheckout({ keyId, orderId, amount, description, prefill }) {
  const loaded = await loadRazorpayScript();
  const Razorpay = getRazorpayCtor();
  if (!loaded || !Razorpay) {
    throw new Error('Could not load the payment gateway. Please refresh the page and try again.');
  }

  return new Promise((resolve) => {
    const checkout = new Razorpay({
      key: keyId,
      amount,
      currency: 'INR',
      name: 'PMC Global Academy',
      description,
      order_id: orderId,
      prefill,
      theme: { color: '#385246' },
      handler: () => resolve(true),
      modal: { ondismiss: () => resolve(false) },
    });
    checkout.open();
  });
}
