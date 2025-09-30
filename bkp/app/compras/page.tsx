"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PurchaseList } from "@/components/purchases/purchase-list"
import { AddPurchaseModal } from "@/components/purchases/add-purchase-modal"
import { useRouter } from "next/navigation"

export default function ComprasPage() {
  const router = useRouter()
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePurchaseSuccess = () => {
    setRefreshKey((prev) => prev + 1)
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
            <h1 className="text-2xl font-bold text-primary">Gestão de Compras</h1>
            <p className="text-sm text-muted-foreground">Controle de pedidos e recebimento de mercadorias</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <PurchaseList key={refreshKey} onAddPurchase={() => setShowAddPurchase(true)} />
        </div>
      </main>

      <AddPurchaseModal
        isOpen={showAddPurchase}
        onClose={() => setShowAddPurchase(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}
