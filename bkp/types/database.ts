export interface Product {
  id: string
  name: string
  description?: string
  barcode?: string
  sku: string
  category: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  unit: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string // CPF/CNPJ
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  document: string // CNPJ
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Sale {
  id: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: "dinheiro" | "cartao_debito" | "cartao_credito" | "pix" | "boleto"
  status: "pendente" | "concluida" | "cancelada"
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  cashierId: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Purchase {
  id: string
  supplierId: string
  supplierName: string
  items: PurchaseItem[]
  subtotal: number
  discount: number
  total: number
  status: "pendente" | "recebida" | "cancelada"
  expectedDate?: Date
  receivedDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface FinancialTransaction {
  id: string
  type: "receita" | "despesa"
  category: string
  description: string
  amount: number
  date: Date
  paymentMethod?: string
  status: "pendente" | "pago" | "cancelado"
  relatedSaleId?: string
  relatedPurchaseId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CashFlow {
  id: string
  date: Date
  openingBalance: number
  closingBalance: number
  totalSales: number
  totalExpenses: number
  cashierId: string
  status: "aberto" | "fechado"
  createdAt: Date
  updatedAt: Date
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  type: "entrada" | "saida" | "ajuste"
  quantity: number
  reason: string
  relatedSaleId?: string
  relatedPurchaseId?: string
  createdAt: Date
  createdBy: string
}
