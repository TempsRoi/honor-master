import { NextResponse } from 'next/server';

/**
 * Handles POST requests to the Stripe webhook endpoint.
 * This is a simplified version for debugging purposes.
 */
export async function POST(req: Request) {
  console.log("Simplified webhook received a POST request.");
  // Immediately return a success response.
  return NextResponse.json({ status: 'success', message: 'Webhook received' });
}
