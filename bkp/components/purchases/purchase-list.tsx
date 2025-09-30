"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Purchase } from "@/types/database"

interface PurchaseListProps {
  onAddPurchase: () => void
}

export function PurchaseList({ onAddPurchase }: PurchaseListProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const mockData: Purchase[] = [
        {
          id: "1",
          supplierId: "1",
          supplierName: "Distribuidora ABC Ltda",
          items: [
            { productId: "1", productName: "Produto A", quantity: 100, unitPrice: 50, total: 5000 },
            { productId: "2", productName: "Produto B", quantity: 50, unitPrice: 80, total: 4000 },
          ],
          subtotal: 9000,
          discount: 0,
          total: 9000,
          status: "recebida",
          expectedDate: new Date("2025-01-15"),
          receivedDate: new Date("2025-01-14"),
          createdAt: new Date("2025-01-10"),
          updatedAt: new Date("2025-01-14"),
          createdBy: "admin",
        },
        {
          id: "2",
          supplierId: "2",
          supplierName: "Fornecedor XYZ S.A.",
          items: [{ productId: "3", productName: "Produto C", quantity: 200, unitPrice: 30, total: 6000 }],
          subtotal: 6000,
          discount: 300,
          total: 5700,
          status: "pendente",
          expectedDate: new Date("2025-02-01"),
          createdAt: new Date("2025-01-20"),
          updatedAt: new Date("2025-01-20"),
          createdBy: "admin",
        },
      ]
      setPurchases(mockData)
    } catch (error) {
      console.error("Error fetching purchases:", error)
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const getStatusBadge = (status: Purchase["status"]) => {
    switch (status) {
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>
      case "recebida":
        return <Badge className="bg-chart-1">Recebida</Badge>
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pedidos de Compra</CardTitle>
          <Button onClick={onAddPurchase}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Compra
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por fornecedor ou número do pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="recebida">Recebida</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Data Prevista</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma compra encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">#{purchase.id}</TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>{purchase.expectedDate ? formatDate(purchase.expectedDate) : "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(purchase.total)}</TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {purchase.status === "pendente" && (
                            <Button variant="ghost" size="sm">
                              <Package className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
