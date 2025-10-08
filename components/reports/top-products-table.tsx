"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface TopProduct {
  id: string
  name: string
  category: string
  quantitySold: number
  revenue: number
  trend: "up" | "down" | "stable"
}

export function TopProductsTable() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    console.log("[REPORTS FIREBASE] Buscando produtos mais vendidos")

    if (!db) {
      console.error("[REPORTS FIREBASE ERROR] Firebase não configurado")
      setLoading(false)
      return
    }

    try {
      const salesRef = collection(db, "sales")
      const salesSnapshot = await getDocs(salesRef)

      const productStats: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {}

      salesSnapshot.forEach((doc) => {
        const sale = doc.data()
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item: any) => {
            const productId = item.productId || item.name
            if (!productStats[productId]) {
              productStats[productId] = {
                name: item.productName || item.name,
                category: item.category || "Sem categoria",
                quantity: 0,
                revenue: 0,
              }
            }
            productStats[productId].quantity += item.quantity || 0
            productStats[productId].revenue += item.total || item.price * item.quantity || 0
          })
        }
      })

      const topProducts: TopProduct[] = Object.entries(productStats)
        .map(([id, stats]) => ({
          id,
          name: stats.name,
          category: stats.category,
          quantitySold: stats.quantity,
          revenue: stats.revenue,
          trend: "stable" as const,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      console.log(`[REPORTS FIREBASE SUCCESS] ${topProducts.length} produtos principais encontrados`)
      setProducts(topProducts)
    } catch (error: any) {
      console.error("[REPORTS FIREBASE ERROR] Erro ao buscar produtos:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getTrendBadge = (trend: TopProduct["trend"]) => {
    switch (trend) {
      case "up":
        return <Badge className="bg-chart-1">↑ Alta</Badge>
      case "down":
        return <Badge variant="destructive">↓ Baixa</Badge>
      case "stable":
        return <Badge variant="secondary">→ Estável</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
        <CardDescription>Top 5 produtos por receita no período</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd. Vendida</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{product.quantitySold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                  <TableCell className="text-center">{getTrendBadge(product.trend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
