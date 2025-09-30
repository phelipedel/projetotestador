#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================"
echo "   FIRE ERP - Sistema de Vendas"
echo "========================================"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[1/3] Instalando dependências...${NC}"
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}ERRO: Falha ao instalar dependências!${NC}"
        echo "Verifique se o Node.js está instalado corretamente."
        exit 1
    fi
    echo ""
    echo -e "${GREEN}Dependências instaladas com sucesso!${NC}"
    echo ""
else
    echo -e "${GREEN}[1/3] Dependências já instaladas.${NC}"
    echo ""
fi

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[2/3] AVISO: Arquivo .env.local não encontrado!${NC}"
    echo ""
    echo "Por favor, configure as variáveis de ambiente do Firebase."
    echo "Copie .env.example para .env.local e preencha os valores."
    echo ""
    read -p "Pressione Enter para continuar..."
else
    echo -e "${GREEN}[2/3] Arquivo .env.local encontrado.${NC}"
    echo ""
fi

echo -e "${GREEN}[3/3] Iniciando servidor de desenvolvimento...${NC}"
echo ""
echo "========================================"
echo "  Servidor rodando em: http://localhost:3000"
echo "  PWA Mobile em: http://localhost:3000/mobile"
echo "========================================"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Iniciar o servidor Next.js
npm run dev
