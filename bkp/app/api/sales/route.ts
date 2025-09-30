import type { NextRequest } from "next/server"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, runTransaction, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAuth, getClientIP, createApiResponse, createErrorResponse } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import type { Sale, InventoryMovement } from "@/types/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)

    const salesRef = collection(db, "sales")
    const q = query(salesRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const sales = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    logger.info("SALES_FETCHED", { count: sales.length }, user.uid, ip)
    return createApiResponse(sales)
  } catch (error: any) {
    logger.error("SALES_FETCH_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 401)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)
    const body = await request.json()

    // Run transaction to ensure stock consistency
    const result = await runTransaction(adminDb, async (transaction) => {
      // Verify stock for all items
      for (const item of body.items) {
        const productRef = doc(adminDb, "products", item.productId)
        const productDoc = await transaction.get(productRef)

        if (!productDoc.exists()) {
          throw new Error(`Product ${item.productId} not found`)
        }

        const product = productDoc.data()
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }
      }

      const saleData: Omit<Sale, "id"> = {
        customerId: body.customerId || null,
        customerName: body.customerName || "",
        items: body.items,
        subtotal: Number.parseFloat(body.subtotal),
        discount: Number.parseFloat(body.discount) || 0,
        total: Number.parseFloat(body.total),
        paymentMethod: body.paymentMethod,
        status: "concluida",
        notes: body.notes || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        cashierId: user.uid,
      }

      // Create sale
      const saleRef = await addDoc(collection(adminDb, "sales"), {
        ...saleData,
        createdAt: Timestamp.fromDate(saleData.createdAt),
        updatedAt: Timestamp.fromDate(saleData.updatedAt),
      })

      // Update stock and create inventory movements
      for (const item of body.items) {
        const productRef = doc(adminDb, "products", item.productId)
        const productDoc = await transaction.get(productRef)
        const product = productDoc.data()

        // Update product stock
        transaction.update(productRef, {
          stock: product.stock - item.quantity,
          updatedAt: Timestamp.now(),
        })

        // Create inventory movement
        const movementData: Omit<InventoryMovement, "id"> = {
          productId: item.productId,
          productName: item.productName,
          type: "saida",
          quantity: item.quantity,
          reason: "Venda",
          relatedSaleId: saleRef.id,
          createdAt: new Date(),
          createdBy: user.uid,
        }

        await addDoc(collection(adminDb, "inventory_movements"), {
          ...movementData,
          createdAt: Timestamp.fromDate(movementData.createdAt),
        })
      }

      return { id: saleRef.id, ...saleData }
    })

    logger.info(
      "SALE_CREATED",
      {
        saleId: result.id,
        total: result.total,
        itemsCount: result.items.length,
      },
      user.uid,
      ip,
    )

    return createApiResponse(result, 201)
  } catch (error: any) {
    logger.error("SALE_CREATE_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 400)
  }
}
