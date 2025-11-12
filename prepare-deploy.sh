#!/bin/bash

echo "🚀 Preparando projeto para deploy..."

# 1. Build do frontend
echo "📦 Fazendo build do frontend..."
npm install
npm run build

echo "✅ Build do frontend concluído!"

# 2. Verificar requirements.txt
echo "📋 Verificando dependências do backend..."
cd backend

if [ ! -f "requirements.txt" ]; then
    echo "❌ Arquivo requirements.txt não encontrado!"
    exit 1
fi

echo "✅ Dependências verificadas!"

# 3. Instruções finais
echo ""
echo "========================================="
echo "✅ Projeto preparado para deploy!"
echo "========================================="
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Frontend (Vercel):"
echo "   - Execute: vercel"
echo "   - Ou faça push para GitHub e conecte no painel do Vercel"
echo ""
echo "2. Backend (Render):"
echo "   - Faça push para GitHub"
echo "   - Conecte o repositório no painel do Render"
echo "   - Configure Root Directory: backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn app:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "3. Atualize a URL do backend:"
echo "   - Crie arquivo .env.production com:"
echo "   - VITE_BACKEND_URL=https://seu-backend.onrender.com"
echo ""
echo "4. Atualize o CORS no backend/app.py com a URL do Vercel"
echo ""
echo "========================================="
