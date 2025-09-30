"use client"

import { useState, useEffect } from "react"
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
    try {
      // Simulate API call - replace with actual API
      const mockData: TopProduct[] = [
        { id: "1", name: "Smartphone XYZ", category: "Eletrônicos", quantitySold: 145, revenue: 72500, trend: "up" },
        { id: "2", name: "Camiseta Premium", category: "Roupas", quantitySold: 234, revenue: 23400, trend: "up" },
        { id: "3", name: "Notebook ABC", category: "Eletrônicos", quantitySold: 67, revenue: 67000, trend: "stable" },
        { id: "4", name: "Tênis Esportivo", category: "Esportes", quantitySold: 123, revenue: 36900, trend: "down" },
        { id: "5", name: "Livro Best Seller", category: "Livros", quantitySold: 189, revenue: 9450, trend: "up" },
      ]
      setProducts(mockData)
    } catch (error) {
      console.error("Error fetching top products:", error)
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
