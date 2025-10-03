"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/database"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: Product | null
}

const productCategories = [
  "Eletrônicos",
  "Roupas",
  "Casa & Jardim",
  "Esportes",
  "Livros",
  "Beleza",
  "Automotivo",
  "Brinquedos",
  "Alimentação",
  "Outros",
]

const units = ["un", "kg", "g", "l", "ml", "m", "cm", "pç"]

export function AddProductModal({ isOpen, onClose, onSuccess, product }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    price: product?.price?.toString() || "",
    costPrice: product?.costPrice?.toString() || "",
    stock: product?.stock?.toString() || "",
    minStock: product?.minStock?.toString() || "",
    unit: product?.unit || "un",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("[FIREBASE] Iniciando salvar produto:", formData)

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
      const productData = {
        name: formData.name,
        description: formData.description || null,
        sku: formData.sku,
        barcode: formData.barcode || null,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        costPrice: formData.costPrice ? Number.parseFloat(formData.costPrice) : 0,
        stock: Number.parseInt(formData.stock),
        minStock: Number.parseInt(formData.minStock),
        unit: formData.unit,
        updatedAt: serverTimestamp(),
      }

      if (product?.id) {
        console.log("[FIREBASE] Atualizando produto com ID:", product.id)
        const productRef = doc(db, "products", product.id)
        await updateDoc(productRef, productData)
        console.log("[FIREBASE SUCCESS] Produto atualizado com sucesso!")
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        })
      } else {
        console.log("[FIREBASE] Criando novo produto")
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        })
        console.log("[FIREBASE SUCCESS] Produto criado com ID:", docRef.id)
        toast({
          title: "Sucesso",
          description: "Produto cadastrado com sucesso!",
        })
      }

      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error("[FIREBASE ERROR] Erro ao salvar produto:", error)
      console.error("[FIREBASE ERROR] Código do erro:", error.code)
      console.error("[FIREBASE ERROR] Mensagem do erro:", error.message)
      console.error("[FIREBASE ERROR] Stack trace:", error.stack)

      toast({
        title: "Erro ao salvar produto",
        description: error.message || "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sku: "",
      barcode: "",
      category: "",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "",
      unit: "un",
    })
  }

  const handleClose = () => {
    onClose()
    if (!product) resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {product ? "Atualize as informações do produto" : "Adicione um novo produto ao catálogo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do produto"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Código SKU"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Código de barras"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : product ? "Atualizar Produto" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
