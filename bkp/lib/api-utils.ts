import type { NextRequest } from "next/server"
import { adminAuth } from "./firebase-admin"
import { logger } from "./logger"

export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No authorization token provided")
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await adminAuth.verifyIdToken(token)

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "vendedor",
    }
  } catch (error: any) {
    logger.error("AUTH_VERIFICATION_FAILED", { error: error.message }, undefined, getClientIP(request))
    throw new Error("Invalid or expired token")
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
