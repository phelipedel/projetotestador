"use client"

import { useState, useEffect } from "react"
import { Search, Menu, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MobileProductCard } from "@/components/mobile/mobile-product-card"
import { MobileCart } from "@/components/mobile/mobile-cart"
import { useMobilePDV } from "@/hooks/use-mobile-pdv"
import type { Product } from "@/types/database"

export default function MobilePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")

  const { cart, total, isProcessing, addToCart, quickSale, processSale, removeFromCart, clearCart } = useMobilePDV()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const handleQuickSale = async (product: Product, paymentMethod: string) => {
    try {
      await quickSale(product, paymentMethod)
      setSuccessMessage(`Venda de ${product.name} realizada com sucesso!`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Quick sale error:", error)
      alert("Erro ao processar venda rápida")
    }
  }

  const handleProcessSale = async (paymentMethod: string) => {
    try {
      await processSale(paymentMethod)
      setSuccessMessage("Venda realizada com sucesso!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Sale processing error:", error)
      alert("Erro ao processar venda")
    }
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary">Fire ERP</h1>
            <p className="text-xs text-muted-foreground">Vendas Rápidas</p>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Mobile</span>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-4 mt-4">
          <Card className="bg-accent text-accent-foreground">
            <CardContent className="p-3">
              <p className="text-sm text-center">{successMessage}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            size="sm"
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <MobileProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onQuickSale={handleQuickSale}
            />
          ))
        )}
      </div>

      {/* Mobile Cart */}
      <MobileCart
        cart={cart}
        total={total}
        onRemoveItem={removeFromCart}
        onProcessSale={handleProcessSale}
        onClearCart={clearCart}
        isProcessing={isProcessing}
      />
    </div>
  )
}
