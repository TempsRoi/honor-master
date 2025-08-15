import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;

    if (serviceAccount) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        adminDb = admin.firestore();
        adminAuth = admin.auth();

    } else {
        // Provide dummy objects if initialization is skipped
        adminDb = {} as admin.firestore.Firestore;
        adminAuth = {} as admin.auth.Auth;
    }
} catch (e: any) {
    if (e.code !== 'app/invalid-credential') {
        console.error('Firebase admin initialization error', e);
    }
    // Provide dummy objects if initialization fails (e.g., during build)
    adminDb = {} as admin.firestore.Firestore;
    adminAuth = {} as admin.auth.Auth;
}


export { adminDb, adminAuth, admin as adminApp };
