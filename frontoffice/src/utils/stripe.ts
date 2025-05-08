import { loadStripe } from '@stripe/stripe-js';

export const redirectToCheckout = async (priceId: string) => {
  try {
    // Replace with your actual Stripe public key
    const stripePromise = loadStripe('pk_test_your_key');
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/register?success=true`,
      cancelUrl: `${window.location.origin}/pricing`,
    });

    if (error) {
      console.error('Error redirecting to checkout:', error);
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
  }
};

export const startFreeTrial = () => {
  // Redirect to registration page for free trial
  window.location.href = '/register?trial=true';
};