"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SalesMetrics {
  totalSales: number
  totalRevenue: number
  averageTicket: number
  totalCustomers: number
  salesGrowth: number
  revenueGrowth: number
}

export function SalesOverview() {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    totalCustomers: 0,
    salesGrowth: 0,
    revenueGrowth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesMetrics()
  }, [])

  const fetchSalesMetrics = async () => {
    console.log("[REPORTS FIREBASE] Buscando métricas de vendas")

    if (!db) {
      console.error("[REPORTS FIREBASE ERROR] Firebase não configurado")
      setLoading(false)
      return
    }

    try {
      const salesRef = collection(db, "sales")
      const salesSnapshot = await getDocs(salesRef)

      let totalRevenue = 0
      let totalSales = salesSnapshot.size
      const uniqueCustomers = new Set()

      salesSnapshot.forEach((doc) => {
        const data = doc.data()
        totalRevenue += data.total || 0
        if (data.customerId) {
          uniqueCustomers.add(data.customerId)
        }
      })

      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

      console.log(`[REPORTS FIREBASE SUCCESS] ${totalSales} vendas, R$ ${totalRevenue.toFixed(2)}`)

      setMetrics({
        totalSales,
        totalRevenue,
        averageTicket,
        totalCustomers: uniqueCustomers.size,
        salesGrowth: 0,
        revenueGrowth: 0,
      })
    } catch (error: any) {
      console.error("[REPORTS FIREBASE ERROR] Erro ao buscar métricas:", error)
      setMetrics({
        totalSales: 0,
        totalRevenue: 0,
        averageTicket: 0,
        totalCustomers: 0,
        salesGrowth: 0,
        revenueGrowth: 0,
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

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          <ShoppingCart className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalSales.toLocaleString()}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant={metrics.salesGrowth > 0 ? "default" : "destructive"} className="text-xs">
              {formatPercentage(metrics.salesGrowth)}
            </Badge>
            <span>vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant={metrics.revenueGrowth > 0 ? "default" : "destructive"} className="text-xs">
              {formatPercentage(metrics.revenueGrowth)}
            </Badge>
            <span>vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageTicket)}</div>
          <p className="text-xs text-muted-foreground">Por transação</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <Users className="h-4 w-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Clientes únicos</p>
        </CardContent>
      </Card>
    </div>
  )
}
