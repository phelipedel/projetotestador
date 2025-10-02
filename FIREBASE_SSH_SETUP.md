# Configuração Firebase e SSH

Este projeto usa Firebase para autenticação e banco de dados, e suporta conexões SSH para execução de comandos remotos.

## Configuração do Firebase

### 1. Criar um projeto Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar seu projeto

### 2. Configurar Authentication

1. No Firebase Console, vá para "Authentication"
2. Clique em "Começar"
3. Ative o método "E-mail/Senha"

### 3. Configurar Firestore Database

1. No Firebase Console, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção ou teste
4. Selecione a localização mais próxima

### 4. Obter as credenciais do Firebase

#### Para o Frontend (Client):

1. No Firebase Console, vá para "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique em "Web" (ícone </>)
4. Registre seu app e copie as configurações
5. Adicione as variáveis no arquivo `.env`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

#### Para o Backend (Admin SDK):

1. No Firebase Console, vá para "Configurações do projeto" > "Contas de serviço"
2. Clique em "Gerar nova chave privada"
3. Um arquivo JSON será baixado
4. Extraia as seguintes informações do arquivo:
   - `project_id`
   - `client_email`
   - `private_key`
5. Adicione as variáveis no arquivo `.env`:

```
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu_projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua_chave_aqui\n-----END PRIVATE KEY-----\n"
```

**Importante:** A `FIREBASE_PRIVATE_KEY` deve incluir `\n` para quebras de linha.

## Configuração do SSH

### 1. Configurar o servidor SSH

Certifique-se de que o servidor remoto tem SSH habilitado e está acessível.

### 2. Configurar as credenciais SSH

Adicione as seguintes variáveis no arquivo `.env`:

#### Usando senha:

```
SSH_HOST=seu_servidor.com
SSH_PORT=22
SSH_USER=seu_usuario
SSH_PASSWORD=sua_senha
```

#### Usando chave privada:

```
SSH_HOST=seu_servidor.com
SSH_PORT=22
SSH_USER=seu_usuario
SSH_PRIVATE_KEY_PATH=/caminho/para/sua/chave/privada
```

### 3. Usando o SSH no código

#### No Backend (API Routes):

```typescript
import { createSSHClient } from "@/lib/ssh-client"

const client = createSSHClient()
await client.connect()

// Executar comando
const result = await client.executeCommand("ls -la")
console.log(result.stdout)

// Listar diretório
const files = await client.listDirectory("/home")

// Upload de arquivo
await client.uploadFile("/local/file.txt", "/remote/file.txt")

// Download de arquivo
await client.downloadFile("/remote/file.txt", "/local/file.txt")

client.disconnect()
```

#### No Frontend (usando hook):

```typescript
import { useSSH } from "@/hooks/use-ssh"

function MyComponent() {
  const { executeCommand, loading, error } = useSSH()

  const handleCommand = async () => {
    const result = await executeCommand("ls -la")
    if (result) {
      console.log(result.stdout)
    }
  }

  return (
    <button onClick={handleCommand} disabled={loading}>
      Executar Comando
    </button>
  )
}
```

## APIs SSH Disponíveis

### POST /api/ssh/execute
Executa um comando SSH remoto.

Payload:
```json
{
  "command": "ls -la"
}
```

Resposta:
```json
{
  "success": true,
  "stdout": "...",
  "stderr": "...",
  "exitCode": 0
}
```

### POST /api/ssh/upload
Envia um arquivo para o servidor remoto.

Payload:
```json
{
  "localPath": "/local/file.txt",
  "remotePath": "/remote/file.txt"
}
```

### POST /api/ssh/download
Baixa um arquivo do servidor remoto.

Payload:
```json
{
  "remotePath": "/remote/file.txt",
  "localPath": "/local/file.txt"
}
```

### POST /api/ssh/list
Lista arquivos em um diretório remoto.

Payload:
```json
{
  "remotePath": "/home"
}
```

Resposta:
```json
{
  "success": true,
  "files": [...]
}
```

## Segurança

1. **NUNCA** commite o arquivo `.env` no repositório
2. Use variáveis de ambiente em produção
3. Mantenha as chaves privadas seguras
4. Use conexões SSH com chaves em vez de senhas quando possível
5. Restrinja o acesso SSH apenas aos IPs necessários

## Executar o projeto

```bash
npm install
npm run dev
```

O projeto estará disponível em http://localhost:3000
