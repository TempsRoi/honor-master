import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import { adminDb } from '@/lib/firebase/admin';
import { firestore } from 'firebase-admin';

// 必ず .env に設定してください
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Read raw body from Request
 */
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const rawBody = await buffer(req.body!);
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const amount = session.amount_total;

      if (!userId || amount === null) {
        console.error('Webhook Error: Missing userId or amount in metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      try {
        const userRef = adminDb.collection('users').doc(userId);

        await adminDb.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists) {
            const newUserProfile = {
              uid: userId,
              balance: amount,
              totalPaid: 0,
            };
            transaction.set(userRef, newUserProfile);
          } else {
            const currentData = userDoc.data()!;
            const newBalance = (currentData.balance || 0) + amount;
            transaction.update(userRef, {
              balance: newBalance,
            });
          }

          const chargeRef = userRef.collection('payments').doc();
          transaction.set(chargeRef, {
            amount,
            timestamp: firestore.FieldValue.serverTimestamp(),
            type: 'charge',
            stripeSessionId: session.id,
          });
        });

        console.log(`✅ Charge processed: ¥${amount} for user ${userId}`);
      } catch (dbError) {
        console.error('❌ Firestore update failed:', dbError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      break;

    default:
      console.warn(`⚠️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
