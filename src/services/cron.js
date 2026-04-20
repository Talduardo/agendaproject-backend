import cron from 'node-cron'
import { db, getTokens } from '../db.js'
import { sendPush } from './firebase.js'

export function startCron() {
  // Roda a cada 15 minutos e envia push para consultas na próxima 1 hora
  cron.schedule('*/15 * * * *', async () => {
    const now     = new Date()
    const target  = new Date(now.getTime() + 60 * 60 * 1000) // +1h
    const todayYMD = now.toISOString().slice(0, 10)
    const targetH  = String(target.getHours()).padStart(2, '0')
    const targetM  = String(target.getMinutes()).padStart(2, '0')

    const upcoming = db.appointments.filter(a => {
      if (a.status !== 'confirmed' || a.date !== todayYMD) return false
      const [h, m] = a.time.split(':')
      return h === targetH && Math.abs(parseInt(m) - parseInt(targetM)) <= 15
    })

    if (!upcoming.length) return
    console.log(`[Cron] ${upcoming.length} lembretes a enviar...`)

    for (const appt of upcoming) {
      const tokens = getTokens(appt.clientId)
      for (const token of tokens) {
        await sendPush(
          token,
          'Lembrete de consulta — AgendaProject Pro',
          `${appt.clientName}, sua consulta de ${appt.svc} é às ${appt.time}. Até logo!`,
          { appointmentId: appt.id, type: 'reminder', url: '/cliente/agendamentos' }
        )
      }
      console.log(`[Cron] ✓ Lembrete → ${appt.clientName} às ${appt.time}`)
    }
  })

  console.log('[Cron] ✓ Agendador iniciado (a cada 15 min)')
}
