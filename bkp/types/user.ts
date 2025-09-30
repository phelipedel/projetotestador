export interface User {
  uid: string
  email: string
  displayName?: string
  role: "admin" | "vendedor" | "gerente"
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface UserPermissions {
  canManageUsers: boolean
  canAccessPDV: boolean
  canAccessReports: boolean
  canManageInventory: boolean
  canManageFinancial: boolean
  canManagePurchases: boolean
}
