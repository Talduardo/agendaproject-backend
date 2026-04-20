import { Router } from 'express'
import { db, nowTime } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendPushToUser } from '../services/firebase.js'

const router = Router()

// GET /api/chat/rooms — empresa vê todas as salas
router.get('/rooms', authMiddleware, (req, res) => {
  if (req.user.role === 'empresa') return res.json(db.chatRooms)

  // Cliente vê só a própria sala
  const room = db.chatRooms.find(r => r.clientId === req.user.id)
  return res.json(room ? [room] : [])
})

// GET /api/chat/:roomId — mensagens da sala
router.get('/:roomId', authMiddleware, (req, res) => {
  const msgs = db.chatMessages[req.params.roomId] || []
  res.json(msgs)
})

// POST /api/chat/:roomId — envia mensagem
router.post('/:roomId', authMiddleware, async (req, res) => {
  const { content } = req.body
  const { roomId }  = req.params
  if (!content?.trim()) return res.status(400).json({ error: 'Mensagem vazia.' })

  const side = req.user.role === 'empresa' ? 'me' : 'them'
  const msg  = { id: String(Date.now()), side, content: content.trim(), time: nowTime() }

  if (!db.chatMessages[roomId]) db.chatMessages[roomId] = []
  db.chatMessages[roomId].push(msg)

  // Atualiza lastMsg da sala
  const room = db.chatRooms.find(r => r.id === roomId)
  if (room) { room.lastMsg = content.trim(); room.time = msg.time }

  // Notifica a outra parte via push
  const recipientId = req.user.role === 'empresa'
    ? room?.clientId
    : '1' // id da empresa

  if (recipientId) {
    await sendPushToUser(
      recipientId,
      'Nova mensagem — AgendaProject Pro',
      content.trim(),
      { type: 'chat', roomId, url: req.user.role === 'empresa' ? '/cliente/chat' : '/empresa/chat' }
    )
  }

  res.status(201).json(msg)
})

export default router
