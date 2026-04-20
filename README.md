# AgendaProject Pro — Backend

API REST em Node.js + Express para o AgendaProject Pro.

---

## Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com seus dados

# 3. Rodar em desenvolvimento
npm run dev

# O servidor sobe em http://localhost:4000
```

**Usuários de teste:**
| E-mail | Senha | Papel |
|---|---|---|
| empresa@email.com | 123456 | empresa |
| lucas@email.com | 123456 | cliente |
| ana@email.com | 123456 | cliente |

---

## Integrar com o frontend

1. Copie o arquivo `api-frontend.js` deste repositório para `agendaproject/src/services/api.js`
2. Crie um arquivo `.env` na raiz do **frontend**:
   ```
   VITE_API_URL=http://localhost:4000
   ```
3. No `AuthContext.jsx`, altere o login para chamar a API:
   ```js
   import { authAPI } from '../services/api'
   
   const loginEmpresa = async (email, password) => {
     const { token, user } = await authAPI.login(email, password, 'empresa')
     localStorage.setItem('ap_token', token)
     login(user, 'empresa')
   }
   ```

---

## Deploy gratuito

### 🚂 Railway (recomendado — mais fácil)
1. Acesse [railway.app](https://railway.app) e crie conta com GitHub
2. Clique em **"New Project" → "Deploy from GitHub repo"**
3. Suba o backend para um repositório GitHub e selecione
4. Configure as variáveis de ambiente no painel:
   - `JWT_SECRET` — string aleatória longa
   - `FRONTEND_URL` — URL do seu frontend (Vercel)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (opcional)
5. Railway detecta o `package.json` e faz o deploy automaticamente
6. Você recebe uma URL tipo: `https://agendaproject.railway.app`

**Plano gratuito:** $5 de crédito por mês (suficiente para projetos pequenos)

---

### 🎨 Render (alternativa — 100% gratuito)
1. Acesse [render.com](https://render.com) e crie conta
2. Clique em **"New" → "Web Service"**
3. Conecte ao GitHub e selecione o repositório
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Adicione as variáveis de ambiente
6. Clique em **"Create Web Service"**

**Atenção:** No plano gratuito do Render, o servidor "dorme" após 15 min sem uso e demora ~30s para acordar.

---

### ▲ Vercel (frontend)
1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório do frontend do GitHub
3. Configure a variável de ambiente:
   - `VITE_API_URL` = URL do backend no Railway/Render
4. Deploy automático a cada push

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/login | Login (empresa ou cliente) |
| GET | /api/appointments | Lista agendamentos |
| POST | /api/appointments | Cria agendamento |
| PATCH | /api/appointments/:id/confirm | Confirma + envia push |
| DELETE | /api/appointments/:id | Cancela |
| GET | /api/appointments/available | Horários livres |
| GET | /api/services | Lista serviços |
| PATCH | /api/services/:id/toggle | Ativa/pausa serviço |
| GET | /api/clients | Lista pacientes |
| POST | /api/notifications/token | Salva token FCM |
| POST | /api/notifications/send | Envia push manual |
| GET | /api/chat/rooms | Salas de chat |
| GET | /api/chat/:roomId | Mensagens da sala |
| POST | /api/chat/:roomId | Envia mensagem + push |
| GET | /health | Status do servidor |

---

## Próximo passo: banco de dados real

Substitua o `src/db.js` por Prisma + PostgreSQL:

```bash
npm install prisma @prisma/client
npx prisma init
```

Serviços gratuitos de PostgreSQL:
- **[Supabase](https://supabase.com)** — 500MB gratuito
- **[Neon](https://neon.tech)** — 3GB gratuito
