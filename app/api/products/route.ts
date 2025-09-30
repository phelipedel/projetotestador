import type { NextRequest } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { adminDb } from "@/lib/firebase-admin"
import { verifyAuth, getClientIP, createApiResponse, createErrorResponse } from "@/lib/api-utils"
import { logger } from "@/lib/logger"
import type { Product } from "@/types/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)

    const productsRef = collection(db, "products")
    const q = query(productsRef, where("isActive", "==", true), orderBy("name"))
    const snapshot = await getDocs(q)

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    logger.info("PRODUCTS_FETCHED", { count: products.length }, user.uid, ip)
    return createApiResponse(products)
  } catch (error: any) {
    logger.error("PRODUCTS_FETCH_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 401)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const ip = getClientIP(request)
    const body = await request.json()

    const productData: Omit<Product, "id"> = {
      name: body.name,
      description: body.description || "",
      barcode: body.barcode || "",
      sku: body.sku,
      category: body.category,
      price: Number.parseFloat(body.price),
      costPrice: Number.parseFloat(body.costPrice),
      stock: Number.parseInt(body.stock) || 0,
      minStock: Number.parseInt(body.minStock) || 0,
      unit: body.unit || "un",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
    }

    const docRef = await addDoc(collection(adminDb, "products"), {
      ...productData,
      createdAt: Timestamp.fromDate(productData.createdAt),
      updatedAt: Timestamp.fromDate(productData.updatedAt),
    })

    logger.info("PRODUCT_CREATED", { productId: docRef.id, productName: productData.name }, user.uid, ip)
    return createApiResponse({ id: docRef.id, ...productData }, 201)
  } catch (error: any) {
    logger.error("PRODUCT_CREATE_FAILED", { error: error.message }, undefined, getClientIP(request))
    return createErrorResponse(error.message, 400)
  }
}
