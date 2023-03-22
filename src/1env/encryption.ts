import crypto from 'crypto';

export function decrypt(encrypted: string, key: string) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.alloc(16, 0));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export function encrypt(plain: string, key: string) {
  const cipher = crypto.createCipheriv('aes-256-gcm', key, Buffer.alloc(16, 0));
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}