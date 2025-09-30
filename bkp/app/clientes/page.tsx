"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomerList } from "@/components/customers/customer-list"
import { AddCustomerModal } from "@/components/customers/add-customer-modal"
import { useRouter } from "next/navigation"
import type { Customer } from "@/types/database"

export default function ClientesPage() {
  const router = useRouter()
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCustomerSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowAddCustomer(true)
  }

  const handleCloseModal = () => {
    setShowAddCustomer(false)
    setEditingCustomer(null)
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
            <h1 className="text-2xl font-bold text-primary">Gestão de Clientes</h1>
            <p className="text-sm text-muted-foreground">Cadastro e gerenciamento de clientes</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <CustomerList
            key={refreshKey}
            onAddCustomer={() => setShowAddCustomer(true)}
            onEditCustomer={handleEditCustomer}
          />
        </div>
      </main>

      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={handleCloseModal}
        onSuccess={handleCustomerSuccess}
        customer={editingCustomer}
      />
    </div>
  )
}
