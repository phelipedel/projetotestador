"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryOverview } from "@/components/inventory/inventory-overview"
import { ProductList } from "@/components/inventory/product-list"
import { AddProductModal } from "@/components/inventory/add-product-modal"
import { StockAlerts } from "@/components/inventory/stock-alerts"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/database"

export default function ProdutosPage() {
  const router = useRouter()
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProductSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowAddProduct(true)
  }

  const handleCloseModal = () => {
    setShowAddProduct(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestão de Produtos</h1>
            <p className="text-sm text-muted-foreground">Controle completo do inventário e catálogo</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Inventory Overview */}
          <InventoryOverview key={refreshKey} />

          {/* Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="alerts">Alertas de Estoque</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <ProductList
                key={refreshKey}
                onAddProduct={() => setShowAddProduct(true)}
                onEditProduct={handleEditProduct}
              />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <StockAlerts key={refreshKey} />
            </TabsContent>

            <TabsContent value="movements" className="space-y-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Movimentações de estoque em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={showAddProduct}
        onClose={handleCloseModal}
        onSuccess={handleProductSuccess}
        product={editingProduct}
      />
    </div>
  )
}
