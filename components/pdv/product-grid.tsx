"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/database"

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    console.log("[PDV FIREBASE] Buscando produtos para PDV")
    setLoading(true)

    if (!db) {
      console.error("[PDV FIREBASE ERROR] Firebase não está configurado!")
      toast({
        title: "Erro",
        description: "Firebase não está configurado.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const productsRef = collection(db, "products")
      const querySnapshot = await getDocs(productsRef)

      console.log(`[PDV FIREBASE] ${querySnapshot.size} produtos encontrados no total`)

      const productsData: Product[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const stock = data.stock || 0

        if (stock > 0) {
          productsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Product)
        }
      })

      productsData.sort((a, b) => {
        if (b.stock !== a.stock) {
          return b.stock - a.stock
        }
        return a.name.localeCompare(b.name)
      })

      console.log(`[PDV FIREBASE SUCCESS] ${productsData.length} produtos disponíveis para venda`)
      setProducts(productsData)

      if (productsData.length === 0) {
        toast({
          title: "Nenhum produto disponível",
          description: "Cadastre produtos com estoque para iniciar as vendas.",
        })
      }
    } catch (error: any) {
      console.error("[PDV FIREBASE ERROR] Erro ao buscar produtos:", error)
      console.error("[PDV FIREBASE ERROR] Código do erro:", error.code)
      console.error("[PDV FIREBASE ERROR] Mensagem do erro:", error.message)

      toast({
        title: "Erro ao carregar produtos",
        description: error.message || "Não foi possível carregar os produtos.",
        variant: "destructive",
      })
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

  const categories = Array.from(new Set(products.map((p) => p.category)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos por nome, código ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input bg-card rounded-md"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                  <Badge variant={product.stock > product.minStock ? "secondary" : "destructive"}>
                    Estoque: {product.stock}
                  </Badge>
                </div>

                <Button onClick={() => onAddToCart(product)} disabled={product.stock <= 0} className="w-full" size="sm">
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  )
}
