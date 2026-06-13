/**
 * Password hashing using the browser's native Web Crypto API and WebAssembly Argon2.
 *
 * Matches the exact format stored in the `members.password_hash` field:
 *   - PBKDF2: "salt_hex:hash_hex"
 *   - Argon2id: "$argon2id$v=19$m=19456,t=2,p=1$salt$hash"
 */

// --- Helpers ---

/** Convert an ArrayBuffer / Uint8Array to a lowercase hex string. */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}



/** Convert a base64 string to a Uint8Array. */
function base64ToBytes(base64: string): Uint8Array {
  let standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (standardBase64.length % 4) {
    standardBase64 += '=';
  }
  const binaryString = window.atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// --- Public API ---

/**
 * Hashes a password dynamically by fetching salt/hashing configuration for the user email.
 * Supports both Argon2id and PBKDF2 to match the DB.
 */
export async function hashPassword(password: string, email: string): Promise<string> {
  try {
    let config: any = null;
    try {
      const token = import.meta.env.VITE_INTEGRATION_TOKEN;
      const res = await window.fetch(`/webhook/auth/salt?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-integration-token': token } : {})
        }
      });
      if (res.ok) {
        config = await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch salt configuration, using fallback:', e);
    }

    if (config && config.success && config.algorithm === 'argon2id') {
      const { argon2id } = await import('hash-wasm');
      const saltBytes = base64ToBytes(config.salt);
      const hash = await argon2id({
        password,
        salt: saltBytes,
        iterations: config.t || 2,
        memorySize: config.m || 19456,
        parallelism: config.p || 1,
        hashLength: 32,
        outputType: 'encoded'
      });
      return hash;
    }

    // Default Fallback / PBKDF2
    const saltHex = (config && config.success && config.salt) || '1a8c87ad92c59b3625aa998f3a767b95';
    const enc = new TextEncoder();
    const saltForPbkdf2 = enc.encode(saltHex);

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltForPbkdf2,
        iterations: 1000,
        hash: 'SHA-512',
      },
      keyMaterial,
      512
    );

    const hashHex = bufferToHex(derivedBits);
    return `${saltHex}:${hashHex}`;
  } catch (e) {
    console.error('Password hashing failed:', e);
    throw new Error('Cryptographic password hashing error');
  }
}
