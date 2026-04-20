// src/services/api.js  (FRONTEND)
// Substitua o arquivo src/services/api.js do agendaproject pelo conteúdo abaixo.
// Crie também um arquivo .env na raiz do frontend com:
//   VITE_API_URL=http://localhost:4000   (dev)
//   VITE_API_URL=https://sua-url.railway.app  (produção)

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() {
  return localStorage.getItem('ap_token') || ''
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password, role) =>
    request('POST', '/api/auth/login', { email, password, role }),
}

// ── AGENDAMENTOS ──────────────────────────────────────────────
export const appointmentsAPI = {
  list:      (date)             => request('GET',    `/api/appointments${date ? `?date=${date}` : ''}`),
  available: (date, serviceId)  => request('GET',    `/api/appointments/available?date=${date}&serviceId=${serviceId}`),
  create:    (data)             => request('POST',   '/api/appointments', data),
  confirm:   (id)               => request('PATCH',  `/api/appointments/${id}/confirm`),
  update:    (id, data)         => request('PATCH',  `/api/appointments/${id}`, data),
  cancel:    (id)               => request('DELETE', `/api/appointments/${id}`),
}

// ── SERVIÇOS ──────────────────────────────────────────────────
export const servicesAPI = {
  list:   ()       => request('GET',   '/api/services'),
  toggle: (id)     => request('PATCH', `/api/services/${id}/toggle`),
  create: (data)   => request('POST',  '/api/services', data),
  update: (id, data) => request('PATCH', `/api/services/${id}`, data),
}

// ── CLIENTES ──────────────────────────────────────────────────
export const clientsAPI = {
  list: () => request('GET', '/api/clients'),
  get:  (id) => request('GET', `/api/clients/${id}`),
}

// ── NOTIFICAÇÕES ──────────────────────────────────────────────
export const notificationsAPI = {
  saveToken: (token) =>
    request('POST', '/api/notifications/token', { token }),
  send: (appointmentId, message) =>
    request('POST', '/api/notifications/send', { appointmentId, message }),
}

// ── CHAT ──────────────────────────────────────────────────────
export const chatAPI = {
  rooms:    ()           => request('GET',  '/api/chat/rooms'),
  messages: (roomId)     => request('GET',  `/api/chat/${roomId}`),
  send:     (roomId, content) => request('POST', `/api/chat/${roomId}`, { content }),
}
