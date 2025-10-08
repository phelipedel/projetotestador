"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, Plus, Edit, Trash2, Phone, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Supplier } from "@/types/database"

interface SupplierListProps {
  onAddSupplier: () => void
  onEditSupplier: (supplier: Supplier) => void
}

export function SupplierList({ onAddSupplier, onEditSupplier }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    console.log("[SUPPLIERS FIREBASE] Buscando fornecedores")
    setLoading(true)

    if (!db) {
      console.error("[SUPPLIERS FIREBASE ERROR] Firebase não configurado")
      setLoading(false)
      return
    }

    try {
      const suppliersRef = collection(db, "suppliers")
      const q = query(suppliersRef, orderBy("name", "asc"))
      const querySnapshot = await getDocs(q)

      console.log(`[SUPPLIERS FIREBASE SUCCESS] ${querySnapshot.size} fornecedores encontrados`)

      const suppliersData: Supplier[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        suppliersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Supplier)
      })

      setSuppliers(suppliersData)
    } catch (error: any) {
      console.error("[SUPPLIERS FIREBASE ERROR] Erro ao buscar fornecedores:", error)
      toast({
        title: "Erro ao carregar fornecedores",
        description: error.message || "Não foi possível carregar os fornecedores.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return

    console.log("[SUPPLIERS FIREBASE] Excluindo fornecedor:", id)

    if (!db) {
      toast({
        title: "Erro",
        description: "Firebase não configurado.",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteDoc(doc(db, "suppliers", id))
      console.log("[SUPPLIERS FIREBASE SUCCESS] Fornecedor excluído")

      setSuppliers(suppliers.filter((s) => s.id !== id))
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso.",
      })
    } catch (error: any) {
      console.error("[SUPPLIERS FIREBASE ERROR] Erro ao excluir fornecedor:", error)
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o fornecedor.",
        variant: "destructive",
      })
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.document.includes(searchTerm),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Fornecedores</CardTitle>
          <Button onClick={onAddSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou CNPJ..."
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
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum fornecedor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.document}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onEditSupplier(supplier)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id)}>
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
