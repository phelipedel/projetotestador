# 🔥 Fire ERP - Sistema de Vendas

Sistema completo de gestão empresarial (ERP) com foco em vendas rápidas, controle de estoque, gestão financeira e PDV mobile.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visão geral de vendas, estoque e finanças
- **PDV (Ponto de Venda)**: Interface rápida para vendas
- **PDV Mobile (PWA)**: Aplicativo mobile para vendas offline
- **Gestão de Produtos**: Controle completo de estoque
- **Gestão de Clientes**: Cadastro e histórico de clientes
- **Gestão Financeira**: Controle de receitas e despesas
- **Relatórios**: Análises e gráficos de vendas
- **Multi-usuário**: Sistema de autenticação com Firebase

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou pnpm
- Conta no Firebase (gratuita)

## 🔧 Instalação Rápida

### Windows

1. Extraia o projeto
2. Execute `start.bat`
3. O script irá:
   - Instalar todas as dependências automaticamente
   - Verificar configurações
   - Iniciar o servidor

### Linux/Mac

1. Extraia o projeto
2. Dê permissão de execução: `chmod +x start.sh`
3. Execute: `./start.sh`
4. O script irá:
   - Instalar todas as dependências automaticamente
   - Verificar configurações
   - Iniciar o servidor

### Instalação Manual

\`\`\`bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Firebase

# Iniciar servidor de desenvolvimento
npm run dev
\`\`\`

## 🔑 Configuração do Firebase

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga o assistente de criação

### 2. Obter Credenciais Web

1. No Firebase Console, vá em **Configurações do Projeto** (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone **</>** (Web)
4. Registre seu app
5. Copie as credenciais do `firebaseConfig`

### 3. Obter Credenciais Admin (para API)

1. No Firebase Console, vá em **Configurações do Projeto**
2. Clique na aba **Contas de Serviço**
3. Clique em **Gerar nova chave privada**
4. Um arquivo JSON será baixado
5. Abra o arquivo e copie:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### 4. Configurar Autenticação

1. No Firebase Console, vá em **Authentication**
2. Clique em **Começar**
3. Ative o método **E-mail/senha**

### 5. Configurar Firestore Database

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Modo de produção**
4. Selecione a localização (ex: southamerica-east1)

### 6. Configurar Regras de Segurança

No Firestore, vá em **Regras** e adicione:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

### 7. Adicionar Variáveis de Ambiente

Edite o arquivo `.env.local` com suas credenciais:

\`\`\`env
# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Firebase Admin SDK (para API routes)
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu_projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_chave_privada_aqui\n-----END PRIVATE KEY-----\n"
\`\`\`

## 🌐 Acessando o Sistema

Após iniciar o servidor:

- **Sistema Web**: http://localhost:3000
- **PDV Mobile (PWA)**: http://localhost:3000/mobile
- **Login**: http://localhost:3000/login

### Primeiro Acesso

1. Acesse http://localhost:3000/login
2. Clique em "Criar conta"
3. Cadastre-se com e-mail e senha
4. Faça login

## 📱 Instalando o PWA Mobile

### No Celular

1. Acesse http://SEU_IP:3000/mobile no navegador do celular
2. No Chrome/Edge: Toque no menu (⋮) → "Adicionar à tela inicial"
3. No Safari (iOS): Toque em Compartilhar → "Adicionar à Tela de Início"

### Descobrir seu IP local

**Windows**: Execute `ipconfig` no CMD e procure por "IPv4"
**Linux/Mac**: Execute `ifconfig` ou `ip addr` no terminal

## 🏗️ Estrutura do Projeto

\`\`\`
fire-erp/
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard principal
│   ├── pdv/              # Ponto de Venda
│   ├── mobile/           # PWA Mobile
│   ├── produtos/         # Gestão de produtos
│   ├── clientes/         # Gestão de clientes
│   ├── financeiro/       # Gestão financeira
│   └── relatorios/       # Relatórios
├── components/            # Componentes React
│   ├── auth/             # Autenticação
│   ├── inventory/        # Estoque
│   ├── financial/        # Financeiro
│   ├── pdv/              # PDV
│   └── ui/               # Componentes UI (shadcn)
├── lib/                   # Utilitários
│   ├── firebase.ts       # Config Firebase Client
│   └── firebase-admin.ts # Config Firebase Admin
├── public/               # Arquivos estáticos
│   ├── manifest.json     # Manifest PWA
│   └── sw.js            # Service Worker
└── scripts/              # Scripts SQL
\`\`\`

## 🛠️ Scripts Disponíveis

\`\`\`bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
\`\`\`

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. Instale a CLI da Vercel: `npm i -g vercel`
2. Execute: `vercel`
3. Siga as instruções
4. Adicione as variáveis de ambiente no dashboard da Vercel

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🔒 Segurança

- Nunca commite o arquivo `.env.local`
- Mantenha suas chaves privadas seguras
- Configure regras de segurança adequadas no Firestore
- Use HTTPS em produção

## 📝 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique se o Firebase está configurado corretamente
3. Consulte a documentação do Firebase
4. Verifique os logs do console do navegador

## 🎯 Roadmap

- [ ] Integração com impressoras térmicas
- [ ] Relatórios em PDF
- [ ] Backup automático
- [ ] Multi-loja
- [ ] Integração com marketplaces
