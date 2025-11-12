# ✅ CHECKLIST DE DEPLOY

Marque cada item conforme for completando:

## 📋 Pré-Deploy

- [ ] Código frontend funcionando localmente (`npm run dev`)
- [ ] Código backend funcionando localmente (`uvicorn app:app --reload`)
- [ ] Arquivo `TESTE FUZZY_REACT.xlsx` está em `/public/`
- [ ] Arquivo `requirements.txt` está atualizado

## 🔧 Preparação

- [ ] Conta no GitHub criada
- [ ] Repositório GitHub criado
- [ ] Código versionado no Git (`git init`, `git add .`, `git commit`)
- [ ] Push para GitHub feito (`git push`)

## 🌐 Backend (Render.com)

- [ ] Conta no Render criada
- [ ] Web Service criado
- [ ] Repositório GitHub conectado
- [ ] Root Directory configurado: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- [ ] Deploy concluído com sucesso
- [ ] URL do backend anotada: `_______________________`

## 💻 Frontend (Vercel.com)

- [ ] Conta no Vercel criada
- [ ] Arquivo `.env.production` criado com `VITE_BACKEND_URL`
- [ ] Commit e push da configuração feito
- [ ] Project criado no Vercel
- [ ] Repositório GitHub conectado
- [ ] Framework Preset: `Vite`
- [ ] Deploy concluído com sucesso
- [ ] URL do frontend anotada: `_______________________`

## 🔗 Conexões

- [ ] CORS atualizado no `backend/app.py` com URL do Vercel
- [ ] Commit e push do CORS atualizado
- [ ] Render redesployado automaticamente

## ✅ Testes Finais

- [ ] Página inicial carrega
- [ ] Dados da planilha são exibidos corretamente
- [ ] Formulário funciona
- [ ] Avaliação de projeto funciona
- [ ] Gráficos são gerados corretamente
- [ ] Download de gráfico funciona
- [ ] Navegação entre páginas funciona

## 🎉 Compartilhamento

- [ ] Testado em diferentes navegadores
- [ ] Testado em diferentes dispositivos (mobile/desktop)
- [ ] URL compartilhada com usuários
- [ ] Documentação criada (opcional)

---

## 📝 URLs Importantes

**Frontend (Vercel):**
```
https://_____________________________.vercel.app
```

**Backend (Render):**
```
https://_____________________________.onrender.com
```

**Repositório GitHub:**
```
https://github.com/___________________________
```

---

## 🚨 Em Caso de Problemas

1. Verifique os logs no painel do Render (Backend)
2. Verifique os logs no painel do Vercel (Frontend)
3. Teste localmente primeiro
4. Verifique se as URLs estão corretas
5. Verifique se o CORS está configurado
6. Limpe o cache do navegador

---

**Data do Deploy:** ___/___/______

**Versão:** 1.0.0
