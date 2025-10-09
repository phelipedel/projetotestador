# Regras de Segurança do Firestore

Este arquivo contém as regras de segurança recomendadas para o Firebase Firestore do Fire ERP.

## Como Aplicar as Regras

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** > **Regras**
4. Cole as regras abaixo
5. Clique em **Publicar**

## Regras Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Função auxiliar para verificar se o usuário é o dono do documento
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Produtos - Leitura para autenticados, escrita apenas para admins
    match /products/{productId} {
      // Permitir leitura para todos os usuários autenticados
      allow read: if isAuthenticated();

      // Permitir criação, atualização e exclusão para usuários autenticados
      // Em produção, você pode querer restringir isso apenas para admins
      allow create, update, delete: if isAuthenticated();
    }

    // Clientes - Leitura e escrita para autenticados
    match /customers/{customerId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Fornecedores - Leitura e escrita para autenticados
    match /suppliers/{supplierId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Vendas - Leitura e escrita para autenticados
    match /sales/{saleId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      // Não permitir atualização ou exclusão de vendas por segurança
      allow update, delete: if false;
    }

    // Transações Financeiras - Leitura e escrita para autenticados
    match /financial_transactions/{transactionId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Compras - Leitura e escrita para autenticados
    match /purchases/{purchaseId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Bloquear acesso a qualquer outra coleção não especificada
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Regras Mais Restritivas (Para Produção)

Se você quiser ter controle mais granular, use estas regras que implementam um sistema de roles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOperator() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'operator'];
    }

    // Usuários - Cada um pode ler apenas seus próprios dados
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Produtos - Operadores podem ler, apenas admins podem modificar
    match /products/{productId} {
      allow read: if isOperator();
      allow create, update, delete: if isAdmin();
    }

    // Clientes - Operadores podem ler e criar, admins podem modificar
    match /customers/{customerId} {
      allow read, create: if isOperator();
      allow update, delete: if isAdmin();
    }

    // Fornecedores - Operadores podem ler, admins podem modificar
    match /suppliers/{supplierId} {
      allow read: if isOperator();
      allow create, update, delete: if isAdmin();
    }

    // Vendas - Operadores podem criar e ler, ninguém pode deletar
    match /sales/{saleId} {
      allow read: if isOperator();
      allow create: if isOperator();
      allow update, delete: if false; // Vendas são imutáveis
    }

    // Transações Financeiras - Apenas admins
    match /financial_transactions/{transactionId} {
      allow read, create, update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Estrutura de Roles

Para usar o sistema de roles, você precisa criar uma coleção `users` com a seguinte estrutura:

```javascript
// Documento em /users/{uid}
{
  email: "usuario@exemplo.com",
  displayName: "Nome do Usuário",
  role: "admin", // ou "operator" ou "viewer"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Roles Disponíveis

- **admin**: Acesso total ao sistema
- **operator**: Pode operar o PDV, gerenciar produtos e clientes
- **viewer**: Apenas visualização de relatórios

## Testando as Regras

Depois de aplicar as regras:

1. Faça logout e login novamente no sistema
2. Tente acessar o PDV
3. Tente cadastrar um produto
4. Verifique os logs do console do navegador

Se houver erros de permissão, você verá mensagens como:
```
[FIREBASE ERROR] Missing or insufficient permissions
```

## Troubleshooting

### Erro: "Missing or insufficient permissions"

**Causa:** As regras de segurança estão bloqueando o acesso

**Solução:**
1. Verifique se o usuário está autenticado
2. Verifique se as regras foram aplicadas corretamente
3. Use as regras básicas primeiro (sem sistema de roles)

### Produtos não aparecem no PDV

**Causa:** Regras podem estar bloqueando a leitura

**Solução:**
1. Use as regras básicas fornecidas acima
2. Verifique se `allow read: if isAuthenticated();` está presente

### Não consigo criar vendas

**Causa:** Regras podem estar bloqueando a escrita

**Solução:**
1. Verifique se `allow create: if isAuthenticated();` está na coleção `sales`
2. Verifique se o usuário está autenticado

## Regras de Desenvolvimento (TEMPORÁRIAS)

**⚠️ APENAS PARA DESENVOLVIMENTO - NUNCA USE EM PRODUÇÃO**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Esta regra permite que qualquer usuário autenticado leia e escreva em qualquer coleção. É útil para desenvolvimento, mas **MUITO INSEGURA** para produção.

## Próximos Passos

1. Aplique as regras básicas primeiro
2. Teste o sistema completamente
3. Quando estiver pronto para produção, migre para as regras com sistema de roles
4. Crie a coleção `users` e atribua roles aos usuários
5. Monitore os logs de segurança no Console do Firebase
