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
import { setCookie, deleteCookie } from "@/lib/cookies"
import {
  getAuthErrorMessage,
  validateEmail as validateEmailFormat,
  validatePassword as validatePasswordFormat,
  validateDisplayName,
} from "@/lib/auth-errors"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          setCookie("firebase-token", token, 3600)

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
        deleteCookie("firebase-token")
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase não está configurado")
      }

      const emailValidation = validateEmailFormat(email)
      if (!emailValidation.valid) {
        throw new Error(emailValidation.error)
      }

      const passwordValidation = validatePasswordFormat(password)
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error)
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as User
        if (!userData.isActive) {
          await signOut(auth)
          throw new Error("Usuário inativo. Contate o administrador.")
        }
      }
    } catch (error: any) {
      if (error.code) {
        throw new Error(getAuthErrorMessage(error.code))
      } else if (error.message) {
        throw error
      } else {
        throw new Error("Erro ao fazer login")
      }
    }
  }

  const register = async (email: string, password: string, displayName: string, role: User["role"] = "vendedor") => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase não está configurado")
      }

      const emailValidation = validateEmailFormat(email)
      if (!emailValidation.valid) {
        throw new Error(emailValidation.error)
      }

      const passwordValidation = validatePasswordFormat(password)
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error)
      }

      const nameValidation = validateDisplayName(displayName)
      if (!nameValidation.valid) {
        throw new Error(nameValidation.error)
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName.trim(),
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }

      await setDoc(doc(db, "users", firebaseUser.uid), newUser)
      return newUser
    } catch (error: any) {
      if (error.code) {
        throw new Error(getAuthErrorMessage(error.code))
      } else if (error.message) {
        throw error
      } else {
        throw new Error("Erro ao registrar usuário")
      }
    }
  }

  const logout = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase não está configurado")
      }

      deleteCookie("firebase-token")
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
