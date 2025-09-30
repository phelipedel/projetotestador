"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupplierList } from "@/components/suppliers/supplier-list"
import { AddSupplierModal } from "@/components/suppliers/add-supplier-modal"
import { useRouter } from "next/navigation"
import type { Supplier } from "@/types/database"

export default function FornecedoresPage() {
  const router = useRouter()
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSupplierSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowAddSupplier(true)
  }

  const handleCloseModal = () => {
    setShowAddSupplier(false)
    setEditingSupplier(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="flex items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestão de Fornecedores</h1>
            <p className="text-sm text-muted-foreground">Cadastro e gerenciamento de fornecedores</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <SupplierList
            key={refreshKey}
            onAddSupplier={() => setShowAddSupplier(true)}
            onEditSupplier={handleEditSupplier}
          />
        </div>
      </main>

      <AddSupplierModal
        isOpen={showAddSupplier}
        onClose={handleCloseModal}
        onSuccess={handleSupplierSuccess}
        supplier={editingSupplier}
      />
    </div>
  )
}
