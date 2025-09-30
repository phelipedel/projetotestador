"use client"

import { useRouter } from "next/navigation"
import { ShoppingCart, Package, DollarSign, BarChart3, Users, Settings, Truck, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { user, logout } = useAuthContext()
  const router = useRouter()

  const menuItems = [
    {
      title: "PDV - Ponto de Venda",
      description: "Interface completa para vendas no desktop",
      icon: ShoppingCart,
      href: "/pdv",
      color: "text-primary",
    },
    {
      title: "Produtos",
      description: "Gerenciar catálogo de produtos",
      icon: Package,
      href: "/produtos",
      color: "text-blue-600",
    },
    {
      title: "Financeiro",
      description: "Controle financeiro e fluxo de caixa",
      icon: DollarSign,
      href: "/financeiro",
      color: "text-green-600",
    },
    {
      title: "Relatórios",
      description: "Análises e relatórios gerenciais",
      icon: BarChart3,
      href: "/relatorios",
      color: "text-purple-600",
    },
    {
      title: "Clientes",
      description: "Cadastro e gestão de clientes",
      icon: Users,
      href: "/clientes",
      color: "text-orange-600",
    },
    {
      title: "Fornecedores",
      description: "Cadastro e gestão de fornecedores",
      icon: Truck,
      href: "/fornecedores",
      color: "text-cyan-600",
    },
    {
      title: "Compras",
      description: "Controle de pedidos e recebimentos",
      icon: ShoppingBag,
      href: "/compras",
      color: "text-pink-600",
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: Settings,
      href: "/configuracoes",
      color: "text-gray-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Fire ERP</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user?.displayName || user?.email}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Escolha um módulo para começar a trabalhar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Card
                  key={item.href}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-8 w-8 ${item.color}`} />
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Acessar</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
