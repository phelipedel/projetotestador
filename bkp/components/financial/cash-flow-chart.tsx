"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface CashFlowData {
  month: string
  receitas: number
  despesas: number
  saldo: number
}

export function CashFlowChart() {
  const [data, setData] = useState<CashFlowData[]>([])
  const [period, setPeriod] = useState("6months")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCashFlowData()
  }, [period])

  const fetchCashFlowData = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API
      const mockData: CashFlowData[] = [
        { month: "Jan", receitas: 45000, despesas: 32000, saldo: 13000 },
        { month: "Fev", receitas: 52000, despesas: 35000, saldo: 17000 },
        { month: "Mar", receitas: 48000, despesas: 33000, saldo: 15000 },
        { month: "Abr", receitas: 61000, despesas: 38000, saldo: 23000 },
        { month: "Mai", receitas: 55000, despesas: 36000, saldo: 19000 },
        { month: "Jun", receitas: 67000, despesas: 41000, saldo: 26000 },
      ]
      setData(mockData)
    } catch (error) {
      console.error("Error fetching cash flow data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>Evolução das receitas, despesas e saldo</CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={formatCurrency} className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelClassName="text-foreground"
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Receitas"
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Despesas"
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                name="Saldo"
                dot={{ fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
