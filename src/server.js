import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initFirebase } from './services/firebase.js'
import { startCron } from './services/cron.js'
import authRoutes          from './routes/auth.js'
import appointmentRoutes   from './routes/appointments.js'
import servicesRoutes      from './routes/services.js'
import clientsRoutes       from './routes/clients.js'
import notificationsRoutes from './routes/notifications.js'
import chatRoutes          from './routes/chat.js'

const app  = express()
const PORT = process.env.PORT || 4000

// ── MIDDLEWARES ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// Log de requisições
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ${req.method} ${req.path}`)
  next()
})

// ── ROTAS ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/appointments',  appointmentRoutes)
app.use('/api/services',      servicesRoutes)
app.use('/api/clients',       clientsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/chat',          chatRoutes)

// Health check — Railway e Render usam isso para saber se o app está vivo
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  app:    'AgendaProject Pro',
  ts:     new Date().toISOString(),
}))

app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }))

// ── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║      AgendaProject Pro — Backend         ║
║      http://localhost:${PORT}               ║
╚══════════════════════════════════════════╝

  Rotas disponíveis:
  POST  /api/auth/login
  GET   /api/appointments
  POST  /api/appointments
  PATCH /api/appointments/:id/confirm
  GET   /api/services
  GET   /api/clients
  POST  /api/notifications/token
  POST  /api/notifications/send
  GET   /api/chat/rooms
  GET   /api/chat/:roomId
  POST  /api/chat/:roomId
  GET   /health
`)
  initFirebase()
  startCron()
})
