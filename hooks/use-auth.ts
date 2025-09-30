"use client"

import { useEffect, useState } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/types/user"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            setUser(userData)
          } else {
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || "",
              role: "vendedor",
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
            }
            await setDoc(doc(db, "users", firebaseUser.uid), newUser)
            setUser(newUser)
          }
        } catch (error) {
          console.error("[v0] Error fetching user data:", error)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, displayName: string, role: User["role"] = "vendedor") => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }

      await setDoc(doc(db, "users", firebaseUser.uid), newUser)
      return newUser
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    firebaseUser,
    loading,
    login,
    register,
    logout,
  }
}
