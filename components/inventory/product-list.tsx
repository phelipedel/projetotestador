"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Plus, CreditCard as Edit, Trash2, Package, TriangleAlert as AlertTriangle, FileDown, FileSpreadsheet } from "lucide-react"
import { exportToPdf, exportToCsv } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { FirebaseStatus } from "@/components/ui/firebase-status"
import type { Product } from "@/types/database"

interface ProductListProps {
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
}

export function ProductList({ onAddProduct, onEditProduct }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter, stockFilter])

  const fetchProducts = async () => {
    console.log("[FIREBASE] Iniciando busca de produtos")
    setLoading(true)

    if (!db) {
      console.error("[FIREBASE ERROR] Firebase não está configurado!")
      toast({
        title: "Erro",
        description: "Firebase não está configurado. Verifique as variáveis de ambiente.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      console.log("[FIREBASE] Buscando coleção 'products'")
      const productsRef = collection(db, "products")
      const q = query(productsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      console.log(`[FIREBASE SUCCESS] ${querySnapshot.size} produtos encontrados`)

      const productsData: Product[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log("[FIREBASE] Produto:", doc.id, data)
        productsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product)
      })

      setProducts(productsData)
    } catch (error: any) {
      console.error("[FIREBASE ERROR] Erro ao buscar produtos:", error)
      console.error("[FIREBASE ERROR] Código do erro:", error.code)
      console.error("[FIREBASE ERROR] Mensagem do erro:", error.message)
      console.error("[FIREBASE ERROR] Stack trace:", error.stack)

      toast({
        title: "Erro ao carregar produtos",
        description: error.message || "Ocorreu um erro ao carregar os produtos.",
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
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.includes(searchTerm),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    if (stockFilter !== "all") {
      if (stockFilter === "low") {
        filtered = filtered.filter((product) => product.stock <= product.minStock && product.stock > 0)
      } else if (stockFilter === "out") {
        filtered = filtered.filter((product) => product.stock === 0)
      } else if (stockFilter === "good") {
        filtered = filtered.filter((product) => product.stock > product.minStock)
      }
    }

    setFilteredProducts(filtered)
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return
    }

    console.log("[FIREBASE] Iniciando exclusão do produto:", id)

    if (!db) {
      console.error("[FIREBASE ERROR] Firebase não está configurado!")
      toast({
        title: "Erro",
        description: "Firebase não está configurado.",
        variant: "destructive",
      })
      return
    }

    try {
      const productRef = doc(db, "products", id)
      await deleteDoc(productRef)
      console.log("[FIREBASE SUCCESS] Produto excluído com sucesso!")

      setProducts(products.filter((p) => p.id !== id))

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      })
    } catch (error: any) {
      console.error("[FIREBASE ERROR] Erro ao excluir produto:", error)
      console.error("[FIREBASE ERROR] Código do erro:", error.code)
      console.error("[FIREBASE ERROR] Mensagem do erro:", error.message)

      toast({
        title: "Erro ao excluir produto",
        description: error.message || "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      })
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Sem estoque", variant: "destructive" as const, icon: AlertTriangle }
    }
    if (product.stock <= product.minStock) {
      return { label: "Estoque baixo", variant: "secondary" as const, icon: AlertTriangle }
    }
    return { label: "Em estoque", variant: "default" as const, icon: Package }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle>Catálogo de Produtos</CardTitle>
              <CardDescription>Gerencie seu inventário de produtos</CardDescription>
            </div>
            <FirebaseStatus />
          </div>
          <div className="flex gap-2">
            {selectedProducts.length > 0 && (
              <Button variant="outline" size="sm">
                Ações em lote ({selectedProducts.length})
              </Button>
            )}
            <Button onClick={onAddProduct} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos por nome, SKU ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estoques</SelectItem>
              <SelectItem value="good">Em estoque</SelectItem>
              <SelectItem value="low">Estoque baixo</SelectItem>
              <SelectItem value="out">Sem estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="animate-pulse h-4 bg-muted rounded w-full"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhum produto encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const StatusIcon = stockStatus.icon
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {product.stock} {product.unit}
                          </div>
                          <div className="text-muted-foreground">Min: {product.minStock}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
