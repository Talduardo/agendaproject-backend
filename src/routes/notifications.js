import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { sendPushToUser, sendPush } from '../services/firebase.js'

const router = Router()

// POST /api/notifications/token — salva token FCM do dispositivo
router.post('/token', authMiddleware, (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token FCM obrigatório.' })

  const userId = req.user.id
  const exists = db.fcmTokens.find(t => t.token === token && t.userId === userId)
  if (!exists) {
    db.fcmTokens.push({ userId, token, createdAt: new Date().toISOString() })
    console.log(`[FCM] Token salvo para userId=${userId}`)
  }
  res.json({ ok: true })
})

// POST /api/notifications/send — empresa envia push manual para um paciente
router.post('/send', authMiddleware, requireRole('empresa'), async (req, res) => {
  const { appointmentId, message, clientId } = req.body

  let targetId = clientId
  if (appointmentId && !clientId) {
    const appt = db.appointments.find(a => a.id === appointmentId)
    if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado.' })
    targetId = appt.clientId
  }

  if (!targetId) return res.status(400).json({ error: 'Informe appointmentId ou clientId.' })

  await sendPushToUser(
    targetId,
    'AgendaProject Pro',
    message || 'Você tem uma mensagem da clínica.',
    { type: 'manual', url: '/cliente/agendamentos' }
  )

  res.json({ ok: true })
})

export default router
