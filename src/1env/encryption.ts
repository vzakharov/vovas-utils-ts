import crypto from 'crypto';

export function encrypt(plain: string, password: string) {
  const cipher = crypto.createCipheriv('aes-256-gcm', createKey(password), Buffer.alloc(16, 0));
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encrypted: string, password: string) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', createKey(password), Buffer.alloc(16, 0));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

function createKey(password: string) {
  return crypto.createHash('sha256').update(password).digest();
}