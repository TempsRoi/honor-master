import { NextResponse } from 'next/server';
import { firestore } from 'firebase-admin';
import { adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types';
import { MOCK_MODE } from '@/lib/mock';
import { headers } from 'next/headers';

// This is a placeholder for a real auth check, e.g., verifying a JWT
async function isAuthenticated(userId: string): Promise<boolean> {
    // In a real app, you'd verify the token from the Authorization header
    // For now, we'll just check if the userId exists.
    const headersList = headers();
    const authorization = headersList.get('Authorization');
    // A real implementation would be:
    // const token = authorization?.split('Bearer ')[1];
    // const decodedToken = await adminAuth.verifyIdToken(token);
    // return decodedToken.uid === userId;
    return !!userId;
}

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: 'User ID and amount are required.' }, { status: 400 });
    }
    
    // Basic auth check
    if (!(await isAuthenticated(userId))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return NextResponse.json({ success: true, message: 'Mock payment successful.' });
    }

    const userRef = adminDb.collection('users').doc(userId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found.');
      }

      const userProfile = userDoc.data() as UserProfile;

      if (userProfile.balance < amount) {
        throw new Error('Insufficient balance.');
      }

      const newBalance = userProfile.balance - amount;
      const newTotalPaid = (userProfile.totalPaid || 0) + amount;

      transaction.update(userRef, {
        balance: newBalance,
        totalPaid: newTotalPaid,
      });

      const paymentRef = userRef.collection('payments').doc();
      transaction.set(paymentRef, {
        amount,
        timestamp: firestore.FieldValue.serverTimestamp(),
        type: 'payment',
      });

      return { newBalance, newTotalPaid };
    });

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error('Payment API error:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}
