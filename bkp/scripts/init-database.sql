-- Fire ERP Database Initialization Script
-- This script creates the initial collections structure in Firestore
-- Note: Firestore is NoSQL, so this is a reference for the data structure

-- Users Collection
-- Document ID: Firebase Auth UID
-- Fields: email, displayName, role, createdAt, updatedAt, isActive

-- Products Collection
-- Document ID: Auto-generated
-- Fields: name, description, barcode, sku, category, price, costPrice, stock, minStock, unit, isActive, createdAt, updatedAt, createdBy

-- Customers Collection  
-- Document ID: Auto-generated
-- Fields: name, email, phone, document, address (object), isActive, createdAt, updatedAt, createdBy

-- Suppliers Collection
-- Document ID: Auto-generated  
-- Fields: name, email, phone, document, address (object), isActive, createdAt, updatedAt, createdBy

-- Sales Collection
-- Document ID: Auto-generated
-- Fields: customerId, customerName, items (array), subtotal, discount, total, paymentMethod, status, notes, createdAt, updatedAt, createdBy, cashierId

-- Purchases Collection
-- Document ID: Auto-generated
-- Fields: supplierId, supplierName, items (array), subtotal, discount, total, status, expectedDate, receivedDate, notes, createdAt, updatedAt, createdBy

-- Financial Transactions Collection
-- Document ID: Auto-generated
-- Fields: type, category, description, amount, date, paymentMethod, status, relatedSaleId, relatedPurchaseId, createdAt, updatedAt, createdBy

-- Cash Flow Collection
-- Document ID: Auto-generated
-- Fields: date, openingBalance, closingBalance, totalSales, totalExpenses, cashierId, status, createdAt, updatedAt

-- Inventory Movements Collection
-- Document ID: Auto-generated
-- Fields: productId, productName, type, quantity, reason, relatedSaleId, relatedPurchaseId, createdAt, createdBy

-- Create indexes for better query performance
-- Note: These would be created in Firestore console or via Firebase CLI

-- Products indexes:
-- - isActive, name (ascending)
-- - category, isActive (ascending)
-- - stock (ascending) for low stock alerts

-- Sales indexes:
-- - createdAt (descending) for recent sales
-- - cashierId, createdAt (descending)
-- - status, createdAt (descending)

-- Financial Transactions indexes:
-- - type, date (descending)
-- - createdBy, date (descending)
-- - status, date (descending)

-- Inventory Movements indexes:
-- - productId, createdAt (descending)
-- - type, createdAt (descending)
