import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
}

const adminApp: App = getApps().length === 0 ? initializeApp(firebaseAdminConfig, "admin") : getApps()[0]
const adminAuth: Auth = getAuth(adminApp)
const adminDb: Firestore = getFirestore(adminApp)

export { adminApp, adminAuth, adminDb }
