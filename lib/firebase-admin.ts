import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

if (projectId && clientEmail && privateKey) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }

    adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig, "admin") : getApps()[0]
    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
  }
}

export { adminApp, adminAuth, adminDb }
