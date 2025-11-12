# 🚀 GUIA RÁPIDO - Hospedar e Compartilhar o Dashboard

## ✅ Arquivos Preparados

Acabei de preparar seu projeto com os seguintes arquivos:

1. ✅ `DEPLOY_GUIDE.md` - Guia completo de deploy
2. ✅ `backend/.env.example` - Exemplo de variáveis de ambiente
3. ✅ `backend/Procfile` - Configuração para Render
4. ✅ `backend/runtime.txt` - Versão do Python
5. ✅ `src/Avaliacao.jsx` - Atualizado para usar URL dinâmica
6. ✅ `.env.example` - Variáveis de ambiente do frontend

## 🎯 OPÇÃO MAIS SIMPLES (Recomendada)

### **Passo 1: Preparar o Código**

1. Certifique-se que tudo está funcionando localmente:
   ```bash
   # Frontend
   npm install
   npm run dev
   
   # Backend (em outro terminal)
   cd backend
   python -m uvicorn app:app --reload
   ```

### **Passo 2: Criar Repositório no GitHub**

1. Crie uma conta no [GitHub](https://github.com) (se não tiver)
2. Crie um novo repositório (pode ser privado)
3. No seu terminal:
   ```bash
   git init
   git add .
   git commit -m "Primeiro commit - Dashboard pronto"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```

### **Passo 3: Hospedar o Backend (Render.com)**

1. Acesse [render.com](https://render.com) e faça login com GitHub
2. Clique em "New +" → "Web Service"
3. Selecione seu repositório
4. Configure:
   - **Name**: `meu-dashboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Clique em "Create Web Service"
6. **IMPORTANTE**: Anote a URL gerada (ex: `https://meu-dashboard-backend.onrender.com`)

### **Passo 4: Atualizar CORS no Backend**

Edite `backend/app.py`, linha ~17:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://SEU-FRONTEND.vercel.app",  # Você vai pegar essa URL no passo 5
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Passo 5: Hospedar o Frontend (Vercel.com)**

1. Crie arquivo `.env.production` na raiz do projeto:
   ```
   VITE_BACKEND_URL=https://meu-dashboard-backend.onrender.com
   ```
   (Use a URL que você anotou no Passo 3)

2. Faça commit dessa alteração:
   ```bash
   git add .
   git commit -m "Configuração de produção"
   git push
   ```

3. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
4. Clique em "Add New..." → "Project"
5. Selecione seu repositório
6. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (raiz do projeto)
   - Deixe as outras opções padrão
7. Clique em "Deploy"
8. **IMPORTANTE**: Anote a URL gerada (ex: `https://meu-dashboard.vercel.app`)

### **Passo 6: Atualizar CORS com URL do Frontend**

1. Volte ao `backend/app.py` e atualize com a URL real do Vercel:
   ```python
   allow_origins=[
       "http://localhost:5173",
       "https://meu-dashboard.vercel.app",  # URL REAL do seu Vercel
   ],
   ```

2. Faça commit e push:
   ```bash
   git add .
   git commit -m "CORS atualizado com URL do frontend"
   git push
   ```
   
   O Render vai atualizar automaticamente!

### **Passo 7: Testar e Compartilhar!**

1. Acesse a URL do Vercel no navegador
2. Teste todas as funcionalidades
3. **Compartilhe a URL com quem quiser!** 🎉

```
Seu dashboard estará disponível em:
https://meu-dashboard.vercel.app
```

## 📝 Fazendo Atualizações

Sempre que fizer alterações no código:

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

Tanto Vercel quanto Render vão atualizar automaticamente!

## ⚠️ Observações Importantes

1. **Plano Gratuito do Render**: 
   - O backend "dorme" após 15 minutos de inatividade
   - Primeira requisição após dormir pode demorar ~30 segundos

2. **Arquivo Excel**: 
   - Certifique-se que `TESTE FUZZY_REACT.xlsx` está em `/public/`

3. **Gráficos**:
   - São salvos temporariamente
   - No plano gratuito, podem ser apagados ao reiniciar

## 🆘 Problemas Comuns

**Frontend não conecta no backend:**
- Verifique se a URL em `.env.production` está correta
- Verifique se o CORS no backend tem a URL do Vercel

**Backend não inicia:**
- Verifique os logs no painel do Render
- Certifique-se que `requirements.txt` está correto

**Erro 404 ao acessar:**
- Limpe o cache do navegador
- Verifique se o deploy foi concluído com sucesso

## 💰 Custos

- **Vercel**: Gratuito para sempre
- **Render**: 
  - Plano gratuito: 750 horas/mês
  - Plano pago: $7/mês (backend fica sempre ativo)

## 🎓 Resumo do Processo

```
1. Código Local Funcionando ✅
2. GitHub Repository ✅
3. Deploy Backend (Render) ✅
4. Deploy Frontend (Vercel) ✅
5. Configurar URLs ✅
6. Testar Online ✅
7. Compartilhar! 🎉
```

---

**Precisa de ajuda?** Consulte o `DEPLOY_GUIDE.md` para mais detalhes!
