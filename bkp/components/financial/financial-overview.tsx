"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  accountsReceivable: number
  accountsPayable: number
  cashFlow: number
  revenueGrowth: number
  expenseGrowth: number
}

export function FinancialOverview() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    cashFlow: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialMetrics()
  }, [])

  const fetchFinancialMetrics = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockData: FinancialMetrics = {
        totalRevenue: 125000,
        totalExpenses: 87500,
        netIncome: 37500,
        accountsReceivable: 25000,
        accountsPayable: 15000,
        cashFlow: 22500,
        revenueGrowth: 12.5,
        expenseGrowth: -3.2,
      }
      setMetrics(mockData)
    } catch (error) {
      console.error("Error fetching financial metrics:", error)
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

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant={metrics.revenueGrowth > 0 ? "default" : "destructive"} className="text-xs">
              {formatPercentage(metrics.revenueGrowth)}
            </Badge>
            <span>vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Total</CardTitle>
          <TrendingDown className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant={metrics.expenseGrowth < 0 ? "default" : "destructive"} className="text-xs">
              {formatPercentage(metrics.expenseGrowth)}
            </Badge>
            <span>vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <DollarSign className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.netIncome)}</div>
          <p className="text-xs text-muted-foreground">
            Margem: {((metrics.netIncome / metrics.totalRevenue) * 100).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Accounts Receivable */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
          <CreditCard className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.accountsReceivable)}</div>
          <p className="text-xs text-muted-foreground">Pendentes de recebimento</p>
        </CardContent>
      </Card>

      {/* Accounts Payable */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
          <Calendar className="h-4 w-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.accountsPayable)}</div>
          <p className="text-xs text-muted-foreground">Pendentes de pagamento</p>
        </CardContent>
      </Card>

      {/* Cash Flow */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.cashFlow)}</div>
          <p className="text-xs text-muted-foreground">Saldo atual disponível</p>
        </CardContent>
      </Card>
    </div>
  )
}
