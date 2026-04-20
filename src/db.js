// src/db.js
// Banco de dados em memória.
// Para produção: substitua por Prisma + PostgreSQL (Supabase ou Neon — ambos gratuitos).

export const db = {
  users: [
    { id: '1', name: 'AgendaProject Pro', email: 'empresa@email.com', password: '123456', role: 'empresa' },
    { id: '2', name: 'Lucas Martins',     email: 'lucas@email.com',   password: '123456', role: 'cliente' },
    { id: '3', name: 'Ana Costa',         email: 'ana@email.com',     password: '123456', role: 'cliente' },
  ],

  fcmTokens: [],
  // Estrutura: { userId, token, createdAt }

  appointments: [
    { id: '1', clientId: '2', clientName: 'Lucas Martins', svc: 'Exame de Rotina', serviceId: '4', date: '2026-04-20', time: '17:30', status: 'confirmed', doctor: 'Dr. Henrique' },
    { id: '2', clientId: '3', clientName: 'Ana Costa',     svc: 'Dermatologia',    serviceId: '3', date: '2026-04-20', time: '09:00', status: 'confirmed', doctor: 'Dra. Lara'    },
    { id: '3', clientId: '2', clientName: 'Lucas Martins', svc: 'Cardiologia',     serviceId: '2', date: '2026-04-25', time: '10:00', status: 'scheduled', doctor: 'Dr. Renato'   },
  ],

  services: [
    { id: '1', name: 'Consulta Geral',  duration: '30 min', price: 120, active: true  },
    { id: '2', name: 'Cardiologia',     duration: '45 min', price: 200, active: true  },
    { id: '3', name: 'Dermatologia',    duration: '40 min', price: 180, active: true  },
    { id: '4', name: 'Exame de Rotina', duration: '20 min', price: 80,  active: true  },
    { id: '5', name: 'Teleatendimento', duration: '20 min', price: 90,  active: false },
  ],

  chatRooms: [
    { id: 'room_lucas', clientId: '2', clientName: 'Lucas Martins', lastMsg: 'Sua consulta está confirmada.', time: '09:00', unread: 0 },
    { id: 'room_ana',   clientId: '3', clientName: 'Ana Costa',     lastMsg: 'Pode remarcar minha consulta?', time: '14:32', unread: 2 },
  ],

  chatMessages: {
    room_lucas: [
      { id: '1', side: 'them', content: 'Olá Lucas! Sua consulta está confirmada para amanhã às 17:30.', time: '09:00' },
      { id: '2', side: 'them', content: 'Lembre-se de trazer seus exames anteriores.',                    time: '09:01' },
    ],
    room_ana: [
      { id: '1', side: 'them', content: 'Boa tarde! Preciso remarcar minha consulta de amanhã.', time: '14:32' },
      { id: '2', side: 'me',   content: 'Claro, qual horário prefere?',                          time: '14:35' },
    ],
  },
}

// ── Helpers ───────────────────────────────────────────────────
export const findUserById    = (id)    => db.users.find(u => u.id === id)
export const findUserByEmail = (email) => db.users.find(u => u.email === email)
export const getTokens       = (userId) => db.fcmTokens.filter(t => t.userId === userId).map(t => t.token)

export function nowTime() {
  const d = new Date()
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
