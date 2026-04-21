// src/routes/auth.js  (BACKEND)
// SUBSTITUA o arquivo atual por este.
// Agora verifica tokens do Firebase Admin SDK.

import { Router } from 'express'
import { auth } from '../services/firebase.js'

const router = Router()

// POST /api/auth/verify
// Frontend envia o idToken do Firebase → backend verifica e retorna o perfil
router.post('/verify', async (req, res) => {
  const { idToken } = req.body
  if (!idToken) return res.status(400).json({ error: 'idToken obrigatório.' })

  try {
    const decoded = await auth.verifyIdToken(idToken)
    res.json({
      uid:   decoded.uid,
      email: decoded.email,
      role:  decoded.role || null,   // custom claim (opcional)
    })
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
})

// POST /api/auth/set-role — empresa pode definir papel de um usuário (opcional)
router.post('/set-role', async (req, res) => {
  const { uid, role } = req.body
  if (!uid || !role) return res.status(400).json({ error: 'uid e role obrigatórios.' })

  try {
    await auth.setCustomUserClaims(uid, { role })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
