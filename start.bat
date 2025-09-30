@echo off
title Fire ERP - Sistema de Vendas
color 0A

echo ========================================
echo    FIRE ERP - Sistema de Vendas
echo ========================================
echo.

REM Verificar se node_modules existe
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERRO: Falha ao instalar dependencias!
        echo Verifique se o Node.js esta instalado corretamente.
        pause
        exit /b 1
    )
    echo.
    echo Dependencias instaladas com sucesso!
    echo.
) else (
    echo [1/3] Dependencias ja instaladas.
    echo.
)

REM Verificar se .env.local existe
if not exist ".env.local" (
    echo [2/3] AVISO: Arquivo .env.local nao encontrado!
    echo.
    echo Por favor, configure as variaveis de ambiente do Firebase.
    echo Copie .env.example para .env.local e preencha os valores.
    echo.
    pause
) else (
    echo [2/3] Arquivo .env.local encontrado.
    echo.
)

echo [3/3] Iniciando servidor de desenvolvimento...
echo.
echo ========================================
echo  Servidor rodando em: http://localhost:3000
echo  PWA Mobile em: http://localhost:3000/mobile
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Iniciar o servidor Next.js
call npm run dev

pause
