import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let messaging = null
let auth = null

export function initFirebase() {
  if (admin.apps.length) return

  try {
    let credential

    // Opção A: arquivo serviceAccountKey.json
    const keyPath = resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json')
    if (existsSync(keyPath)) {
      const sa = JSON.parse(readFileSync(keyPath, 'utf8'))
      credential = admin.credential.cert(sa)
      console.log('[Firebase] ✓ Usando serviceAccountKey.json')
    }
    // Opção B: variáveis de ambiente (Render)
    else if (process.env.FIREBASE_PROJECT_ID) {
      credential = admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })
      console.log('[Firebase] ✓ Usando variáveis de ambiente')
    } else {
      console.warn('[Firebase] ⚠ Sem credenciais — push e auth desativados')
      return
    }

    admin.initializeApp({ credential })
    
    // Inicializa os serviços
    messaging = admin.messaging()
    auth = admin.auth() 
    
  } catch (err) {
    console.error('[Firebase] Erro ao inicializar:', err.message)
  }
}

// Exporta as instâncias para uso em outros arquivos (como auth.js)
export { auth, messaging }

export async function sendPush(token, title, body, data = {}) {
  if (!messaging) return null
  try {
    const id = await messaging.send({
      token,
      notification: { title, body },
      data: { ...data },
      webpush: {
        headers: { Urgency: 'high' },
        notification: { icon: '/logo.png', requireInteraction: true },
        fcmOptions: { link: data.url || '/' },
      },
      android: { priority: 'high' },
      apns:    { payload: { aps: { sound: 'default', badge: 1 } } },
    })
    console.log(`[FCM] ✓ Push enviado — ${id}`)
    return id
  } catch (err) {
    console.error('[FCM] Erro:', err.message)
    return null
  }
}

export async function sendPushToUser(userId, title, body, data = {}) {
  const { getTokens } = await import('../db.js')
  const tokens = getTokens(userId)
  if (!tokens.length) return
  await Promise.allSettled(tokens.map(t => sendPush(t, title, body, data)))
}
