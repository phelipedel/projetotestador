"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialOverview } from "@/components/financial/financial-overview"
import { TransactionList } from "@/components/financial/transaction-list"
import { AddTransactionModal } from "@/components/financial/add-transaction-modal"
import { CashFlowChart } from "@/components/financial/cash-flow-chart"
import { useRouter } from "next/navigation"

export default function FinanceiroPage() {
  const router = useRouter()
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTransactionSuccess = () => {
    setRefreshKey((prev) => prev + 1)
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
            <h1 className="text-2xl font-bold text-primary">Gestão Financeira</h1>
            <p className="text-sm text-muted-foreground">Controle completo das finanças da empresa</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Financial Overview */}
          <FinancialOverview key={refreshKey} />

          {/* Tabs */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionList key={refreshKey} onAddTransaction={() => setShowAddTransaction(true)} />
            </TabsContent>

            <TabsContent value="cashflow" className="space-y-6">
              <CashFlowChart />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Relatórios financeiros em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  )
}
