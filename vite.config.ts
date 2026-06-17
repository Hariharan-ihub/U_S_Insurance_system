import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import dns from 'node:dns';

// Force Node.js process to use Google DNS to bypass Windows DNS SRV resolver bugs
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables from .env
dotenv.config();

const proxyMode = process.env.VITE_PROXY_MODE || 'local';
const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://hariharansihub_db_user:Smarthari1432@organizationatlascluste.y63pnxl.mongodb.net/';
const dbName = (process.env.DATABASE_NAME || 'insurance_records').trim();
const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
const integrationToken = process.env.VITE_INTEGRATION_TOKEN || jwtSecret;

// ============================================
// Native Cryptography Helpers (Zero Dependency)
// ============================================

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  let padded = str.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) {
    padded += '=';
  }
  return Buffer.from(padded, 'base64').toString();
}

function signJwt(payload: any, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${h}.${p}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${h}.${p}.${signature}`;
}

function verifyJwt(token: string, secret: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${h}.${p}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(base64urlDecode(p));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function verifyPassword(password: string, storedPasswordHash: string): boolean {
  try {
    const parts = storedPasswordHash.split(':');
    const salt = parts[0];
    const originalHash = parts[1];
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  } catch (e) {
    return false;
  }
}

function getSaltAndParams(storedHash: string) {
  try {
    if (storedHash.startsWith('$argon2')) {
      const parts = storedHash.split('$');
      const algorithm = parts[1];
      const version = parseInt(parts[2].split('=')[1] || '19', 10);
      const params: any = {};
      parts[3].split(',').forEach((p) => {
        const [k, v] = p.split('=');
        params[k] = parseInt(v, 10);
      });
      return {
        algorithm,
        version,
        salt: parts[4],
        m: params.m,
        t: params.t,
        p: params.p,
      };
    } else if (storedHash.includes(':')) {
      const parts = storedHash.split(':');
      return {
        algorithm: 'pbkdf2',
        salt: parts[0],
      };
    }
  } catch (e) {
    console.error('Error parsing stored password hash:', e);
  }
  return null;
}

function decryptPayload(base64Data: string, keyString: string): any {
  try {
    const rawData = Buffer.from(base64Data, 'base64');
    const iv = rawData.subarray(0, 12);
    const encrypted = rawData.subarray(12);

    // Hash keyString to get 256-bit key
    const key = crypto.createHash('sha256').update(keyString).digest();

    // In AES-GCM, the last 16 bytes is the auth tag
    const authTag = encrypted.subarray(encrypted.length - 16);
    const ciphertext = encrypted.subarray(0, encrypted.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (e) {
    console.error('Payload decryption failed:', e);
    return null;
  }
}

let mongoClient: MongoClient | null = null;

async function getDb() {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
  }
  return mongoClient.db(dbName);
}

// Helper to parse JSON body from request
function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Connect middleware plugin for Vite
const localBackendPlugin = () => ({
  name: 'local-backend-proxy',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = new URL(req.url, 'http://localhost');

      // Intercept both /webhook/ and /webhook-test/ paths
      if (!url.pathname.startsWith('/webhook/') && !url.pathname.startsWith('/webhook-test/')) {
        return next();
      }

      // Normalize pathname to use '/webhook/' for local matching
      let pathname = url.pathname;
      if (pathname.startsWith('/webhook-test/')) {
        pathname = pathname.replace('/webhook-test/', '/webhook/');
      }

      // If in live proxy mode, only forward the LOGIN endpoint to the live gateway,
      // and handle the other endpoints (session, refresh, verify, dashboard) locally!
      if (proxyMode === 'live') {
        const liveEndpoints = [
          // '/webhook/auth/login',
          '/webhook/auth/opaque/login',
          '/webhook/webhook/auth/verify',
          '/webhook/webhook/auth/logout',
          '/webhook/webhook/auth/refresh',
        ];
        if (liveEndpoints.includes(pathname)) {
          return next();
        }
      }

      res.setHeader('Content-Type', 'application/json');

      try {
        const db = await getDb();
        // SALT/PARAMS LOOKUP ENDPOINT
        if (pathname === '/webhook/auth/salt') {
          let email = '';
          if (req.method === 'POST') {
            const body = await parseBody(req);
            email = body.email;
          } else {
            email = url.searchParams.get('email') || '';
          }

          if (!email) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Email is required' }));
          }

          const member = await db.collection('members').findOne({ email: email.toLowerCase() });

          if (!member) {
            // Return a dummy PBKDF2 salt to prevent email enumeration
            return res.end(JSON.stringify({
              success: true,
              algorithm: 'pbkdf2',
              salt: '1a8c87ad92c59b3625aa998f3a767b95'
            }));
          }

          const info = getSaltAndParams(member.password_hash);
          if (!info) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: 'Invalid stored password hash format' }));
          }

          return res.end(JSON.stringify({
            success: true,
            ...info
          }));
        }

        // 1. LOGIN WORKFLOW (WF-1)
        if (pathname === '/webhook/auth/login' && req.method === 'POST') {
          const body = await parseBody(req);
          let email = body.email;
          let password = body.password;

          // Decrypt password if encrypted, fallback to plain text if decryption fails
          if (password) {
            const decryptedPassword = decryptPayload(password, integrationToken);
            if (decryptedPassword !== null) {
              password = decryptedPassword;
            }
          }

          if (!email || !password) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Email and password are required' }));
          }

          const member = await db.collection('members').findOne({ email: email.toLowerCase() });

          if (!member) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: 'INVALID_CREDENTIALS', message: 'No member profile found with this email' }));
          }

          const passwordMatch = verifyPassword(password, member.password_hash);
          if (!passwordMatch) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' }));
          }

          // Find existing active session in DB for this member
          let session = await db.collection('active_sessions').findOne({ member_id: member.member_id });
          let sessionId: string;

          if (session) {
            sessionId = session.session_id;
          } else {
            // Fallback: if no session exists, dynamically create one to avoid lockouts
            sessionId = crypto.randomUUID();
            await db.collection('active_sessions').insertOne({
              session_id: sessionId,
              member_id: member.member_id,
              status: 'active',
              channel: 'web',
              started_at: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
              member_context: {
                member_id: member.member_id,
                name: `${member.first_name} ${member.last_name}`,
                authenticated: true,
                verification_level: 'full'
              },
              ttl_expire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
          }

          const accessToken = signJwt(
            { member_id: member.member_id, email: member.email, session_id: sessionId, exp: Math.floor(Date.now() / 1000) + 15 * 60 },
            jwtSecret
          );
          const refreshToken = signJwt(
            { member_id: member.member_id, session_id: sessionId, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
            jwtSecret
          );

          // Generate a user_token for iframe chat authentication
          const userToken = signJwt(
            { sub: member.member_id, member_id: member.member_id, name: `${member.first_name} ${member.last_name}`, session_id: sessionId, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
            integrationToken
          );

          return res.end(JSON.stringify({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
            user_token: userToken,
            expires_in: 900,
            session_id: sessionId,
            member: {
              member_id: member.member_id,
              first_name: member.first_name,
              last_name: member.last_name,
              email: member.email,
              phone: member.phone,
              enrollment_status: member.enrollment_status,
              group_id: member.group_id,
              state: member.state
            }
          }));
        }

        // 2. TOKEN REFRESH WORKFLOW (WF-2)
        if (pathname === '/webhook/auth/refresh' && req.method === 'POST') {
          const { refresh_token } = await parseBody(req);

          if (!refresh_token) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Refresh token is required' }));
          }

          try {
            const decoded = verifyJwt(refresh_token, jwtSecret);
            if (!decoded) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'TOKEN_EXPIRED', message: 'Refresh token has expired or is invalid' }));
            }

            const session = await db.collection('active_sessions').findOne({ session_id: decoded.session_id });

            if (!session) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'SESSION_REVOKED', message: 'Session has been revoked or expired' }));
            }

            const newAccessToken = signJwt(
              { member_id: decoded.member_id, session_id: decoded.session_id, exp: Math.floor(Date.now() / 1000) + 15 * 60 },
              jwtSecret
            );

            await db.collection('active_sessions').updateOne(
              { session_id: decoded.session_id },
              { $set: { updated_at: new Date() } }
            );

            return res.end(JSON.stringify({
              success: true,
              access_token: newAccessToken,
              expires_in: 900,
              session_id: decoded.session_id
            }));
          } catch (err) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: 'TOKEN_EXPIRED', message: 'Refresh token has expired' }));
          }
        }

        // 3. LOGOUT WORKFLOW (WF-3)
        if (pathname === '/webhook/auth/logout' && req.method === 'POST') {
          // No DB status edits per user instructions
          return res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
        }

        // 4. SESSION VERIFY WORKFLOW (WF-4)
        if (pathname === '/webhook/auth/verify' && req.method === 'POST') {
          const { access_token } = await parseBody(req);

          if (!access_token) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Access token is required' }));
          }

          try {
            const decoded = verifyJwt(access_token, jwtSecret);
            if (!decoded) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'SESSION_EXPIRED', message: 'Token expired or invalid' }));
            }
            const member = await db.collection('members').findOne({ member_id: decoded.member_id });
            const session = await db.collection('active_sessions').findOne({ session_id: decoded.session_id });

            if (!member || !session) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ success: false, error: 'SESSION_EXPIRED', message: 'Session expired or invalid' }));
            }

            return res.end(JSON.stringify({
              success: true,
              session_id: decoded.session_id,
              member: {
                member_id: member.member_id,
                first_name: member.first_name,
                last_name: member.last_name,
                email: member.email,
                phone: member.phone,
                enrollment_status: member.enrollment_status,
                group_id: member.group_id,
                state: member.state
              }
            }));
          } catch (err) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: 'SESSION_EXPIRED', message: 'Token verification failed' }));
          }
        }

        // 5. MEMBER DASHBOARD WORKFLOW (WF-5)
        if (pathname === '/webhook/member/dashboard' && req.method === 'POST') {
          const { member_id } = await parseBody(req);

          if (!member_id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Member ID is required' }));
          }

          const policy = await db.collection('policies').findOne({ member_id, policy_status: 'active' });
          const billing = await db.collection('billing').findOne({ member_id });
          const claims = await db.collection('claims').find({ member_id }).sort({ service_date: -1 }).limit(5).toArray();
          const idCard = await db.collection('digital_id_cards').findOne({ member_id });
          const notifications = await db.collection('notification_history').find({ member_id }).sort({ sent_at: -1 }).limit(5).toArray();

          return res.end(JSON.stringify({
            success: true,
            policy: policy || {
              plan_name: 'FlexChoice PPO Silver',
              plan_type: 'PPO',
              metal_tier: 'Silver',
              policy_status: 'active',
              premium: 440.11,
              deductible: 2552.00,
              effective_date: '2023-08-02',
              renewal_date: '2026-10-02'
            },
            billing: billing || {
              premium_amount: 440.11,
              due_date: '2026-07-01',
              payment_status: 'pending',
              deductible_used: 607.61,
              deductible_remaining: 1944.39,
              oop_used: 683.82,
              oop_remaining: 5816.18
            },
            recent_claims: claims.map(c => ({
              claim_id: c.claim_id,
              claim_type: c.care_event?.service || 'Medical Service',
              status: c.claim_outcome?.approved ? 'approved' : 'denied',
              billed_amount: c.care_event?.cost || 100,
              service_date: c.created_at || c.updated_at || new Date()
            })),
            id_card: idCard || {
              member_name: 'Brandon White',
              policy_number: 'POL-579692622',
              group_number: 'GRP-86805',
              plan_name: 'FlexChoice PPO Silver'
            },
            notifications: notifications.map(n => ({
              notification_id: n.notification_id,
              type: n.type || 'policy_renewal',
              subject: n.subject || 'Notification update',
              status: n.status || 'sent',
              sent_at: n.created_at || new Date()
            }))
          }));
        }

        // 5b. MEMBER POLICY WORKFLOW
        if (pathname === '/webhook/member/policy' && req.method === 'POST') {
          const { member_id } = await parseBody(req);

          if (!member_id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Member ID is required' }));
          }

          const policy = await db.collection('policies').findOne({ member_id, policy_status: 'active' });
          const billing = await db.collection('billing').findOne({ member_id });

          return res.end(JSON.stringify({
            success: true,
            policy: policy || {
              plan_name: 'FlexChoice PPO Silver',
              plan_type: 'PPO',
              metal_tier: 'Silver',
              policy_status: 'active',
              premium: 440.11,
              deductible: 2552.00,
              effective_date: '2023-08-02',
              renewal_date: '2026-10-02'
            },
            billing: billing || {
              deductible_used: 607.61,
              deductible_remaining: 1944.39,
              oop_used: 683.82,
              oop_remaining: 5816.18
            }
          }));
        }

        // 5c. MEMBER CLAIMS WORKFLOW
        if (pathname === '/webhook/member/claims' && req.method === 'POST') {
          const { member_id } = await parseBody(req);

          if (!member_id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Member ID is required' }));
          }

          const claims = await db.collection('claims').find({ member_id }).sort({ service_date: -1 }).toArray();

          return res.end(JSON.stringify({
            success: true,
            claims: claims.map(c => ({
              claim_id: c.claim_id,
              type: c.claim_type || 'Medical Service',
              provider: c.hospital_name || 'General Provider',
              status: c.status || 'pending',
              amount: c.billed_amount || 0,
              date: c.service_date || c.created_at || new Date().toISOString()
            }))
          }));
        }

        // 5d. MEMBER BILLING WORKFLOW
        if (pathname === '/webhook/member/billing' && req.method === 'POST') {
          const { member_id } = await parseBody(req);

          if (!member_id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Member ID is required' }));
          }

          const billing = await db.collection('billing').findOne({ member_id });

          if (!billing) {
            return res.end(JSON.stringify({
              success: true,
              billing: {
                premium_amount: 440.11,
                due_date: '2026-07-01',
                payment_status: 'pending',
                deductible_used: 607.61,
                deductible_remaining: 1944.39,
                oop_used: 683.82,
                oop_remaining: 5816.18
              },
              transactions: [
                { id: 'TXN-90123', amount: 440.11, date: '2026-05-01', method: 'Bank Account (ACH)', status: 'cleared' },
                { id: 'TXN-78901', amount: 440.11, date: '2026-04-01', method: 'Bank Account (ACH)', status: 'cleared' },
                { id: 'TXN-56789', amount: 440.11, date: '2026-03-01', method: 'Bank Account (ACH)', status: 'cleared' },
                { id: 'TXN-34567', amount: 440.11, date: '2026-02-01', method: 'Credit Card', status: 'cleared' }
              ]
            }));
          }

          const transactions = (billing.payment_history || []).map((t: any, index: number) => ({
            id: `TXN-${10000 + index}`,
            amount: t.amount || billing.premium_amount,
            date: t.date || new Date().toISOString(),
            method: t.method === 'credit_card' ? 'Credit Card' : t.method === 'check' ? 'Bank Account (ACH)' : t.method || 'Bank Account (ACH)',
            status: t.status === 'completed' ? 'cleared' : t.status || 'cleared'
          }));

          return res.end(JSON.stringify({
            success: true,
            billing: {
              premium_amount: billing.premium_amount,
              due_date: billing.due_date,
              payment_status: billing.payment_status,
              deductible_used: billing.deductible_used,
              deductible_remaining: billing.deductible_remaining,
              oop_used: billing.oop_used,
              oop_remaining: billing.oop_remaining,
              auto_pay: billing.auto_pay,
              payment_method: billing.payment_method
            },
            transactions
          }));
        }

        // 6. SESSION CHECK/LOOKUP WORKFLOW (WF-Session)
        if (pathname === '/webhook/session' && req.method === 'POST') {
          const { session_id, action } = await parseBody(req);

          if (!session_id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, message: 'Session ID is required' }));
          }

          if (action === 'clear') {
            await db.collection('active_sessions').updateOne(
              { session_id },
              { $set: { conversation: [], module: null, intent: null, current_module: null, current_intent: null, updated_at: new Date() } }
            );
            return res.end(JSON.stringify({
              success: true,
              message: 'Session conversation cleared successfully'
            }));
          }

          const session = await db.collection('active_sessions').findOne({ session_id });

          if (!session) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, message: 'Session not found' }));
          }

          return res.end(JSON.stringify({
            success: true,
            session_data: session
          }));
        }

        // Catch-all 404 for unhandled webhooks
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, message: `Webhook ${url.pathname} not implemented locally` }));

      } catch (err: any) {
        console.error('Local proxy middleware error:', err);
        res.statusCode = 500;
        return res.end(JSON.stringify({ success: false, error: 'INTERNAL_SERVER_ERROR', message: err.message }));
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localBackendPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: proxyMode === 'live' ? {
      '/webhook': {
        target: 'https://api.agents.snsihub.ai',
        changeOrigin: true,
        secure: false,
      },
      '/webhook-test': {
        target: 'https://api.agents.snsihub.ai',
        changeOrigin: true,
        secure: false,
      }
    } : undefined
  },
});
