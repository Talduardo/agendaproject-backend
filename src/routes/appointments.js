import { Router } from 'express'
import { db, getTokens, nowTime } from '../db.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { sendPushToUser } from '../services/firebase.js'

const router = Router()

const ALL_SLOTS  = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00']

// GET /api/appointments — empresa vê todos; cliente vê só os seus
router.get('/', authMiddleware, (req, res) => {
  const { date } = req.query
  let list = db.appointments

  if (req.user.role === 'cliente') {
    list = list.filter(a => a.clientId === req.user.id)
  }
  if (date) {
    list = list.filter(a => a.date === date)
  }

  // Adiciona flag upcoming para o cliente
  const today = new Date().toISOString().slice(0, 10)
  list = list.map(a => ({ ...a, upcoming: a.date >= today && a.status !== 'cancelled' }))

  res.json(list.sort((a, b) => a.time.localeCompare(b.time)))
})

// GET /api/appointments/available — horários livres para um dia/serviço
router.get('/available', authMiddleware, (req, res) => {
  const { date, serviceId } = req.query
  const taken = db.appointments
    .filter(a => a.date === date && a.serviceId === serviceId && a.status !== 'cancelled')
    .map(a => a.time)
  res.json({ slots: ALL_SLOTS, taken })
})

// POST /api/appointments — cria agendamento
router.post('/', authMiddleware, async (req, res) => {
  const { serviceId, date, time, status, clientName } = req.body
  const svc = db.services.find(s => s.id === serviceId)

  const appt = {
    id:         String(Date.now()),
    clientId:   req.user.id,
    clientName: clientName || req.user.name,
    svc:        svc?.name || 'Consulta',
    serviceId:  serviceId || '1',
    date, time,
    status:     status || 'scheduled',
    doctor:     'Dr. Henrique',
    createdAt:  new Date().toISOString(),
  }
  db.appointments.push(appt)

  // Notifica a empresa sobre novo agendamento
  await sendPushToUser('1',
    'Novo agendamento — AgendaProject Pro',
    `${appt.clientName} agendou ${appt.svc} para ${date} às ${time}.`,
    { type: 'new_appointment', url: '/empresa' }
  )

  res.status(201).json(appt)
})

// PATCH /api/appointments/:id/confirm — empresa confirma
router.patch('/:id/confirm', authMiddleware, requireRole('empresa'), async (req, res) => {
  const appt = db.appointments.find(a => a.id === req.params.id)
  if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado.' })

  appt.status = 'confirmed'

  // Push para o paciente
  await sendPushToUser(appt.clientId,
    'Consulta confirmada! ✓',
    `${appt.clientName}, sua consulta de ${appt.svc} às ${appt.time} foi confirmada.`,
    { type: 'confirmed', appointmentId: appt.id, url: '/cliente/agendamentos' }
  )

  res.json(appt)
})

// PATCH /api/appointments/:id — atualiza status/dados
router.patch('/:id', authMiddleware, (req, res) => {
  const appt = db.appointments.find(a => a.id === req.params.id)
  if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado.' })

  // Cliente só pode alterar os próprios
  if (req.user.role === 'cliente' && appt.clientId !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão.' })
  }

  Object.assign(appt, req.body)
  res.json(appt)
})

// DELETE /api/appointments/:id — cancela/remove
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = db.appointments.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Agendamento não encontrado.' })

  if (req.user.role === 'cliente' && db.appointments[idx].clientId !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão.' })
  }

  db.appointments.splice(idx, 1)
  res.json({ ok: true })
})

export default router
