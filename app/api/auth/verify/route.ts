import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase Admin não configurado" }, { status: 503 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const decodedToken = await adminAuth.verifyIdToken(token)

    if (!decodedToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email
    }, { status: 200 })
  } catch (error: any) {
    console.error("Error verifying token:", error)

    if (error.code === "auth/id-token-expired") {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 })
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    return NextResponse.json({ error: "Erro ao verificar token" }, { status: 500 })
  }
}