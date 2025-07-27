import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { MOCK_MODE } from '@/lib/mock';

console.log("FIREBASE_SERVICE_ACCOUNT:", process.env.FIREBASE_SERVICE_ACCOUNT?.slice(0, 100));

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    if (MOCK_MODE) {
        const mockHistory = [
            { id: '1', amount: 1000, timestamp: new Date(), type: 'charge' },
            { id: '2', amount: 100, timestamp: new Date(), type: 'payment' },
            { id: '3', amount: 10, timestamp: new Date(), type: 'payment' },
        ];
        return NextResponse.json(mockHistory);
    }

    try {
        const paymentsRef = adminDb.collection('users').doc(userId).collection('payments');
        const snapshot = await paymentsRef.orderBy('timestamp', 'desc').limit(50).get();

        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        // const history = snapshot.docs.map(doc => ({
        //     id: doc.id,
        //     ...doc.data(),
        //     timestamp: doc.data().timestamp.toDate(),

        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate?.() ?? null,
        }});

        return NextResponse.json(history);

    } catch (error: any) {
        console.error("Failed to fetch payment history:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
