"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface InventoryMetrics {
  totalProducts: number
  totalStock: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  topCategories: Array<{ name: string; count: number; percentage: number }>
}

export function InventoryOverview() {
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    topCategories: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryMetrics()
  }, [])

  const fetchInventoryMetrics = async () => {
    console.log("[INVENTORY FIREBASE] Buscando métricas de estoque")

    if (!db) {
      console.error("[INVENTORY FIREBASE ERROR] Firebase não configurado")
      setLoading(false)
      return
    }

    try {
      const productsRef = collection(db, "products")
      const snapshot = await getDocs(productsRef)

      let totalStock = 0
      let lowStockItems = 0
      let outOfStockItems = 0
      let totalValue = 0
      const categoryCount: Record<string, number> = {}

      snapshot.forEach((doc) => {
        const product = doc.data()
        const stock = product.stock || 0
        const minStock = product.minStock || 5
        const price = product.price || 0

        totalStock += stock
        totalValue += stock * price

        if (stock === 0) {
          outOfStockItems++
        } else if (stock <= minStock) {
          lowStockItems++
        }

        const category = product.category || "Sem categoria"
        categoryCount[category] = (categoryCount[category] || 0) + 1
      })

      const totalProducts = snapshot.size
      const topCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      console.log(`[INVENTORY FIREBASE SUCCESS] ${totalProducts} produtos, ${totalStock} unidades`)

      setMetrics({
        totalProducts,
        totalStock,
        lowStockItems,
        outOfStockItems,
        totalValue,
        topCategories,
      })
    } catch (error: any) {
      console.error("[INVENTORY FIREBASE ERROR] Erro ao buscar métricas:", error)
      setMetrics({
        totalProducts: 0,
        totalStock: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0,
        topCategories: [],
      })
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unidades em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{metrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Produtos com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Produtos esgotados</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Valor Total do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatCurrency(metrics.totalValue)}</div>
            <p className="text-sm text-muted-foreground mt-2">Valor total dos produtos em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principais Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topCategories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{category.count} produtos</span>
                    <Badge variant="secondary">{category.percentage}%</Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
