import * as crypto from 'crypto';

export interface EncryptedEnvelope {
  ciphertext: string;
  iv: string;
  tag: string;
  salt: string;
}

export class CryptoUtils {
  private static ITERATIONS = 100000;
  private static KEY_LENGTH = 32; // 256 bits for AES-256
  private static ALGORITHM = 'aes-256-gcm';

  /**
   * Generates a cryptographically secure random 256-bit symmetric key (DEK).
   */
  public static generateDEK(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Derives a key using PBKDF2 from a password/phrase and salt.
   */
  public static deriveKey(secret: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      secret,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    );
  }

  /**
   * Encrypts plain text using the DEK.
   */
  public static encrypt(text: string, dekHex: string): EncryptedEnvelope {
    const key = Buffer.from(dekHex, 'hex');
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv) as crypto.CipherGCM;
    let ciphertext = cipher.update(text, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  /**
   * Decrypts ciphertext using the DEK.
   */
  public static decrypt(envelope: EncryptedEnvelope, dekHex: string): string {
    const key = Buffer.from(dekHex, 'hex');
    const iv = Buffer.from(envelope.iv, 'hex');
    const tag = Buffer.from(envelope.tag, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
