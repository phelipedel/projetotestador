"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Plus, CreditCard as Edit, Trash2, Phone, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FirebaseStatus } from "@/components/ui/firebase-status"
import type { Customer } from "@/types/database"

interface CustomerListProps {
  onAddCustomer: () => void
  onEditCustomer: (customer: Customer) => void
}

export function CustomerList({ onAddCustomer, onEditCustomer }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    console.log("[FIREBASE] Iniciando busca de clientes")
    setLoading(true)

    if (!db) {
      console.error("[FIREBASE ERROR] Firebase não está configurado!")
      toast({
        title: "Erro",
        description: "Firebase não está configurado. Verifique as variáveis de ambiente.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      console.log("[FIREBASE] Buscando coleção 'customers'")
      const customersRef = collection(db, "customers")
      const q = query(customersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      console.log(`[FIREBASE SUCCESS] ${querySnapshot.size} clientes encontrados`)

      const customersData: Customer[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log("[FIREBASE] Cliente:", doc.id, data)
        customersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Customer)
      })

      setCustomers(customersData)
    } catch (error: any) {
      console.error("[FIREBASE ERROR] Erro ao buscar clientes:", error)
      console.error("[FIREBASE ERROR] Código do erro:", error.code)
      console.error("[FIREBASE ERROR] Mensagem do erro:", error.message)
      console.error("[FIREBASE ERROR] Stack trace:", error.stack)

      toast({
        title: "Erro ao carregar clientes",
        description: error.message || "Ocorreu um erro ao carregar os clientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return
    }

    console.log("[FIREBASE] Iniciando exclusão do cliente:", id)

    if (!db) {
      console.error("[FIREBASE ERROR] Firebase não está configurado!")
      toast({
        title: "Erro",
        description: "Firebase não está configurado.",
        variant: "destructive",
      })
      return
    }

    try {
      const customerRef = doc(db, "customers", id)
      await deleteDoc(customerRef)
      console.log("[FIREBASE SUCCESS] Cliente excluído com sucesso!")

      setCustomers(customers.filter((c) => c.id !== id))

      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      })
    } catch (error: any) {
      console.error("[FIREBASE ERROR] Erro ao excluir cliente:", error)
      console.error("[FIREBASE ERROR] Código do erro:", error.code)
      console.error("[FIREBASE ERROR] Mensagem do erro:", error.message)

      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Ocorreu um erro ao excluir o cliente.",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.document?.includes(searchTerm),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Lista de Clientes</CardTitle>
            <FirebaseStatus />
          </div>
          <Button onClick={onAddCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.document || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? "default" : "secondary"}>
                          {customer.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onEditCustomer(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
