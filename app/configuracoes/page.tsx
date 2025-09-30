"use client"

import { useState } from "react"
import { ArrowLeft, Building, Users, Bell, Shield, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [companyData, setCompanyData] = useState({
    name: "Minha Empresa Ltda",
    document: "12.345.678/0001-90",
    email: "contato@minhaempresa.com.br",
    phone: "(11) 3456-7890",
  })

  const [notifications, setNotifications] = useState({
    lowStock: true,
    newSales: true,
    financialAlerts: true,
  })

  const handleSaveCompany = () => {
    console.log("Saving company data:", companyData)
  }

  const handleSaveNotifications = () => {
    console.log("Saving notifications:", notifications)
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
            <h1 className="text-2xl font-bold text-primary">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="empresa" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="empresa">
                <Building className="h-4 w-4 mr-2" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="usuarios">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="notificacoes">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="seguranca">
                <Shield className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="sistema">
                <Database className="h-4 w-4 mr-2" />
                Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresa">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Informações básicas da sua empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="companyName">Razão Social</Label>
                      <Input
                        id="companyName"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyDocument">CNPJ</Label>
                      <Input
                        id="companyDocument"
                        value={companyData.document}
                        onChange={(e) => setCompanyData({ ...companyData, document: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Telefone</Label>
                      <Input
                        id="companyPhone"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveCompany}>Salvar Alterações</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usuarios">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <CardDescription>Controle de acesso e permissões</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Notificações</CardTitle>
                  <CardDescription>Configure quando você deseja ser notificado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lowStock">Alertas de Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações quando produtos estiverem com estoque baixo
                      </p>
                    </div>
                    <Switch
                      id="lowStock"
                      checked={notifications.lowStock}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newSales">Novas Vendas</Label>
                      <p className="text-sm text-muted-foreground">Receba notificações sobre novas vendas realizadas</p>
                    </div>
                    <Switch
                      id="newSales"
                      checked={notifications.newSales}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, newSales: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="financialAlerts">Alertas Financeiros</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre contas a pagar e receber
                      </p>
                    </div>
                    <Switch
                      id="financialAlerts"
                      checked={notifications.financialAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, financialAlerts: checked })}
                    />
                  </div>
                  <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguranca">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>Configurações de segurança e autenticação</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sistema">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>Versão e configurações técnicas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versão:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco de Dados:</span>
                    <span className="font-medium">Cloud Firestore</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autenticação:</span>
                    <span className="font-medium">Firebase Auth</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
