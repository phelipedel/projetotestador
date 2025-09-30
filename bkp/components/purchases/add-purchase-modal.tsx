"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

interface AddPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPurchaseModal({ isOpen, onClose, onSuccess }: AddPurchaseModalProps) {
  const [supplierId, setSupplierId] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { productId: "", productName: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Creating purchase:", { supplierId, expectedDate, items, discount, notes, total })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error creating purchase:", error)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Fornecedor *</Label>
              <Select value={supplierId} onValueChange={setSupplierId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Distribuidora ABC Ltda</SelectItem>
                  <SelectItem value="2">Fornecedor XYZ S.A.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expectedDate">Data Prevista</Label>
              <Input
                id="expectedDate"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Itens da Compra</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Input
                    placeholder="Nome do produto"
                    value={item.productName}
                    onChange={(e) => updateItem(index, "productName", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <Input value={formatCurrency(item.total)} disabled />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">Desconto</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Total</Label>
              <Input value={formatCurrency(total)} disabled className="font-bold" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a compra"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || items.length === 0}>
              {loading ? "Salvando..." : "Criar Compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
