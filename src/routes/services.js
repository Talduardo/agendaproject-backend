import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/services — público (cliente precisa ver os serviços disponíveis)
router.get('/', (req, res) => {
  res.json(db.services)
})

// POST /api/services — empresa cria serviço
router.post('/', authMiddleware, requireRole('empresa'), (req, res) => {
  const svc = { id: String(Date.now()), active: true, ...req.body }
  db.services.push(svc)
  res.status(201).json(svc)
})

// PATCH /api/services/:id/toggle — ativa ou pausa
router.patch('/:id/toggle', authMiddleware, requireRole('empresa'), (req, res) => {
  const svc = db.services.find(s => s.id === req.params.id)
  if (!svc) return res.status(404).json({ error: 'Serviço não encontrado.' })
  svc.active = !svc.active
  res.json(svc)
})

// PATCH /api/services/:id — edita serviço
router.patch('/:id', authMiddleware, requireRole('empresa'), (req, res) => {
  const svc = db.services.find(s => s.id === req.params.id)
  if (!svc) return res.status(404).json({ error: 'Serviço não encontrado.' })
  Object.assign(svc, req.body)
  res.json(svc)
})

// DELETE /api/services/:id
router.delete('/:id', authMiddleware, requireRole('empresa'), (req, res) => {
  const idx = db.services.findIndex(s => s.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Serviço não encontrado.' })
  db.services.splice(idx, 1)
  res.json({ ok: true })
})

export default router
