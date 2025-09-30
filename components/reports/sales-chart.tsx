"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface SalesData {
  period: string
  vendas: number
  receita: number
}

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])
  const [period, setPeriod] = useState("7days")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [period])

  const fetchSalesData = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API
      const mockData: SalesData[] = [
        { period: "Seg", vendas: 45, receita: 4500 },
        { period: "Ter", vendas: 52, receita: 5200 },
        { period: "Qua", vendas: 48, receita: 4800 },
        { period: "Qui", vendas: 61, receita: 6100 },
        { period: "Sex", vendas: 55, receita: 5500 },
        { period: "Sáb", vendas: 67, receita: 6700 },
        { period: "Dom", vendas: 43, receita: 4300 },
      ]
      setData(mockData)
    } catch (error) {
      console.error("Error fetching sales data:", error)
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
            <CardTitle>Evolução de Vendas</CardTitle>
            <CardDescription>Vendas e receita por período</CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "vendas" ? value : formatCurrency(value),
                  name === "vendas" ? "Vendas" : "Receita",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="vendas" fill="hsl(var(--chart-1))" name="Vendas" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="receita" fill="hsl(var(--chart-2))" name="Receita" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
