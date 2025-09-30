"use client"

import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesOverview } from "@/components/reports/sales-overview"
import { SalesChart } from "@/components/reports/sales-chart"
import { CategoryChart } from "@/components/reports/category-chart"
import { TopProductsTable } from "@/components/reports/top-products-table"
import { CashFlowChart } from "@/components/financial/cash-flow-chart"
import { FinancialOverview } from "@/components/financial/financial-overview"
import { InventoryOverview } from "@/components/inventory/inventory-overview"
import { useRouter } from "next/navigation"

export default function RelatoriosPage() {
  const router = useRouter()

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting reports...")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Relatórios e Análises</h1>
              <p className="text-sm text-muted-foreground">Business Intelligence e indicadores de desempenho</p>
            </div>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatórios
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="vendas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            </TabsList>

            {/* Sales Reports */}
            <TabsContent value="vendas" className="space-y-6">
              <SalesOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart />
                <CategoryChart />
              </div>
              <TopProductsTable />
            </TabsContent>

            {/* Financial Reports */}
            <TabsContent value="financeiro" className="space-y-6">
              <FinancialOverview />
              <CashFlowChart />
            </TabsContent>

            {/* Inventory Reports */}
            <TabsContent value="estoque" className="space-y-6">
              <InventoryOverview />
            </TabsContent>

            {/* General Overview */}
            <TabsContent value="geral" className="space-y-6">
              <SalesOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart />
                <CashFlowChart />
              </div>
              <FinancialOverview />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
