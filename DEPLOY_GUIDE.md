# 🚀 Guia de Deploy - Dashboard de Gestão de Projetos

Este guia explica como hospedar e compartilhar seu dashboard online.

## 📦 Estrutura do Projeto

- **Frontend**: React + Vite (pasta raiz)
- **Backend**: FastAPI + Python (pasta `backend/`)

---

## 🌐 OPÇÃO 1: Deploy Gratuito (Recomendado)

### **1. Frontend no Vercel**

#### Passo 1: Criar conta no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub

#### Passo 2: Preparar o código
```bash
# Certifique-se de que o projeto está funcionando localmente
npm install
npm run build
```

#### Passo 3: Deploy
1. Instale o Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Faça deploy:
   ```bash
   vercel
   ```

3. Siga as instruções e anote a URL gerada (ex: `https://meu-dashboard.vercel.app`)

#### Configuração importante:
No arquivo `vite.config.js`, certifique-se de ter:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',
})
```

---

### **2. Backend no Render**

#### Passo 1: Criar conta no Render
1. Acesse [render.com](https://render.com)
2. Faça login com GitHub

#### Passo 2: Preparar o repositório
1. Crie um repositório no GitHub com seu projeto
2. Faça commit dos arquivos (incluindo `requirements.txt`, `Procfile`, `runtime.txt`)

#### Passo 3: Deploy no Render
1. No Render, clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: meu-dashboard-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

4. Clique em "Create Web Service"
5. Anote a URL gerada (ex: `https://meu-dashboard-backend.onrender.com`)

#### Passo 4: Configurar variáveis de ambiente
No painel do Render, adicione:
- `ENVIRONMENT=production`

---

### **3. Conectar Frontend e Backend**

#### No Frontend:
Edite o arquivo que faz chamadas ao backend (provavelmente `src/Avaliacao.jsx`):

**Antes:**
```javascript
const response = await fetch('http://localhost:8000/avaliar', {
```

**Depois:**
```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const response = await fetch(`${BACKEND_URL}/avaliar`, {
```

Crie arquivo `.env.production`:
```
VITE_BACKEND_URL=https://meu-dashboard-backend.onrender.com
```

#### No Backend:
Atualize o arquivo `backend/app.py`, na configuração CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://meu-dashboard.vercel.app",  # Adicione sua URL do Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔄 Atualizações Futuras

### Frontend (Vercel):
```bash
# Faça suas alterações no código
git add .
git commit -m "Suas alterações"
git push

# Vercel fará deploy automático
```

### Backend (Render):
```bash
# Faça suas alterações no código
git add .
git commit -m "Suas alterações"
git push

# Render fará deploy automático
```

---

## 📱 Compartilhando com Usuários

Após o deploy, compartilhe a URL do frontend (Vercel):
```
https://meu-dashboard.vercel.app
```

Os usuários poderão acessar direto pelo navegador, sem instalar nada!

---

## 🐳 OPÇÃO 2: Deploy com Docker (Avançado)

Se preferir usar Docker, posso criar os arquivos `Dockerfile` e `docker-compose.yml`.

---

## ⚠️ Observações Importantes

1. **Arquivo Excel**: O arquivo `TESTE FUZZY_REACT.xlsx` precisa estar na pasta `public/` do frontend
2. **Gráficos**: Configure armazenamento persistente no Render ou use serviço de storage (S3, Cloudinary)
3. **Plano Gratuito Render**: O backend pode "dormir" após inatividade (demora ~30s para acordar)
4. **Limites**: Verifique os limites dos planos gratuitos

---

## 🆘 Precisa de Ajuda?

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- FastAPI Deploy: https://fastapi.tiangolo.com/deployment/

---

## 📝 Checklist de Deploy

- [ ] Backend funcionando localmente
- [ ] Frontend funcionando localmente
- [ ] Arquivo `requirements.txt` atualizado
- [ ] Arquivo `Procfile` criado
- [ ] CORS configurado corretamente
- [ ] URLs de produção configuradas
- [ ] Variáveis de ambiente configuradas
- [ ] Repositório GitHub criado
- [ ] Deploy no Render (backend)
- [ ] Deploy no Vercel (frontend)
- [ ] Testar aplicação online
