"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Customer } from "@/types/database"

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customer?: Customer | null
}

export function AddCustomerModal({ isOpen, onClose, onSuccess, customer }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        document: customer.document || "",
        street: customer.address?.street || "",
        number: customer.address?.number || "",
        complement: customer.address?.complement || "",
        neighborhood: customer.address?.neighborhood || "",
        city: customer.address?.city || "",
        state: customer.address?.state || "",
        zipCode: customer.address?.zipCode || "",
        isActive: customer.isActive,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        document: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        isActive: true,
      })
    }
  }, [customer, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("[FIREBASE] Iniciando salvar cliente:", formData)

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
      const customerData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        document: formData.document || null,
        address: {
          street: formData.street || null,
          number: formData.number || null,
          complement: formData.complement || null,
          neighborhood: formData.neighborhood || null,
          city: formData.city || null,
          state: formData.state || null,
          zipCode: formData.zipCode || null,
        },
        isActive: formData.isActive,
        updatedAt: serverTimestamp(),
      }

      if (customer?.id) {
        console.log("[FIREBASE] Atualizando cliente com ID:", customer.id)
        const customerRef = doc(db, "customers", customer.id)
        await updateDoc(customerRef, customerData)
        console.log("[FIREBASE SUCCESS] Cliente atualizado com sucesso!")
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso!",
        })
      } else {
        console.log("[FIREBASE] Criando novo cliente")
        const docRef = await addDoc(collection(db, "customers"), {
          ...customerData,
          createdAt: serverTimestamp(),
        })
        console.log("[FIREBASE SUCCESS] Cliente criado com ID:", docRef.id)
        toast({
          title: "Sucesso",
          description: "Cliente cadastrado com sucesso!",
        })
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("[FIREBASE ERROR] Erro ao salvar cliente:", error)
      console.error("[FIREBASE ERROR] Código do erro:", error.code)
      console.error("[FIREBASE ERROR] Mensagem do erro:", error.message)
      console.error("[FIREBASE ERROR] Stack trace:", error.stack)

      toast({
        title: "Erro ao salvar cliente",
        description: error.message || "Ocorreu um erro ao salvar o cliente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <h3 className="font-semibold mb-2">Endereço</h3>
            </div>

            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                maxLength={2}
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Cliente Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : customer ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
