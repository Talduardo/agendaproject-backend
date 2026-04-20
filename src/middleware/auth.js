import jwt from 'jsonwebtoken'
import { findUserById } from '../db.js'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret')
    req.user = findUserById(payload.userId) || { id: payload.userId, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: `Acesso restrito a: ${roles.join(', ')}.` })
    }
    next()
  }
}
