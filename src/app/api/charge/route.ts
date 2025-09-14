import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const { amount, userId } = await req.json();
    const origin = headers().get('origin') || 'http://localhost:3000';

    if (!userId || !amount) {
        return NextResponse.json({ error: 'User ID and amount are required.' }, { status: 400 });
    }

    // Check for mock mode using environment variable on the server-side
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
        // In mock mode, we just pretend a charge was successful.
        return NextResponse.json({ sessionId: 'cs_test_mock' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Honor Charge',
                            description: `Add ${amount} JPY to your balance.`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/`,
            cancel_url: `${origin}/charge?charge_canceled=true`,
            metadata: {
                userId: userId,
            },
        });

        return NextResponse.json({ sessionId: session.id });

    } catch (error: any) {
        console.error("Stripe session creation failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
