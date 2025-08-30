import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/config';
import { adminDb } from '@/lib/firebase/admin';
import { firestore } from 'firebase-admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const buf = await req.text();
    const sig = headers().get('Stripe-Signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Error message: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
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
                
                // Use a transaction to safely update the balance
                await adminDb.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists) {
                        // This case should ideally not happen if user is created on first login
                        // But as a fallback, we can create a new profile
                        const newUserProfile = {
                            uid: userId,
                            balance: amount,
                            totalPaid: 0, // totalPaid should be 0 on creation
                        };
                        transaction.set(userRef, newUserProfile);
                    } else {
                        const currentData = userDoc.data()!;
                        const newBalance = (currentData.balance || 0) + amount;
                        transaction.update(userRef, { 
                            balance: newBalance,
                        });
                    }

                    // Record the charge in payment history
                    const chargeRef = userRef.collection('payments').doc();
                    transaction.set(chargeRef, {
                        amount: amount,
                        timestamp: firestore.FieldValue.serverTimestamp(),
                        type: 'charge',
                        stripeSessionId: session.id,
                    });
                });

                console.log(`Successfully processed charge of ${amount} for user ${userId}`);

            } catch (dbError) {
                console.error('Firestore update failed:', dbError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
            break;
        default:
            console.warn(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}