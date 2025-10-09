"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { Customer } from "@/types/database"

interface CustomerSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectCustomer: (customer: Customer) => void
}

export function CustomerSearchModal({ isOpen, onClose, onSelectCustomer }: CustomerSearchModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
    }
  }, [isOpen])

  const fetchCustomers = async () => {
    console.log("[CUSTOMER SEARCH] Buscando clientes ativos")
    setLoading(true)

    if (!db) {
      console.error("[CUSTOMER SEARCH ERROR] Firebase não configurado")
      toast({
        title: "Erro",
        description: "Firebase não está configurado.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const customersRef = collection(db, "customers")
      const querySnapshot = await getDocs(customersRef)

      console.log(`[CUSTOMER SEARCH] ${querySnapshot.size} clientes encontrados`)

      const customersData: Customer[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        customersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Customer)
      })

      customersData.sort((a, b) => a.name.localeCompare(b.name))

      console.log(`[CUSTOMER SEARCH SUCCESS] ${customersData.length} clientes carregados`)
      setCustomers(customersData)
    } catch (error: any) {
      console.error("[CUSTOMER SEARCH ERROR] Erro ao buscar clientes:", error)
      toast({
        title: "Erro ao carregar clientes",
        description: error.message || "Não foi possível carregar os clientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    console.log("[CUSTOMER SEARCH] Cliente selecionado:", customer.name)
    onSelectCustomer(customer)
    onClose()
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.document?.includes(searchTerm)
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail, telefone ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email || "-"}</TableCell>
                          <TableCell>{customer.phone || "-"}</TableCell>
                          <TableCell>{customer.document || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => handleSelectCustomer(customer)}>
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length} cliente(s) encontrado(s)
            </p>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
