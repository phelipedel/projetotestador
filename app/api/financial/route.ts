import type { NextRequest } from "next/server"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAuth, getClientIP, createApiResponse, createErrorResponse } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import type { FinancialTransaction } from "@/types/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let q = query(collection(db, "financial_transactions"), orderBy("date", "desc"))

    if (type) {
      q = query(q, where("type", "==", type))
    }

    const snapshot = await getDocs(q)
    let transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      transactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date)
        return transactionDate >= start && transactionDate <= end
      })
    }

    logger.info(
      "FINANCIAL_TRANSACTIONS_FETCHED",
      {
        count: transactions.length,
        type,
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : "all",
      },
      user.uid,
      ip,
    )

    return createApiResponse(transactions)
  } catch (error: any) {
    logger.error("FINANCIAL_TRANSACTIONS_FETCH_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 401)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)
    const body = await request.json()

    const transactionData: Omit<FinancialTransaction, "id"> = {
      type: body.type,
      category: body.category,
      description: body.description,
      amount: Number.parseFloat(body.amount),
      date: new Date(body.date),
      paymentMethod: body.paymentMethod || "",
      status: body.status || "pago",
      relatedSaleId: body.relatedSaleId || null,
      relatedPurchaseId: body.relatedPurchaseId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
    }

    const docRef = await addDoc(collection(adminDb, "financial_transactions"), {
      ...transactionData,
      date: Timestamp.fromDate(transactionData.date),
      createdAt: Timestamp.fromDate(transactionData.createdAt),
      updatedAt: Timestamp.fromDate(transactionData.updatedAt),
    })

    logger.info(
      "FINANCIAL_TRANSACTION_CREATED",
      {
        transactionId: docRef.id,
        type: transactionData.type,
        amount: transactionData.amount,
      },
      user.uid,
      ip,
    )

    return createApiResponse({ id: docRef.id, ...transactionData }, 201)
  } catch (error: any) {
    logger.error("FINANCIAL_TRANSACTION_CREATE_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 400)
  }
}
