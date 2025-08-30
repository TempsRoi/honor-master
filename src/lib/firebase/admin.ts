import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    let serviceAccount: admin.ServiceAccount | undefined;

    if (serviceAccountString) {
        try {
            serviceAccount = JSON.parse(serviceAccountString);
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
        }
    }

    if (serviceAccount) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        adminDb = admin.firestore();
        adminAuth = admin.auth();
    } else {
        if (process.env.NODE_ENV !== 'production') {
            console.log("Firebase admin initialization skipped.");
        }
        adminDb = {} as admin.firestore.Firestore;
        adminAuth = {} as admin.auth.Auth;
    }
} catch (e: any) {
    console.error('Firebase admin initialization error', e);
    adminDb = {} as admin.firestore.Firestore;
    adminAuth = {} as admin.auth.Auth;
}


export { adminDb, adminAuth, admin as adminApp };
