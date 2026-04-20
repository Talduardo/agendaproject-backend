import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { findUserByEmail } from '../db.js'

const router = Router()
const SECRET = process.env.JWT_SECRET || 'dev-secret'

function makeToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, role } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios.' })

  const user = findUserByEmail(email)

  // Valida usuário e papel
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' })
  if (role && user.role !== role) return res.status(403).json({ error: `Este e-mail não tem acesso como ${role}.` })

  // Senha simples (em produção use bcrypt)
  if (user.password !== password) return res.status(401).json({ error: 'Senha incorreta.' })

  const token = makeToken(user)
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
})

// POST /api/auth/empresa/login  (atalho compatível com o frontend)
router.post('/empresa/login', (req, res) => {
  req.body.role = 'empresa'
  router.handle({ ...req, url: '/login', method: 'POST' }, res, () => {})
})

// POST /api/auth/cliente/login
router.post('/cliente/login', (req, res) => {
  req.body.role = 'cliente'
  router.handle({ ...req, url: '/login', method: 'POST' }, res, () => {})
})

export default router
