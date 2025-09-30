import type { NextRequest } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAuth, getClientIP, createApiResponse, createErrorResponse } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import type { Customer } from "@/types/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)

    const customersRef = collection(db, "customers")
    const q = query(customersRef, where("isActive", "==", true), orderBy("name"))
    const snapshot = await getDocs(q)

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    logger.info("CUSTOMERS_FETCHED", { count: customers.length }, user.uid, ip)
    return createApiResponse(customers)
  } catch (error: any) {
    logger.error("CUSTOMERS_FETCH_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 401)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)
    const body = await request.json()

    const customerData: Omit<Customer, "id"> = {
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      document: body.document || "",
      address: body.address || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
    }

    const docRef = await addDoc(collection(adminDb, "customers"), {
      ...customerData,
      createdAt: Timestamp.fromDate(customerData.createdAt),
      updatedAt: Timestamp.fromDate(customerData.updatedAt),
    })

    logger.info("CUSTOMER_CREATED", { customerId: docRef.id, customerName: customerData.name }, user.uid, ip)
    return createApiResponse({ id: docRef.id, ...customerData }, 201)
  } catch (error: any) {
    logger.error("CUSTOMER_CREATE_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 400)
  }
}
