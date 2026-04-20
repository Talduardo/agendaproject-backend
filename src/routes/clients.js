import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/clients — lista de pacientes (empresa)
router.get('/', authMiddleware, requireRole('empresa'), (req, res) => {
  const clients = db.users
    .filter(u => u.role === 'cliente')
    .map(u => {
      const lastAppt = db.appointments
        .filter(a => a.clientId === u.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
      return {
        id:        u.id,
        name:      u.name,
        email:     u.email,
        phone:     u.phone || '',
        lastVisit: lastAppt?.date || '—',
      }
    })
  res.json(clients)
})

// GET /api/clients/:id
router.get('/:id', authMiddleware, (req, res) => {
  const u = db.users.find(u => u.id === req.params.id)
  if (!u) return res.status(404).json({ error: 'Paciente não encontrado.' })
  res.json({ id: u.id, name: u.name, email: u.email })
})

export default router
