// src/middleware/auth.js  (BACKEND)
// SUBSTITUA o arquivo atual por este.
// Agora verifica idToken do Firebase em vez de JWT próprio.

import { auth } from '../services/firebase.js'
import { db, findUserById } from '../db.js'

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' })
  }

  const idToken = header.slice(7)

  try {
    // Verifica o token com Firebase Admin
    const decoded = await auth.verifyIdToken(idToken)

    // Tenta buscar o perfil do banco local (fallback para mock)
    const localUser = findUserById(decoded.uid)

    req.user = {
      id:    decoded.uid,
      email: decoded.email,
      role:  decoded.role || localUser?.role || 'cliente',
      name:  localUser?.name || decoded.name || '',
    }

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
